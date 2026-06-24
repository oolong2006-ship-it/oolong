import type {
  CategoryId,
  JournalInsight,
  Language,
  MessageMetadata,
  Mode,
  Urgency,
  UserState,
  WaleefReply,
} from "./types";
import { CATEGORIES, getCategory } from "./categories";
import { detectCrisis } from "./crisis";
import {
  CRYING_MODE,
  FOLLOWUP_REPLIES,
  QUICK_RELIEF,
  RESPONSES,
  SILENT_MODE,
} from "./responses";

// ─────────────────────────────────────────────────────────────
// Waleef brain engine (mock).
//
// Public API:
//   detectUserState(input)            → UserState
//   generateWaleefReply(state, input) → WaleefReply
//   replyToOption(optionId, lang)     → WaleefReply
//   isSilentInput / isCryingInput     → boolean
//   analyzeJournal(text, lang)        → JournalInsight
//
// Deterministic, safety-first placeholder for a real model. Swap the
// internals here (and the /api/chat route) to connect OpenAI/Claude.
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

const QUICK_RELIEF_TRIGGERS = [
  "بسرعه", "بسرعة", "اختصر", "ما عندي وقت", "ماعندي وقت", "حل سريع", "ابي حل سريع",
  "سريع", "استعجل", "مستعجل",
  "quickly", "be quick", "no time", "short answer", "make it quick", "hurry",
];

const CRYING_TRIGGERS = ["ابكي", "اب-كي", "قاعد ابكي", "دموعي", "ادمع", "crying", "i'm crying", "im crying"];

/** Emotion lexicon → emotion label (ar). */
const EMOTION_LEXICON: { label: string; words: string[] }[] = [
  { label: "حزن", words: ["حزين", "زعلان", "مكتئب", "مخنوق", "مهموم", "sad", "depressed", "down"] },
  { label: "قلق", words: ["قلق", "قلقان", "متوتر", "توتر", "بانيك", "anxious", "nervous", "panic", "worried"] },
  { label: "خوف", words: ["خايف", "خوف", "مرعوب", "afraid", "scared", "fear"] },
  { label: "غضب", words: ["غاضب", "معصب", "متضايق", "قهر", "angry", "furious", "frustrated", "mad"] },
  { label: "وحدة", words: ["وحيد", "لحالي", "ما عندي احد", "lonely", "alone", "isolated"] },
  { label: "ذنب", words: ["ذنب", "مذنب", "ندمان", "تأنيب", "guilt", "guilty", "regret"] },
  { label: "خجل", words: ["خجلان", "محرج", "مستحي", "ashamed", "embarrassed"] },
  { label: "إرهاق", words: ["تعبان", "مرهق", "محترق", "زهقت", "مليت", "tired", "exhausted", "drained"] },
  { label: "فراغ", words: ["فاضي", "فراغ", "ما لي نفس", "ميت من جوه", "empty", "numb", "nothing matters"] },
  { label: "أمل", words: ["احسن", "متفائل", "بديت اتحسن", "فرحان", "ممتن", "better", "hopeful", "grateful", "happy"] },
];

function detectEmotion(text: string): { label: string; hits: number } {
  let best = { label: "غير محدد", hits: 0 };
  for (const e of EMOTION_LEXICON) {
    let hits = 0;
    for (const w of e.words) if (text.includes(normalize(w))) hits++;
    if (hits > best.hits) best = { label: e.label, hits };
  }
  return best;
}

function detectCategory(text: string): { category: CategoryId; hits: number } {
  const scores = new Map<CategoryId, number>();
  for (const cat of CATEGORIES) {
    for (const kw of cat.keywords) {
      if (text.includes(normalize(kw))) scores.set(cat.id, (scores.get(cat.id) ?? 0) + 1);
    }
  }
  if (scores.size === 0) return { category: "unknown", hits: 0 };
  const [category, hits] = [...scores.entries()].sort((a, b) => b[1] - a[1])[0];
  return { category, hits };
}

export function isQuickRelief(text: string): boolean {
  const t = normalize(text);
  return QUICK_RELIEF_TRIGGERS.some((q) => t.includes(normalize(q)));
}

