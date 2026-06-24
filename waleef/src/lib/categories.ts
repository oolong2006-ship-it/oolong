import type { CategoryId, ReferralCategory } from "./types";

// ─────────────────────────────────────────────────────────────
// Engine categories + detection keywords.
// We keep detection internal — the user never sees a clinical menu.
// ─────────────────────────────────────────────────────────────

export interface CategoryDef {
  id: CategoryId;
  labelAr: string;
  labelEn: string;
  keywords: string[];
  referral?: ReferralCategory;
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "emotions",
    labelAr: "المشاعر",
    labelEn: "Emotions",
    referral: "psychologist",
    keywords: [
      "حزين", "زعلان", "مكتئب", "مخنوق", "خايف", "خوف", "غاضب", "معصب", "قهر",
      "ذنب", "مذنب", "خجلان", "فاضي", "فراغ", "ما لي نفس", "فقدت شغفي", "مالي خلق",
      "sad", "afraid", "angry", "guilt", "ashamed", "empty", "no passion", "down",
    ],
  },
  {
    id: "overthinking",
    labelAr: "التفكير الزائد",
    labelEn: "Overthinking",
    referral: "psychologist",
    keywords: [
      "أفكر كثير", "افكر كثير", "تفكير زايد", "عقلي ما يهدأ", "وساوس", "أجلد نفسي",
      "جلد الذات", "أقارن نفسي", "مقارنة", "كمالية", "أأجل", "تسويف",
      "overthink", "can't stop thinking", "rumination", "comparing", "perfectionism", "procrastinate",
    ],
  },
  {
    id: "anxiety",
    labelAr: "القلق",
    labelEn: "Anxiety",
    referral: "psychologist",
    keywords: [
      "قلق", "قلقان", "متوتر", "توتر", "نفسي تضيق", "صدري ضايق", "قلبي يدق بسرعة", "بانيك",
      "anxious", "anxiety", "panic", "nervous", "worried", "on edge",
    ],
  },
  {
    id: "burnout",
    labelAr: "الاحتراق الوظيفي",
    labelEn: "Burnout",
    referral: "career_coach",
    keywords: [
      "محترق", "احتراق", "تعبت من الشغل", "الدوام قاتلني", "ما عاد أقدر أداوم", "مرهق", "زهقت من الشغل",
      "burnout", "burned out", "exhausted from work", "drained",
    ],
  },
  {
    id: "loneliness",
    labelAr: "الوحدة",
    labelEn: "Loneliness",
    referral: "psychologist",
    keywords: [
      "وحيد", "لحالي", "ما عندي أحد", "محد يسأل عني", "أحس بالوحدة", "منعزل",
      "lonely", "alone", "no one", "isolated", "by myself",
    ],
  },
  {
    id: "self_confidence",
    labelAr: "الثقة واتخاذ القرار",
    labelEn: "Confidence & decisions",
    referral: "psychologist",
    keywords: [
      "ما أثق بنفسي", "ثقتي ضعيفة", "متردد", "ما أقدر أقرر", "أرضي الناس", "خايف من الرفض",
      "ما أقدر أقول لا", "ضعيف الشخصية", "رهاب اجتماعي", "أتوتر قدام الناس",
      "low confidence", "indecisive", "people pleaser", "fear of rejection", "can't say no", "social anxiety",
    ],
  },
  {
    id: "relationships",
    labelAr: "العلاقات",
    labelEn: "Relationships",
    referral: "family_counselor",
    keywords: [
      "زواج", "زوجتي", "زوجي", "طلاق", "خطوبة", "خطيبي", "خطيبتي", "صاحبي", "صديقتي",
      "خيانة", "علاقة سامة", "حبيبي", "حبيبتي", "انفصال",
      "marriage", "my wife", "my husband", "divorce", "engagement", "betrayal", "toxic relationship", "breakup",
    ],
  },
  {
    id: "family",
    labelAr: "العائلة",
    labelEn: "Family",
    referral: "family_counselor",
    keywords: [
      "أهلي", "عائلتي", "أمي", "أبوي", "والدي", "والدتي", "إخواني", "أبنائي", "ولدي", "بنتي",
      "مشاكل البيت", "خلاف مع أهلي",
      "my parents", "my mom", "my dad", "my kids", "my children", "family conflict", "siblings",
    ],
  },
  {
    id: "work_money",
    labelAr: "العمل والمال",
    labelEn: "Work & money",
    referral: "career_coach",
    keywords: [
      "ديون", "مديون", "فلوس", "خسرت في السوق", "الأسهم", "استثمار", "بطالة", "عاطل", "راتبي ما يكفي",
      "مستثمر", "مشروعي", "ريادة أعمال", "خسارة مالية",
      "debt", "money", "lost money", "stocks", "unemployed", "salary", "investor", "startup", "financial loss",
    ],
  },
  {
    id: "addictions",
    labelAr: "الإدمانات",
    labelEn: "Addictions",
    referral: "addiction_specialist",
    keywords: [
      "مدمن", "إدمان", "ادمان", "تدخين", "أدخن", "سيجارة", "تبغ", "خمر", "كحول", "مخدرات", "حشيش",
      "ألعاب", "قيمنق", "الجوال مدمن", "السوشيال", "بورن", "إباحية", "عادة سرية", "ما أقدر أبطل",
      "addiction", "addicted", "smoking", "alcohol", "drugs", "gaming", "porn", "masturbation", "phone addiction", "can't quit",
    ],
  },
  {
    id: "body_image",
    labelAr: "صورة الجسد",
    labelEn: "Body image",
    referral: "psychologist",
    keywords: [
      "شكلي", "ما أحب جسمي", "أكره شكلي", "وزني", "بدين", "نحيف", "ما أتقبل نفسي",
      "body image", "hate my body", "my weight", "ugly", "overweight",
    ],
  },
  {
    id: "identity",
    labelAr: "الهوية والمعنى",
    labelEn: "Identity & meaning",
    referral: "psychologist",
    keywords: [
      "ما أعرف نفسي", "مين أنا", "ضايع", "أزمة هوية", "المؤثرين", "الشهرة", "أبحث عن نفسي", "ما لقيت معنى",
      "identity", "who am i", "lost", "influencers", "fame", "finding myself", "no meaning",
    ],
  },
  {
    id: "spiritual_values",
    labelAr: "الروح والقيم",
    labelEn: "Spirit & values",
    referral: "psychologist",
    keywords: [
      "حاسس بذنب", "أسئلة وجودية", "صراع قيمي", "قيمي", "تايه روحياً", "معنى الحياة", "أبراج", "خرافات",
      "spiritual", "guilt", "existential", "values conflict", "meaning of life",
    ],
  },
  {
    id: "health",
    labelAr: "الصحة",
    labelEn: "Health",
    referral: "psychologist",
    keywords: [
      "سرطان", "مرض مزمن", "علاج كيماوي", "مريض", "صحتي", "ما أقدر أنام", "أرق", "خايف من المرض", "وسواس مرض",
      "cancer", "chronic illness", "chemo", "sick", "can't sleep", "insomnia", "fear of illness",
    ],
  },
];

