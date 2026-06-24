import type {
  CategoryId,
  Mood,
  MessageMetadata,
  ReferralCategory,
  Tone,
  Urgency,
  UserState,
  WaleefReply,
} from "./types";
import { CATEGORIES, getCategory } from "./categories";
import { detectCrisis } from "./crisis";
import {
  FOLLOWUP_REPLIES,
  QUICK_RELIEF,
  RESPONSES,
} from "./responses";

// ─────────────────────────────────────────────────────────────
// Waleef mock AI engine.
//
// Two public functions, per spec:
//   detectUserState(message, metadata) → UserState
//   generateWaleefReply(state, message) → WaleefReply
//
// This is a deterministic, rule-based placeholder for a real model.
// It is intentionally conservative and safety-first.
// ─────────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

// Phrases that signal the user is rushed → Quick Relief Mode.
const QUICK_RELIEF_TRIGGERS = [
  "بسرعه",
  "بسرعة",
  "اختصر",
  "ما عندي وقت",
  "ماعندي وقت",
  "حل سريع",
  "سريع",
  "استعجل",
  "مستعجل",
  "quickly",
  "be quick",
  "no time",
  "short answer",
  "make it quick",
  "hurry",
];

// Light mood lexicon (normalized matching).
const MOOD_LEXICON: Record<Exclude<Mood, "neutral" | "crisis" | "hopeful">, string[]> = {
  sad: ["حزين", "زعلان", "مكتئب", "مخنوق", "ابكي", "دموع", "sad", "depressed", "crying", "down"],
  anxious: ["قلق", "خايف", "متوتر", "توتر", "خوف", "anxious", "scared", "nervous", "panic"],
  angry: ["زعلان", "متضايق", "غاضب", "معصب", "قهر", "angry", "furious", "frustrated", "mad"],
  overwhelmed: ["مو قادر", "تعبت من كل شي", "كله علي", "مضغوط", "overwhelmed", "too much", "can't cope"],
  tired: ["تعبان", "مرهق", "محترق", "زهقت", "مليت", "tired", "exhausted", "drained", "burned out"],
  numb: ["ما احس بشي", "فاضي", "خدر", "ميت من جوه", "numb", "empty", "nothing matters", "feel nothing"],
  lonely: ["وحيد", "لحالي", "ما عندي احد", "محد يسالني", "lonely", "alone", "no one"],
  ashamed: ["مستحي", "حاسس بذنب", "عيب", "ندمان", "ashamed", "guilty", "embarrassed"],
};

const HOPEFUL_HINTS = ["احسن", "متفائل", "بديت اتحسن", "فرحان", "better", "hopeful", "good news", "happy"];

