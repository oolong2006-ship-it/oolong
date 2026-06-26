import type { Language, ReferralCategory } from "./types";

// ─────────────────────────────────────────────────────────────
// UI string dictionary (Arabic-first, English supported).
// ─────────────────────────────────────────────────────────────

export interface UIStrings {
  appName: string;
  tagline: string;
  start: string;
  // onboarding
  onboardingTitle: string;
  onboardingHint: string;
  optText: string;
  optVoiceLater: string;
  optBrowse: string;
  optLetWaleef: string;
  guestMode: string;
  noRegister: string;
  continueLabel: string;
  // chat
  chatPlaceholder: string;
  send: string;
  chips: { id: string; label: string }[];
  waleefTyping: string;
  chatIntro: string;
  // silent mode
  silentPrompt: string;
  silentCalm: string;
  silentBrowse: string;
  silentSoothe: string;
  // referral
  referralTitle: string;
  referralBody: string;
  referralClose: string;
  referralConnect: string;
  // crisis
  crisisButton: string;
  callNow: string;
  close: string;
  // misc
  langLabel: string;
  guestBadge: string;
  backHome: string;
}

export const STRINGS: Record<Language, UIStrings> = {
  ar: {
    appName: "وليف",
    tagline: "إنسان يسمعك… مو بس يرد عليك.",
    start: "ابدأ معي",
    onboardingTitle: "كيف تفضّل أتواصل معك؟",
    onboardingHint: "ما فيه إجابة صح أو غلط… اختر اللي يريّحك.",
    optText: "كتابة",
    optVoiceLater: "صوت لاحقًا",
    optBrowse: "أتصفح فقط",
    optLetWaleef: "خلّ وليف يختار حسب حالتي",
    guestMode: "أكمل كضيف",
    noRegister: "بدون تسجيل… وجودك يكفي.",
    continueLabel: "نكمل",
    chatPlaceholder: "اكتب أي شيء… حتى لو كلمة.",
    send: "إرسال",
    chips: [
      { id: "lost", label: "ماني عارف وش فيني" },
      { id: "overthink", label: "أفكر كثير" },
      { id: "calm", label: "أحتاج أهدأ" },
      { id: "vent", label: "ودي أفضفض" },
      { id: "browse", label: "بس أتصفح" },
    ],
    waleefTyping: "وليف يكتب…",
    chatIntro: "أنا وليف. ما يحتاج تشرح كل شيء الآن… خلّنا نبدأ من أبسط شيء.",
    silentPrompt: "خذ وقتك… وجودك هنا يكفي كبداية.",
    silentCalm: "أحتاج لحظة هدوء",
    silentBrowse: "خلني أتصفح",
    silentSoothe: "اسمعني شيء يريحني",
    referralTitle: "تحب أساعدك توصل لشخص متخصص؟",
    referralBody:
      "أنا معك، وإذا حسّيت إنك تحتاج شخص متخصص يسمعك بشكل أعمق، أقدر أساعدك توصل له بهدوء. القرار لك، وما فيه أي ضغط.",
    referralClose: "مو الحين، أكمل معك",
    referralConnect: "أوصلني بهدوء",
    crisisButton: "أحتاج دعم عاجل الآن",
    callNow: "اتصل الآن",
    close: "إغلاق",
    langLabel: "EN",
    guestBadge: "وضع الضيف",
    backHome: "الرئيسية",
  },
  en: {
    appName: "Waleef",
    tagline: "A human who hears you… not just replies to you.",
    start: "Start with me",
    onboardingTitle: "How would you like me to reach you?",
    onboardingHint: "There's no right or wrong answer… pick what feels easy.",
    optText: "Text",
    optVoiceLater: "Voice later",
    optBrowse: "Just browsing",
    optLetWaleef: "Let Waleef choose based on how I feel",
    guestMode: "Continue as guest",
    noRegister: "No sign-up… your presence is enough.",
    continueLabel: "Continue",
    chatPlaceholder: "Write anything… even one word.",
    send: "Send",
    chips: [
      { id: "lost", label: "I don't know what's wrong with me" },
      { id: "overthink", label: "I overthink a lot" },
      { id: "calm", label: "I need to calm down" },
      { id: "vent", label: "I want to vent" },
      { id: "browse", label: "Just browsing" },
    ],
    waleefTyping: "Waleef is typing…",
    chatIntro:
      "I'm Waleef. You don't have to explain everything now… let's start with the simplest thing.",
    silentPrompt: "Take your time… your presence here is enough as a start.",
    silentCalm: "I need a quiet moment",
    silentBrowse: "Let me browse",
    silentSoothe: "Tell me something soothing",
    referralTitle: "Would you like me to help you reach a specialist?",
    referralBody:
      "I'm with you, and if you feel you need a specialist to listen more deeply, I can help you reach one calmly. The choice is yours, with no pressure at all.",
    referralClose: "Not now, stay with me",
    referralConnect: "Connect me calmly",
    crisisButton: "I need urgent support now",
    callNow: "Call now",
    close: "Close",
    langLabel: "ع",
    guestBadge: "Guest mode",
    backHome: "Home",
  },
};

// Maps a quick chip id to the engine option / message to send.
export const CHIP_TO_MESSAGE: Record<string, { ar: string; en: string }> = {
  lost: { ar: "ماني عارف وش فيني", en: "I don't know what's wrong with me" },
  overthink: { ar: "أفكر كثير", en: "I overthink a lot" },
  calm: { ar: "أحتاج أهدأ", en: "I need to calm down" },
  vent: { ar: "ودي أفضفض", en: "I want to vent" },
  browse: { ar: "بس أتصفح", en: "Just browsing" },
};

export interface ReferralInfo {
  id: ReferralCategory;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

export const REFERRALS: Record<ReferralCategory, ReferralInfo> = {
  psychologist: {
    id: "psychologist",
    titleAr: "أخصائي نفسي",
    titleEn: "Psychologist",
    descAr: "يسمعك بعمق ويساعدك تفهم مشاعرك وتتعامل معها.",
    descEn: "Listens deeply and helps you understand and handle your feelings.",
  },
  psychiatrist: {
    id: "psychiatrist",
    titleAr: "طبيب نفسي",
    titleEn: "Psychiatrist",
    descAr: "للحالات اللي تحتاج متابعة طبية متخصصة.",
    descEn: "For situations that need specialized medical follow-up.",
  },
  addiction_specialist: {
    id: "addiction_specialist",
    titleAr: "مختص في الإدمان",
    titleEn: "Addiction specialist",
    descAr: "يرافقك بخصوصية وبدون حكم نحو التعافي.",
    descEn: "Walks with you privately and without judgment toward recovery.",
  },
  family_counselor: {
    id: "family_counselor",
    titleAr: "مستشار أسري",
    titleEn: "Family counselor",
    descAr: "يساعدك في خلافات وتواصل العائلة والعلاقات.",
    descEn: "Helps with family conflict, communication, and relationships.",
  },
  career_coach: {
    id: "career_coach",
    titleAr: "مدرب مهني",
    titleEn: "Career coach",
    descAr: "يساعدك ترتّب مسارك وضغوط شغلك وقراراتك.",
    descEn: "Helps you sort your path, work stress, and decisions.",
  },
  crisis_support: {
    id: "crisis_support",
    titleAr: "دعم عاجل",
    titleEn: "Crisis support",
    descAr: "تواصل فوري مع جهة تقدر تساعدك الآن.",
    descEn: "Immediate contact with someone who can help you now.",
  },
};
