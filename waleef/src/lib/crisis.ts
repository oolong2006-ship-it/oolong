import type { Language } from "./types";

// ─────────────────────────────────────────────────────────────
// Crisis / immediate-danger detection.
//
// IMPORTANT: Waleef NEVER raises the topic of suicide or self-harm
// on its own. This module only fires when the USER has already used
// explicit language about wanting to die or hurt themselves now.
// ─────────────────────────────────────────────────────────────

const CRISIS_PATTERNS_AR: string[] = [
  "أبي أموت",
  "ابي اموت",
  "بموت",
  "ودي أموت",
  "ودي اموت",
  "أبغى أنتحر",
  "ابغى انتحر",
  "بنتحر",
  "انتحار",
  "أنتحر",
  "أؤذي نفسي",
  "اؤذي نفسي",
  "أجرح نفسي",
  "اجرح نفسي",
  "أذي نفسي",
  "أنهي حياتي",
  "انهي حياتي",
  "ما أبي أعيش",
  "ما ابي اعيش",
  "تعبت من الحياة وأبي أخلص",
  "أبي أخلص من حياتي",
  "ما عاد لي قيمة في الدنيا وأبي أروح",
  "بقتل نفسي",
  "أقتل نفسي",
  "اقتل نفسي",
];

const CRISIS_PATTERNS_EN: string[] = [
  "kill myself",
  "killing myself",
  "i want to die",
  "i wanna die",
  "end my life",
  "ending my life",
  "suicide",
  "suicidal",
  "hurt myself",
  "harm myself",
  "self harm",
  "cut myself",
  "i don't want to live",
  "i dont want to live",
  "better off dead",
  "take my own life",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    // strip Arabic diacritics
    .replace(/[ً-ٰٟ]/g, "")
    // normalize alef variants
    .replace(/[إأآ]/g, "ا")
    .trim();
}

/**
 * Returns true only when the user has explicitly expressed intent of
 * suicide or self-harm. Conservative on purpose.
 */
export function detectCrisis(message: string): boolean {
  const text = normalize(message);
  const patterns = [...CRISIS_PATTERNS_AR, ...CRISIS_PATTERNS_EN].map(normalize);
  return patterns.some((p) => text.includes(p));
}

export interface CrisisResource {
  nameAr: string;
  nameEn: string;
  contact: string;
  noteAr?: string;
  noteEn?: string;
}

/** Saudi-first crisis & emergency resources. */
export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    nameAr: "الطوارئ الموحّد",
    nameEn: "Unified Emergency",
    contact: "911",
    noteAr: "للمناطق الرئيسية في المملكة",
    noteEn: "Main regions in Saudi Arabia",
  },
  {
    nameAr: "الطوارئ",
    nameEn: "Emergency",
    contact: "999",
    noteAr: "الشرطة",
    noteEn: "Police",
  },
  {
    nameAr: "الدعم النفسي — مركز العلاج النفسي الوطني",
    nameEn: "National mental-health support line",
    contact: "920033360",
    noteAr: "خط استشارات نفسية",
    noteEn: "Mental-health consultation line",
  },
  {
    nameAr: "الخط الأمني للأسرة",
    nameEn: "Family safety helpline",
    contact: "1919",
    noteAr: "للحماية والدعم الأسري",
    noteEn: "Family protection & support",
  },
];

export const CRISIS_COPY: Record<Language, {
  title: string;
  intro: string;
  steps: string[];
  callTrusted: string;
  reassure: string;
  resourcesTitle: string;
  close: string;
}> = {
  ar: {
    title: "أنا معك الحين… وما راح أتركك",
    intro:
      "اللي تحس فيه ثقيل، وأنا آخذ كلامك على محمل الجد. سلامتك تهمني أكثر من أي شيء الآن.",
    steps: [
      "إذا فيه شيء حولك ممكن يأذيك، ابعد عنه الحين لو سمحت.",
      "اتصل بأقرب شخص تثق فيه وخبّره إنك تحتاجه يكون معك الآن.",
      "إذا حسّيت إنك في خطر مباشر، تواصل مع الطوارئ فوراً.",
    ],
    callTrusted: "كلّم شخص تثق فيه الآن",
    reassure: "ما أحكم عليك، وما راح أعاتبك. أنا هنا، وخطوة وخطوة نعدّيها سوا.",
    resourcesTitle: "أرقام تقدر تتواصل معها الآن",
    close: "ابقَ معي… لا تكون لحالك في هذه اللحظة.",
  },
  en: {
    title: "I'm with you right now… and I won't leave you",
    intro:
      "What you're feeling is heavy, and I take your words seriously. Your safety matters to me more than anything right now.",
    steps: [
      "If there's anything around you that could hurt you, please move away from it now.",
      "Call someone you trust and tell them you need them to be with you right now.",
      "If you feel you're in immediate danger, please contact emergency services right away.",
    ],
    callTrusted: "Call someone you trust now",
    reassure:
      "I won't judge you, and I won't lecture you. I'm here, and we'll take this one step at a time, together.",
    resourcesTitle: "Numbers you can reach right now",
    close: "Stay with me… you don't have to be alone in this moment.",
  },
};