/** Empty input or emoji-only (e.g. 💔 😭) → silent mode. */
export function isSilentInput(raw: string): boolean {
  const stripped = raw
    .replace(/[\p{Extended_Pictographic}‍️\s]/gu, "")
    .trim();
  return stripped.length === 0;
}

export function isCryingInput(raw: string): boolean {
  if (/😭|😢|💔/.test(raw)) return true;
  const t = normalize(raw);
  return CRYING_TRIGGERS.some((c) => t.includes(normalize(c)));
}

/**
 * detectUserState — reads a message and returns a structured read
 * matching the V1 spec: { emotion, category, urgency, mode, confidence }.
 */
export function detectUserState(input: string): UserState {
  const text = normalize(input);
  const isCrisis = detectCrisis(input);

  if (isCrisis) {
    return { emotion: "أزمة", category: "crisis", urgency: "red", mode: "crisis", confidence: 0.95 };
  }

  const quick = isQuickRelief(text);
  const { label: emotion, hits: emoHits } = detectEmotion(text);
  const { category, hits: catHits } = detectCategory(text);

  // Urgency (traffic light)
  let urgency: Urgency = "green";
  if (category === "addictions" || category === "health" || emotion === "فراغ") urgency = "orange";
  else if (
    ["anxiety", "burnout", "relationships", "family", "work_money", "body_image", "loneliness"].includes(category) ||
    ["حزن", "قلق", "خوف", "غضب", "إرهاق"].includes(emotion)
  )
    urgency = "yellow";

  // Mode
  let mode: Mode = "listening";
  if (quick) mode = "quick_relief";
  else if (urgency === "orange") mode = "referral";
  else if (category === "overthinking" || category === "work_money") mode = "guided";
  else if (["emotions", "spiritual_values", "identity", "loneliness"].includes(category)) mode = "reflection";

  // Confidence — rough heuristic from signal strength.
  const signal = catHits * 0.25 + emoHits * 0.2 + (quick ? 0.2 : 0);
  const confidence = Math.min(0.95, Math.max(0.25, 0.3 + signal));

  return { emotion, category, urgency, mode, confidence };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const REFERRAL_TURN_THRESHOLD = 3;

/**
 * generateWaleefReply — turns a UserState + message into a warm, short,
 * human reply: validation first, one gentle question max, 2–3 options,
 * crisis/quick-relief handled with priority.
 */
export function generateWaleefReply(
  state: UserState,
  input: string,
  metadata: MessageMetadata = { language: "ar" },
): WaleefReply {
  const lang = metadata.language;

  // 1) Crisis takes absolute priority.
  if (state.mode === "crisis") {
    return {
      text:
        lang === "ar"
          ? "أنا معك الآن، وكلامك وصلني. مهم جدًا ما تبقى لحالك في هاللحظة. إذا أنت في خطر مباشر، تواصل فورًا مع الطوارئ أو شخص قريب منك. خلّ جوالك معك وابتعد عن أي شيء ممكن يؤذيك. أنا هنا معك خطوة بخطوة."
          : "I'm with you now, and I heard you. It's so important that you don't stay alone in this moment. If you're in immediate danger, contact emergency services or someone close to you right now. Keep your phone with you and move away from anything that could hurt you. I'm here with you, step by step.",
      showCrisis: true,
      mode: "crisis",
      category: "crisis",
    };
  }

  // 2) Crying mode — minimal, no questions.
  if (isCryingInput(input)) {
    return {
      text: CRYING_MODE[lang],
      options: SILENT_MODE[lang].options.slice(0, 3),
      mode: "listening",
      category: state.category,
    };
  }

  // 3) Quick Relief Mode.
  if (state.mode === "quick_relief") {
    const qr = QUICK_RELIEF[lang];
    return { text: qr.intro, options: qr.options, mode: "quick_relief", category: state.category };
  }

  // 4) Standard warm reply from the response bank.
  const bank = RESPONSES[state.category] ?? RESPONSES.unknown;
  const validation = pick(bank.validations[lang]);
  const askQuestion = state.mode !== "listening" || state.category !== "unknown";
  const text = askQuestion ? `${validation} ${bank.gentleQuestion[lang]}` : validation;

  const cat = getCategory(state.category);
  const turn = metadata.turnCount ?? 0;
  const shouldRefer =
    !!cat?.referral && (state.urgency === "orange" || state.mode === "referral" || turn >= REFERRAL_TURN_THRESHOLD);

  const reply: WaleefReply = {
    text,
    options: bank.options[lang].slice(0, 3),
    mode: state.mode,
    category: state.category,
  };
  if (shouldRefer && cat?.referral) {
    reply.showReferral = true;
    reply.referralCategory = cat.referral;
  }
  return reply;
}

/** Resolve a tapped chip/option into the next warm message. */
export function replyToOption(optionId: string, lang: Language): WaleefReply {
  if (optionId === "help_now" || optionId === "support") {
    return {
      text:
        lang === "ar"
          ? "أنا معك، وفيه شخص متخصص ممكن يساعدك أكثر في هالنقطة. أقدر أوصلك له بهدوء، والقرار لك."
          : "I'm with you, and there's a specialist who could help you more here. I can connect you calmly, and the choice is yours.",
      showReferral: true,
      referralCategory: optionId === "support" ? "psychologist" : "crisis_support",
    };
  }
  const followup = FOLLOWUP_REPLIES[optionId];
  if (followup) return { text: followup[lang] };
  return {
    text:
      lang === "ar"
        ? "أنا هنا أسمعك… احكِ لي بقدر ما تحب، وما راح أضغطك."
        : "I'm here, listening… tell me as much as you like, and I won't push you.",
  };
}

// ─────────────────────────────────────────────────────────────
// Journal analysis (warm, gentle — not clinical).
// ─────────────────────────────────────────────────────────────

const NEED_BY_EMOTION: Record<string, { ar: string; en: string }> = {
  حزن: { ar: "تحتاج تُسمع وتُحتوى", en: "to be heard and held" },
  قلق: { ar: "تحتاج طمأنينة وتنفّس", en: "reassurance and a breath" },
  خوف: { ar: "تحتاج أمان وثبات", en: "safety and steadiness" },
  غضب: { ar: "تحتاج تطلّع اللي بداخلك", en: "to let out what's inside" },
  وحدة: { ar: "تحتاج قربٍ وونس", en: "closeness and company" },
  ذنب: { ar: "تحتاج لطف مع نفسك", en: "kindness toward yourself" },
  إرهاق: { ar: "تحتاج راحة بدون ذنب", en: "rest without guilt" },
  فراغ: { ar: "تحتاج معنى صغير تبدأ منه", en: "a small meaning to start from" },
  أمل: { ar: "تستاهل تحتفي بهالإحساس", en: "to celebrate this feeling" },
};

export function analyzeJournal(text: string, lang: Language): JournalInsight {
  const { label: emotion } = detectEmotion(normalize(text));
  const need = NEED_BY_EMOTION[emotion] ?? {
    ar: "تحتاج مساحة تعبّر فيها بحرية",
    en: "space to express freely",
  };
  const reflectionAr =
    emotion === "أمل"
      ? "واضح إن فيه ضوء في كلامك… خلّه يكبر، وأنت تستاهله."
      : "شكراً إنك كتبت هذا… مجرد إنك طلّعته خطوة لطيفة مع نفسك.";
  const reflectionEn =
    emotion === "أمل"
      ? "There's clearly some light in your words… let it grow, you deserve it."
      : "Thank you for writing this… just letting it out is a kind step toward yourself.";

  return {
    emotion,
    emotionLabel: lang === "ar" ? emotion : translateEmotion(emotion),
    need: lang === "ar" ? need.ar : need.en,
    reflection: lang === "ar" ? reflectionAr : reflectionEn,
  };
}

function translateEmotion(ar: string): string {
  const map: Record<string, string> = {
    حزن: "Sadness",
    قلق: "Anxiety",
    خوف: "Fear",
    غضب: "Anger",
    وحدة: "Loneliness",
    ذنب: "Guilt",
    خجل: "Shame",
    إرهاق: "Exhaustion",
    فراغ: "Emptiness",
    أمل: "Hope",
    "غير محدد": "Unclear",
  };
  return map[ar] ?? "Unclear";
}

export type { UserState, WaleefReply };
