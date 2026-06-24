import type { CheckinMood, Language, Persona, ReferralCategory } from "./types";

// ─────────────────────────────────────────────────────────────
// UI string dictionary (Arabic-first, English supported).
// ─────────────────────────────────────────────────────────────

export interface UIStrings {
  appName: string;
  welcomeHi: string;
  tagline: string;
  startWithMe: string;
  enterAsGuest: string;
  toEnglish: string;
  noRegister: string;

  // onboarding
  onbHowTitle: string;
  personaListen: string;
  personaOrganize: string;
  personaCalm: string;
  personaSilent: string;
  personaLetWaleef: string;
  onbContactTitle: string;
  optText: string;
  optVoiceLater: string;
  optBrowse: string;
  onbLangTitle: string;
  langArabic: string;
  langEnglish: string;
  continueLabel: string;
  back: string;

  // chat
  chatIntro: string;
  chatPlaceholder: string;
  send: string;
  chips: { id: string; label: string }[];
  waleefTyping: string;

  // referral
  referralTitle: string;
  referralBody: string;
  referralGentle: string;
  referralClose: string;
  referralConnect: string;

  // crisis
  crisisButton: string;
  close: string;

  // nav
  navChat: string;
  navCheckin: string;
  navJournal: string;
  navProgress: string;
  navSupport: string;
  navSettings: string;
  navReferrals: string;

  // check-in
  checkinTitle: string;
  checkinMoods: { id: CheckinMood; label: string; emoji: string }[];
  checkinNotePlaceholder: string;
  checkinSave: string;
  checkinSaved: string;

  // journal
  journalTitle: string;
  journalPlaceholder: string;
  journalAnalyze: string;
  journalSave: string;
  journalSaved: string;
  journalEmotion: string;
  journalNeed: string;
  journalReflection: string;
  journalEmpty: string;
  journalPast: string;

  // progress
  progressTitle: string;
  progressCheckins: string;
  progressJournals: string;
  progressCommonMood: string;
  progressTrend: string;
  progressNextStep: string;
  progressEmpty: string;

  // support
  supportTitle: string;
  supportSubtitle: string;
  referralsTitle: string;
  referralsSubtitle: string;

  // settings
  settingsTitle: string;
  settingsLanguage: string;
  settingsPersona: string;
  settingsClearData: string;
  settingsCleared: string;
  settingsAbout: string;
  settingsAboutBody: string;
  guestBadge: string;
}

const CHIPS_AR = [
  { id: "lost", label: "ماني عارف وش فيني" },
  { id: "overthink", label: "أفكر كثير" },
  { id: "calm", label: "أحتاج أهدأ" },
  { id: "vent", label: "ودي أفضفض" },
  { id: "tired", label: "تعبان" },
  { id: "afraid", label: "خايف" },
  { id: "listen", label: "محتاج أحد يسمعني" },
];

const CHIPS_EN = [
  { id: "lost", label: "I don't know what's wrong" },
  { id: "overthink", label: "I overthink a lot" },
  { id: "calm", label: "I need to calm down" },
  { id: "vent", label: "I want to vent" },
  { id: "tired", label: "I'm tired" },
  { id: "afraid", label: "I'm scared" },
  { id: "listen", label: "I need someone to listen" },
];