function detectMood(text: string): Mood {
  for (const hint of HOPEFUL_HINTS) {
    if (text.includes(normalize(hint))) return "hopeful";
  }
  const scores = new Map<Mood, number>();
  for (const [mood, words] of Object.entries(MOOD_LEXICON)) {
    for (const w of words) {
      if (text.includes(normalize(w))) {
        scores.set(mood as Mood, (scores.get(mood as Mood) ?? 0) + 1);
      }
    }
  }
  if (scores.size === 0) return "neutral";
  return [...scores.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function detectCategory(text: string): CategoryId {
  const scores = new Map<CategoryId, number>();
  for (const cat of CATEGORIES) {
    for (const kw of cat.keywords) {
      if (text.includes(normalize(kw))) {
        scores.set(cat.id, (scores.get(cat.id) ?? 0) + 1);
      }
    }
  }
  if (scores.size === 0) return "general";
  return [...scores.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function isQuickRelief(text: string): boolean {
  return QUICK_RELIEF_TRIGGERS.some((t) => text.includes(normalize(t)));
}

function deriveTone(mood: Mood, urgency: Urgency, quickRelief: boolean): Tone {
  if (urgency === "crisis") return "urgent";
  if (quickRelief) return "brief";
  if (mood === "anxious" || mood === "overwhelmed") return "grounding";
  if (mood === "neutral" || mood === "hopeful") return "warm";
  return "gentle";
}

function deriveUrgency(mood: Mood, category: CategoryId, isCrisis: boolean): Urgency {
  if (isCrisis) return "crisis";
  if (category === "trauma" || mood === "overwhelmed") return "high";
  if (mood === "anxious" || mood === "sad" || category === "addiction") return "medium";
  return "low";
}

/**
 * detectUserState — reads a message + light metadata and returns a
 * structured understanding of the user's state.
 */
export function detectUserState(
  message: string,
  metadata: MessageMetadata,
): UserState {
  const text = normalize(message);
  const isCrisis = detectCrisis(message);
  const quickRelief = !isCrisis && isQuickRelief(text);
  const mood: Mood = isCrisis ? "crisis" : detectMood(text);
  const category: CategoryId = isCrisis ? "crisis" : detectCategory(text);
  const urgency = deriveUrgency(mood, category, isCrisis);
  const tone = deriveTone(mood, urgency, quickRelief);

  let suggestedAction: UserState["suggestedAction"];
  if (isCrisis) suggestedAction = "crisis_support";
  else if (quickRelief) suggestedAction = "quick_relief";
  else if (urgency === "high") suggestedAction = "suggest_referral";
  else if (mood === "anxious" || mood === "overwhelmed") suggestedAction = "ground";
  else if (category === "general" && mood === "neutral") suggestedAction = "listen";
  else suggestedAction = "offer_options";

  return {
    mood,
    urgency,
    category,
    tone,
    suggestedAction,
    quickRelief,
    isCrisis,
  };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** How many user turns before we softly offer a professional referral. */
const REFERRAL_TURN_THRESHOLD = 3;

/**
 * generateWaleefReply — turns a UserState + message into a warm,
 * short, human reply following Waleef's rules:
 *  - no medical diagnosis
 *  - validation first
 *  - at most one gentle question
 *  - 2–3 simple options
 *  - Quick Relief Mode when the user is rushed
 */
export function generateWaleefReply(
  state: UserState,
  _message: string,
  metadata: MessageMetadata = { language: "ar" },
): WaleefReply {
  const lang = metadata.language;

  // 1) Crisis takes absolute priority.
  if (state.isCrisis) {
    return {
      text:
        lang === "ar"
          ? "أنا معك الحين، وكلامك وصلني. سلامتك أهم شي عندي. لا تكون لحالك في هذي اللحظة — خلّني أوريك كيف توصل لمن يساعدك فوراً."
          : "I'm with you right now, and I heard you. Your safety matters most to me. You don't have to be alone in this moment — let me show you how to reach help right away.",
      showCrisis: true,
      quickRelief: false,
      category: "crisis",
    };
  }

  // 2) Quick Relief Mode.
  if (state.quickRelief) {
    const qr = QUICK_RELIEF[lang];
    return {
      text: qr.intro,
      options: qr.options,
      quickRelief: true,
      category: state.category,
    };
  }

  // 3) Standard warm reply built from the response bank.
  const bank = RESPONSES[state.category] ?? RESPONSES.general;
  const validation = pick(bank.validations[lang]);

  // Use at most one gentle question. For low-urgency neutral chatter we
  // may skip the question entirely to avoid overwhelming the user.
  const askQuestion = state.suggestedAction !== "listen";
  const text = askQuestion
    ? `${validation} ${bank.gentleQuestion[lang]}`
    : validation;

  // Decide whether to gently offer a professional referral.
  const cat = getCategory(state.category);
  const turn = metadata.turnCount ?? 0;
  const shouldRefer =
    !!cat?.referral &&
    (state.urgency === "high" || turn >= REFERRAL_TURN_THRESHOLD);

  const reply: WaleefReply = {
    text,
    options: bank.options[lang].slice(0, 3),
    category: state.category,
  };

  if (shouldRefer && cat?.referral) {
    reply.showReferral = true;
    reply.referralCategory = cat.referral;
  }

  return reply;
}

/**
 * Resolve a tapped option (from a chip or a previous reply) into the
 * next Waleef message. Keeps follow-ups warm and short.
 */
export function replyToOption(
  optionId: string,
  lang: MessageMetadata["language"],
): WaleefReply {
  if (optionId === "help_now" || optionId === "crisis" || optionId === "support") {
    // Soft path to professional / human help (not a crisis unless flagged).
    return {
      text:
        lang === "ar"
          ? "أنا معك، وإذا حسّيت إنك تحتاج شخص متخصص يسمعك بشكل أعمق، أقدر أساعدك توصل له بهدوء."
          : "I'm with you, and if you feel you need a specialist to listen more deeply, I can help you reach one calmly.",
      showReferral: true,
      referralCategory: optionId === "support" ? "psychologist" : "crisis_support",
    };
  }

  const followup = FOLLOWUP_REPLIES[optionId];
  if (followup) {
    return { text: followup[lang] };
  }

  // Fallback: gentle, open invitation.
  return {
    text:
      lang === "ar"
        ? "أنا هنا أسمعك… احكِ لي بقدر ما تحب، وما راح أضغطك."
        : "I'm here, listening… tell me as much as you like, and I won't push you.",
  };
}

export type { UserState, WaleefReply, ReferralCategory };