/** Categories deliberately surfaced as gentle chat entry points. */
export const PUBLIC_CATEGORY_IDS: CategoryId[] = [
  "overthinking",
  "anxiety",
  "burnout",
];

export function getCategory(id: CategoryId): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

// ─────────────────────────────────────────────────────────────
// Support Paths page content — warm, grouped areas (not a clinical
// directory). Each item seeds a gentle chat opener.
// ─────────────────────────────────────────────────────────────

export interface SupportArea {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  seedAr: string;
  seedEn: string;
}

export const SUPPORT_AREAS: SupportArea[] = [
  {
    id: "emotions",
    titleAr: "المشاعر",
    titleEn: "Emotions",
    descAr: "قلق، حزن، وحدة، خوف، غضب، ذنب، فراغ.",
    descEn: "Anxiety, sadness, loneliness, fear, anger, guilt, emptiness.",
    seedAr: "حاسس بمشاعر متعبة وودي أتكلم عنها",
    seedEn: "I have heavy feelings I want to talk about",
  },
  {
    id: "thinking",
    titleAr: "التفكير",
    titleEn: "Thinking",
    descAr: "تفكير زائد، وساوس، جلد ذات، مقارنة، كمالية، تسويف.",
    descEn: "Overthinking, rumination, self-criticism, comparison, perfectionism.",
    seedAr: "عقلي ما يهدأ وأفكر كثير",
    seedEn: "My mind won't rest, I overthink a lot",
  },
  {
    id: "personality",
    titleAr: "الشخصية والقرار",
    titleEn: "Self & decisions",
    descAr: "تردد، ضعف ثقة، إرضاء الناس، خوف من الرفض.",
    descEn: "Indecision, low confidence, people-pleasing, fear of rejection.",
    seedAr: "ما أثق بنفسي وصعب علي أقرر",
    seedEn: "I don't trust myself and find it hard to decide",
  },
  {
    id: "relationships",
    titleAr: "العلاقات",
    titleEn: "Relationships",
    descAr: "زواج، طلاق، أهل، أبناء، أصدقاء، علاقة سامة.",
    descEn: "Marriage, divorce, family, kids, friends, toxic relationships.",
    seedAr: "عندي شي في علاقاتي يتعبني",
    seedEn: "Something in my relationships is weighing on me",
  },
  {
    id: "society",
    titleAr: "المجتمع",
    titleEn: "Society",
    descAr: "رهاب اجتماعي، تنمر، تنمر إلكتروني، ضغط اجتماعي.",
    descEn: "Social anxiety, bullying, cyberbullying, social pressure.",
    seedAr: "أحس بضغط من الناس حولي",
    seedEn: "I feel pressure from people around me",
  },
  {
    id: "identity",
    titleAr: "الهوية والمعنى",
    titleEn: "Identity & meaning",
    descAr: "ضياع، أزمة هوية، ضغط المؤثرين، بحث عن الذات.",
    descEn: "Feeling lost, identity crisis, influencer pressure, finding yourself.",
    seedAr: "حاسس إني ضايع وأدور معنى",
    seedEn: "I feel lost and searching for meaning",
  },
  {
    id: "addictions",
    titleAr: "الإدمانات",
    titleEn: "Addictions",
    descAr: "تدخين، تبغ، كحول، ألعاب، جوال، سوشال ميديا.",
    descEn: "Smoking, tobacco, alcohol, gaming, phone, social media.",
    seedAr: "عندي عادة ما أقدر أبطلها",
    seedEn: "I have a habit I can't quit",
  },
  {
    id: "health",
    titleAr: "الصحة",
    titleEn: "Health",
    descAr: "مرض مزمن، صورة الجسد، النوم، الخوف من المرض.",
    descEn: "Chronic illness, body image, sleep, fear of illness.",
    seedAr: "صحتي تشغل بالي وتتعبني نفسياً",
    seedEn: "My health is on my mind and tiring me emotionally",
  },
  {
    id: "work_money",
    titleAr: "العمل والمال",
    titleEn: "Work & money",
    descAr: "احتراق وظيفي، بطالة، ديون، خسارة مالية.",
    descEn: "Burnout, unemployment, debt, financial loss.",
    seedAr: "ضغط الشغل والمال متعبني",
    seedEn: "Work and money pressure is exhausting me",
  },
  {
    id: "spirit",
    titleAr: "الروح والقيم",
    titleEn: "Spirit & values",
    descAr: "شعور بالذنب، أسئلة وجودية، صراع قيمي.",
    descEn: "Guilt, existential questions, value conflict.",
    seedAr: "عندي صراع داخلي مع قيمي",
    seedEn: "I have an inner conflict with my values",
  },
];