export const STRINGS: Record<Language, UIStrings> = {
  ar: {
    appName: "وليف",
    welcomeHi: "هلا… أنا وليف",
    tagline: "إنسان يسمعك… مو بس يرد عليك",
    startWithMe: "ابدأ معي",
    enterAsGuest: "أدخل كزائر",
    toEnglish: "English",
    noRegister: "بدون تسجيل… وجودك يكفي.",

    onbHowTitle: "كيف تحب أكون معك؟",
    personaListen: "أسمعك",
    personaOrganize: "أرتب أفكارك",
    personaCalm: "أساعدك تهدأ",
    personaSilent: "أكون معك بصمت",
    personaLetWaleef: "مدري… خل وليف يختار",
    onbContactTitle: "تفضّل التواصل كيف؟",
    optText: "كتابة",
    optVoiceLater: "صوت لاحقًا",
    optBrowse: "تصفح فقط",
    onbLangTitle: "وش اللغة اللي تريحك؟",
    langArabic: "العربية",
    langEnglish: "English",
    continueLabel: "نكمل",
    back: "رجوع",

    chatIntro: "أنا وليف. ما تحتاج تشرح كل شيء الآن… خلّنا نبدأ من أبسط شيء.",
    chatPlaceholder: "اكتب أي شيء… حتى لو كلمة",
    send: "إرسال",
    chips: CHIPS_AR,
    waleefTyping: "وليف يكتب…",

    referralTitle: "تحب أساعدك توصل لشخص متخصص؟",
    referralBody:
      "أنا معك، وفيه شخص متخصص ممكن يساعدك أكثر في هالنقطة. أقدر أوصلك له بهدوء، والقرار لك وما فيه أي ضغط.",
    referralGentle: "فيه شخص متخصص ممكن يساعدك أكثر في هالنقطة.",
    referralClose: "مو الحين، أكمل معك",
    referralConnect: "أوصلني بهدوء",

    crisisButton: "أحتاج دعم عاجل الآن",
    close: "إغلاق",

    navChat: "وليف",
    navCheckin: "نبض اليوم",
    navJournal: "دفتري",
    navProgress: "رحلتي",
    navSupport: "مساحات",
    navSettings: "الإعدادات",
    navReferrals: "دعم متخصص",

    checkinTitle: "كيف قلبك اليوم؟",
    checkinMoods: [
      { id: "calm", label: "هادئ", emoji: "🌿" },
      { id: "tired", label: "متعب", emoji: "🥱" },
      { id: "anxious", label: "قلق", emoji: "🌊" },
      { id: "sad", label: "حزين", emoji: "🌧️" },
      { id: "scattered", label: "مشتت", emoji: "🍃" },
      { id: "grateful", label: "ممتن", emoji: "🤍" },
      { id: "unknown", label: "لا أعرف", emoji: "🫧" },
    ],
    checkinNotePlaceholder: "تحب تضيف كلمة؟ (اختياري)",
    checkinSave: "سجّل نبضي",
    checkinSaved: "وصلني… شكراً إنك شاركتني.",

    journalTitle: "دفتري",
    journalPlaceholder: "اكتب لنفسك… أو لوليف.",
    journalAnalyze: "خل وليف يساعدني أفهم اللي كتبته",
    journalSave: "احفظ",
    journalSaved: "حفظته لك.",
    journalEmotion: "الشعور",
    journalNeed: "اللي تحتاجه",
    journalReflection: "تأمل لطيف",
    journalEmpty: "اكتب أول سطر… ما فيه صح ولا غلط.",
    journalPast: "كتاباتك السابقة",

    progressTitle: "رحلتك مع وليف",
    progressCheckins: "مرّات شاركت نبضك",
    progressJournals: "كتاباتك",
    progressCommonMood: "أكثر شعور مرّ عليك",
    progressTrend: "نبضك مؤخراً",
    progressNextStep: "خطوة لطيفة جاية",
    progressEmpty: "لسا ما بدينا رحلتنا… شارك نبضك اليوم كبداية.",

    supportTitle: "مساحات وليف",
    supportSubtitle: "اختر اللي يقرب لإحساسك، وأنا أبدأ معك بهدوء.",
    referralsTitle: "دعم متخصص بهدوء",
    referralsSubtitle: "إذا حسّيت إنك تحتاج شخص يفهمك أعمق، هذي خيارات لطيفة.",

    settingsTitle: "الإعدادات",
    settingsLanguage: "اللغة",
    settingsPersona: "كيف تحب وليف يكون معك",
    settingsClearData: "امسح بياناتي المحلية",
    settingsCleared: "تم مسح بياناتك من هذا الجهاز.",
    settingsAbout: "عن وليف",
    settingsAboutBody:
      "وليف رفيق إنساني يسمعك ويواسيك. هو مو بديل عن العلاج أو التشخيص الطبي، وإذا احتجت دعم متخصص يقدر يوصلك له بهدوء.",
    guestBadge: "وضع الزائر",
  },

  en: {
    appName: "Waleef",
    welcomeHi: "Hi… I'm Waleef",
    tagline: "A human who hears you… not just replies to you",
    startWithMe: "Start with me",
    enterAsGuest: "Enter as guest",
    toEnglish: "العربية",
    noRegister: "No sign-up… your presence is enough.",

    onbHowTitle: "How would you like me to be with you?",
    personaListen: "Listen to you",
    personaOrganize: "Organize your thoughts",
    personaCalm: "Help you calm down",
    personaSilent: "Be with you in silence",
    personaLetWaleef: "I don't know… let Waleef choose",
    onbContactTitle: "How do you prefer to reach me?",
    optText: "Text",
    optVoiceLater: "Voice later",
    optBrowse: "Just browsing",
    onbLangTitle: "Which language feels easy?",
    langArabic: "العربية",
    langEnglish: "English",
    continueLabel: "Continue",
    back: "Back",

    chatIntro: "I'm Waleef. You don't have to explain everything now… let's start with the simplest thing.",
    chatPlaceholder: "Write anything… even one word",
    send: "Send",
    chips: CHIPS_EN,
    waleefTyping: "Waleef is typing…",

    referralTitle: "Would you like me to help you reach a specialist?",
    referralBody:
      "I'm with you, and there's a specialist who could help you more here. I can connect you calmly, the choice is yours with no pressure.",
    referralGentle: "There's a specialist who could help you more here.",
    referralClose: "Not now, stay with me",
    referralConnect: "Connect me calmly",

    crisisButton: "I need urgent support now",
    close: "Close",

    navChat: "Waleef",
    navCheckin: "Today",
    navJournal: "Journal",
    navProgress: "Journey",
    navSupport: "Spaces",
    navSettings: "Settings",
    navReferrals: "Specialists",

    checkinTitle: "How is your heart today?",
    checkinMoods: [
      { id: "calm", label: "Calm", emoji: "🌿" },
      { id: "tired", label: "Tired", emoji: "🥱" },
      { id: "anxious", label: "Anxious", emoji: "🌊" },
      { id: "sad", label: "Sad", emoji: "🌧️" },
      { id: "scattered", label: "Scattered", emoji: "🍃" },
      { id: "grateful", label: "Grateful", emoji: "🤍" },
      { id: "unknown", label: "I don't know", emoji: "🫧" },
    ],
    checkinNotePlaceholder: "Want to add a word? (optional)",
    checkinSave: "Save my check-in",
    checkinSaved: "It reached me… thank you for sharing.",

    journalTitle: "My journal",
    journalPlaceholder: "Write to yourself… or to Waleef.",
    journalAnalyze: "Let Waleef help me understand what I wrote",
    journalSave: "Save",
    journalSaved: "Saved it for you.",
    journalEmotion: "Emotion",
    journalNeed: "What you need",
    journalReflection: "A gentle reflection",
    journalEmpty: "Write the first line… there's no right or wrong.",
    journalPast: "Your past entries",

    progressTitle: "Your journey with Waleef",
    progressCheckins: "Times you shared your pulse",
    progressJournals: "Your entries",
    progressCommonMood: "Your most common feeling",
    progressTrend: "Your pulse lately",
    progressNextStep: "A gentle next step",
    progressEmpty: "We haven't started our journey yet… share your pulse today.",

    supportTitle: "Waleef spaces",
    supportSubtitle: "Pick what's closest to how you feel, and I'll begin gently.",
    referralsTitle: "Specialized support, calmly",
    referralsSubtitle: "If you feel you need someone to understand you deeper, here are gentle options.",

    settingsTitle: "Settings",
    settingsLanguage: "Language",
    settingsPersona: "How you'd like Waleef to be",
    settingsClearData: "Clear my local data",
    settingsCleared: "Your data was cleared from this device.",
    settingsAbout: "About Waleef",
    settingsAboutBody:
      "Waleef is a human companion that listens and comforts. It is not a replacement for therapy or medical diagnosis, and if you need specialized support it can connect you calmly.",
    guestBadge: "Guest mode",
  },
};

// Maps a quick chip id to the message to send.
export const CHIP_TO_MESSAGE: Record<string, { ar: string; en: string }> = {
  lost: { ar: "ماني عارف وش فيني", en: "I don't know what's wrong with me" },
  overthink: { ar: "أفكر كثير", en: "I overthink a lot" },
  calm: { ar: "أحتاج أهدأ", en: "I need to calm down" },
  vent: { ar: "ودي أفضفض", en: "I want to vent" },
  tired: { ar: "تعبان", en: "I'm tired" },
  afraid: { ar: "خايف", en: "I'm scared" },
  listen: { ar: "محتاج أحد يسمعني", en: "I need someone to listen to me" },
};

export const PERSONA_LABELS: Record<Persona, { ar: string; en: string }> = {
  listen: { ar: "أسمعك", en: "Listen to you" },
  organize: { ar: "أرتب أفكارك", en: "Organize your thoughts" },
  calm: { ar: "أساعدك تهدأ", en: "Help you calm down" },
  silent: { ar: "أكون معك بصمت", en: "Be with you in silence" },
  let_waleef: { ar: "خل وليف يختار", en: "Let Waleef choose" },
};

export interface ReferralInfo {
  id: ReferralCategory;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  emoji: string;
}

export const REFERRALS: Record<ReferralCategory, ReferralInfo> = {
  psychologist: {
    id: "psychologist",
    titleAr: "أخصائي نفسي",
    titleEn: "Psychologist",
    descAr: "يسمعك بعمق ويساعدك تفهم مشاعرك وتتعامل معها.",
    descEn: "Listens deeply and helps you understand and handle your feelings.",
    emoji: "🤍",
  },
  psychiatrist: {
    id: "psychiatrist",
    titleAr: "طبيب نفسي",
    titleEn: "Psychiatrist",
    descAr: "للحالات اللي تحتاج متابعة طبية متخصصة.",
    descEn: "For situations that need specialized medical follow-up.",
    emoji: "🩺",
  },
  family_counselor: {
    id: "family_counselor",
    titleAr: "مستشار أسري",
    titleEn: "Family counselor",
    descAr: "يساعدك في خلافات وتواصل العائلة والعلاقات.",
    descEn: "Helps with family conflict, communication, and relationships.",
    emoji: "🏡",
  },
  addiction_specialist: {
    id: "addiction_specialist",
    titleAr: "مختص إدمان",
    titleEn: "Addiction specialist",
    descAr: "يرافقك بخصوصية وبدون حكم نحو التعافي.",
    descEn: "Walks with you privately and without judgment toward recovery.",
    emoji: "🌱",
  },
  career_coach: {
    id: "career_coach",
    titleAr: "مرشد مهني",
    titleEn: "Career coach",
    descAr: "يساعدك ترتّب مسارك وضغوط شغلك وقراراتك.",
    descEn: "Helps you sort your path, work stress, and decisions.",
    emoji: "🧭",
  },
  crisis_support: {
    id: "crisis_support",
    titleAr: "دعم طارئ",
    titleEn: "Crisis support",
    descAr: "تواصل فوري مع جهة تقدر تساعدك الآن.",
    descEn: "Immediate contact with someone who can help you now.",
    emoji: "🆘",
  },
};

export const REFERRAL_ORDER: ReferralCategory[] = [
  "psychologist",
  "psychiatrist",
  "family_counselor",
  "addiction_specialist",
  "career_coach",
  "crisis_support",
];
