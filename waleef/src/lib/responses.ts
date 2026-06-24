import type { CategoryId, Language, ReplyOption } from "./types";

// ─────────────────────────────────────────────────────────────
// Example response bank for Waleef.
// Tone: short, warm, human, Saudi Arabic by default.
// Structure: validation first → one gentle question max → 2–3 options.
// ─────────────────────────────────────────────────────────────

export interface CategoryResponse {
  validations: Record<Language, string[]>;
  gentleQuestion: Record<Language, string>;
  options: Record<Language, ReplyOption[]>;
}

const ventCalmBrowse = {
  ar: [
    { id: "vent", label: "ودي أفضفض" },
    { id: "calm", label: "أحتاج أهدأ" },
    { id: "browse", label: "بس أتصفح" },
  ],
  en: [
    { id: "vent", label: "I want to vent" },
    { id: "calm", label: "I need to calm down" },
    { id: "browse", label: "Just browsing" },
  ],
};

export const RESPONSES: Record<CategoryId, CategoryResponse> = {
  unknown: {
    validations: {
      ar: [
        "أنا أسمعك… وأنا معك.",
        "وجودك هنا خطوة، وأنا ما راح أضغطك.",
        "ما تحتاج تشرح كل شيء الآن… خلّنا نبدأ من أبسط شيء.",
        "أنت مو لحالك.",
      ],
      en: [
        "I hear you… and I'm with you.",
        "You being here is already a step, and I won't push you.",
        "You don't have to explain everything right now… let's start with the simplest thing.",
        "You're not alone in this.",
      ],
    },
    gentleQuestion: {
      ar: "وش أقرب شي تحس إنك تحتاجه الحين؟",
      en: "What's the closest thing you feel you need right now?",
    },
    options: ventCalmBrowse,
  },

  emotions: {
    validations: {
      ar: [
        "مشاعرك ثقيلة، وأنا آخذها على محمل الجد… ما راح أقلل منها.",
        "طبيعي تحس بهذا الشي، ومشاعرك صحيحة حتى لو مبعثرة.",
        "أنا هنا أسمع اللي بداخلك، بدون حكم وبدون استعجال.",
      ],
      en: [
        "Your feelings are heavy, and I take them seriously… I won't minimize them.",
        "It's natural to feel this, and your feelings are valid even if tangled.",
        "I'm here to hear what's inside you, no judgment and no rush.",
      ],
    },
    gentleQuestion: {
      ar: "تحب تحط اسم للي تحس فيه الحين، ولا بس تفضفض؟",
      en: "Want to name what you feel right now, or just vent?",
    },
    options: ventCalmBrowse,
  },

  overthinking: {
    validations: {
      ar: [
        "عقلك تعبان من كثر ما يدور… طبيعي تحس إنك مو مرتاح.",
        "التفكير الزايد يرهق، وأنا فاهم إنه مو بإيدك تطفّيه بسهولة.",
        "أحياناً الراس يصير زحمة… وأنا هنا أساعدك ترتبها بهدوء.",
      ],
      en: [
        "Your mind is tired from spinning… it makes sense you don't feel at ease.",
        "Overthinking is exhausting, and I get that you can't just switch it off.",
        "Sometimes the head gets crowded… I'm here to help you sort it calmly.",
      ],
    },
    gentleQuestion: {
      ar: "وش أكثر فكرة تلف في بالك الحين؟",
      en: "Which thought is looping the most right now?",
    },
    options: {
      ar: [
        { id: "writeout", label: "أكتب اللي في بالي" },
        { id: "oneThing", label: "نركّز على شي واحد" },
        { id: "calm", label: "أحتاج أهدأ أول" },
      ],
      en: [
        { id: "writeout", label: "Write out what's on my mind" },
        { id: "oneThing", label: "Focus on one thing" },
        { id: "calm", label: "I need to calm down first" },
      ],
    },
  },

  anxiety: {
    validations: {
      ar: [
        "القلق إحساس ثقيل، وجسمك يحس فيه قبل عقلك… أنا معك.",
        "حاسّ إن صدرك ضايق؟ خذ نفس معي… ما أنت لحالك.",
        "طبيعي تتوتر، وما راح أطلب منك تتجاهل اللي تحس فيه.",
      ],
      en: [
        "Anxiety is heavy, and your body feels it before your mind… I'm with you.",
        "Feels like your chest is tight? Take a breath with me… you're not alone.",
        "It's natural to feel on edge, and I won't ask you to ignore it.",
      ],
    },
    gentleQuestion: {
      ar: "تحب نهدّي نفسك سوا بدقيقة، ولا تحب تحكي لي وش صار؟",
      en: "Want to calm your body together for a minute, or tell me what happened?",
    },
    options: {
      ar: [
        { id: "breathe", label: "أهدأ خلال دقيقة" },
        { id: "talk", label: "أحكي وش صار" },
        { id: "ground", label: "تمرين تأريض بسيط" },
      ],
      en: [
        { id: "breathe", label: "Calm down in a minute" },
        { id: "talk", label: "Tell you what happened" },
        { id: "ground", label: "A simple grounding exercise" },
      ],
    },
  },

  burnout: {
    validations: {
      ar: [
        "تعبك من الشغل واضح، وما هو ضعف منك… أنت بس وصلت لحد.",
        "الاحتراق الوظيفي حقيقي، ووقفتك هنا تقول إنك تستاهل راحة.",
        "تستاهل لحظة تلتقط فيها نفسك… مو كل شي لازم يكون إنتاج.",
      ],
      en: [
        "Your exhaustion from work is clear, and it's not weakness… you reached a limit.",
        "Burnout is real, and your pause here says you deserve rest.",
        "You deserve a moment to catch your breath… not everything has to be productivity.",
      ],
    },
    gentleQuestion: {
      ar: "وش اللي يستنزفك أكثر شي بالشغل هالأيام؟",
      en: "What's draining you the most at work these days?",
    },
    options: {
      ar: [
        { id: "vent", label: "أفضفض عن الشغل" },
        { id: "boundaries", label: "نرتّب أولوياتي" },
        { id: "rest", label: "أحتاج لحظة هدوء" },
      ],
      en: [
        { id: "vent", label: "Vent about work" },
        { id: "boundaries", label: "Sort my priorities" },
        { id: "rest", label: "I need a quiet moment" },
      ],
    },
  },

  loneliness: {
    validations: {
      ar: [
        "الوحدة تثقل، وإحساسك إن محد معك صعب… بس أنا هنا الحين.",
        "إنك تحس بالوحدة ما يعني إن فيك خطأ… كثير ناس طيبين يمرون فيها.",
        "أنا موجود، وما راح أتركك تحس إنك تتكلم للفراغ.",
      ],
      en: [
        "Loneliness is heavy, and feeling no one's there is hard… but I'm here now.",
        "Feeling lonely doesn't mean something's wrong with you… many kind people feel it.",
        "I'm here, and I won't let you feel like you're talking to emptiness.",
      ],
    },
    gentleQuestion: {
      ar: "تحب تحكي لي عن يومك، ولا عن الشي اللي يخليك تحس بالوحدة؟",
      en: "Want to tell me about your day, or about what makes you feel lonely?",
    },
    options: {
      ar: [
        { id: "talk", label: "أحكي عن يومي" },
        { id: "vent", label: "أفضفض" },
        { id: "calm", label: "شي يونّسني" },
      ],
      en: [
        { id: "talk", label: "Talk about my day" },
        { id: "vent", label: "Vent" },
        { id: "calm", label: "Something for company" },
      ],
    },
  },

  self_confidence: {
    validations: {
      ar: [
        "إنك تشكّ في نفسك مرهق، وأنا أشوف إنك أقوى مما تتصور.",
        "صعوبة القرار وإرضاء الناس تتعب… وأنت تستاهل تحط نفسك أول.",
        "ما راح أحكم عليك، وخطوتك إنك تتكلم تدل على شجاعة.",
      ],
      en: [
        "Doubting yourself is exhausting, and I see you're stronger than you think.",
        "Indecision and people-pleasing are tiring… you deserve to put yourself first.",
        "I won't judge you, and speaking up shows courage.",
      ],
    },
    gentleQuestion: {
      ar: "فيه قرار أو موقف معيّن قاعد يضغطك الحين؟",
      en: "Is there a decision or situation pressuring you right now?",
    },
    options: {
      ar: [
        { id: "situation", label: "موقف معيّن يضغطني" },
        { id: "values", label: "نلقى وش يهمّني أنا" },
        { id: "vent", label: "أفضفض" },
      ],
      en: [
        { id: "situation", label: "A specific situation" },
        { id: "values", label: "Find what matters to me" },
        { id: "vent", label: "Vent" },
      ],
    },
  },

  relationships: {
    validations: {
      ar: [
        "العلاقات تعور لأنها مع أقرب الناس… وأنا أسمعك بدون أي طرف.",
        "تعبك منها مفهوم، ومشاعرك صحيحة حتى لو معقّدة.",
        "أصعب الجروح تجي من اللي نحبهم… وأنا معك في وسطها.",
      ],
      en: [
        "Relationships hurt because they're with the closest people… I hear you, no sides.",
        "Your exhaustion makes sense, and your feelings are valid even if tangled.",
        "The hardest wounds come from those we love… I'm with you in the middle of it.",
      ],
    },
    gentleQuestion: {
      ar: "تبي تفضفض عن اللي صار، ولا تبي نفكر بخطوة تريّحك؟",
      en: "Want to vent about what happened, or think of a step that eases you?",
    },
    options: {
      ar: [
        { id: "vent", label: "أفضفض عن اللي صار" },
        { id: "step", label: "نفكر بخطوة تريّحني" },
        { id: "support", label: "مستشار أسري" },
      ],
      en: [
        { id: "vent", label: "Vent about what happened" },
        { id: "step", label: "Think of an easing step" },
        { id: "support", label: "A family counselor" },
      ],
    },
  },

  family: {
    validations: {
      ar: [
        "خلافات البيت تعور، وأنا أسمعك بدون ما أحط لوم على أحد.",
        "تعبك من العائلة مفهوم، ومشاعرك لها مكان عندي.",
        "البيت المفروض يريّح، ولما يتعب يكون الألم مضاعف… أنا معك.",
      ],
      en: [
        "Family conflict hurts, and I hear you without blaming anyone.",
        "Your exhaustion from family makes sense, and your feelings have a place with me.",
        "Home should be a rest, and when it tires you the pain doubles… I'm with you.",
      ],
    },
    gentleQuestion: {
      ar: "تبي تحكي لي وش صار، على راحتك؟",
      en: "Would you like to tell me what happened, at your ease?",
    },
    options: {
      ar: [
        { id: "vent", label: "أفضفض عن اللي صار" },
        { id: "step", label: "نفكر بخطوة تريّحني" },
        { id: "support", label: "مستشار أسري" },
      ],
      en: [
        { id: "vent", label: "Vent about what happened" },
        { id: "step", label: "Think of an easing step" },
        { id: "support", label: "A family counselor" },
      ],
    },
  },

  work_money: {
    validations: {
      ar: [
        "الضغط المالي يخنق ويأثر على كل شي… وأنا فاهم ثقله عليك.",
        "خوفك على وضعك طبيعي، وما هو دليل فشل… الظروف صعبة فعلاً.",
        "تعبك مو بس أرقام… هو قلق على راحة بالك، وأنا معك.",
      ],
      en: [
        "Financial pressure suffocates and touches everything… I get how heavy it is.",
        "Your fear about your situation is natural, not a sign of failure… it's genuinely hard.",
        "Your exhaustion isn't just numbers… it's worry over your peace, and I'm with you.",
      ],
    },
    gentleQuestion: {
      ar: "وش أكثر شي يقلقك في الوضع الحالي؟",
      en: "What worries you most about the current situation?",
    },
    options: {
      ar: [
        { id: "vent", label: "أفضفض عن الضغط" },
        { id: "boundaries", label: "أرتّب أولوياتي" },
        { id: "calm", label: "أهدأ من القلق" },
      ],
      en: [
        { id: "vent", label: "Vent about the pressure" },
        { id: "boundaries", label: "Sort my priorities" },
        { id: "calm", label: "Ease the worry" },
      ],
    },
  },

  addictions: {
    validations: {
      ar: [
        "إنك تتكلم عن هذا الشي شجاعة، مو عيب… وأنا ما راح ألومك.",
        "العادات اللي تتعبك ما تعرّف مين أنت… وأنا معك بدون حكم.",
        "صعب تواجه شي ماسك فيك، ووقوفك هنا بحد ذاته خطوة كبيرة.",
      ],
      en: [
        "Talking about this takes courage, it's not shameful… and I won't blame you.",
        "The habits that tire you don't define who you are… I'm with you, no judgment.",
        "Facing something that grips you is hard, and standing here is a big step.",
      ],
    },
    gentleQuestion: {
      ar: "تبي نبدأ بخطوة صغيرة وحدة، ولا بس تبي تتكلم الحين؟",
      en: "Want to start with one small step, or just talk for now?",
    },
    options: {
      ar: [
        { id: "talk", label: "بس أبي أتكلم" },
        { id: "smallstep", label: "خطوة صغيرة أبدأ فيها" },
        { id: "support", label: "أوصل لمختص يفهمني" },
      ],
      en: [
        { id: "talk", label: "Just want to talk" },
        { id: "smallstep", label: "One small step to start" },
        { id: "support", label: "Reach a specialist who gets it" },
      ],
    },
  },

  body_image: {
    validations: {
      ar: [
        "علاقتك بشكلك ممكن تكون متعبة، وأنا أسمعك بدون أي حكم.",
        "قيمتك مو محصورة بمرآة… وأنا أشوف فيك أكثر من الشكل.",
        "صعب تعيش وأنت ناقد نفسك طول الوقت… تستاهل لطف أكثر.",
      ],
      en: [
        "Your relationship with your body can be tiring, and I hear you without judgment.",
        "Your worth isn't trapped in a mirror… I see more in you than appearance.",
        "It's hard to live while criticizing yourself constantly… you deserve more kindness.",
      ],
    },
    gentleQuestion: {
      ar: "متى تحس إن هالإحساس يكبر عليك أكثر؟",
      en: "When does this feeling grow on you the most?",
    },
    options: {
      ar: [
        { id: "vent", label: "أفضفض" },
        { id: "kindness", label: "نتكلم بلطف عن نفسي" },
        { id: "support", label: "أوصل لمختص" },
      ],
      en: [
        { id: "vent", label: "Vent" },
        { id: "kindness", label: "Talk kindly about myself" },
        { id: "support", label: "Reach a specialist" },
      ],
    },
  },

  identity: {
    validations: {
      ar: [
        "إنك تسأل مين أنت دليل إنك صادق مع نفسك، مو ضايع.",
        "المقارنة تسرق راحتك، واللي تشوفه عن غيرك مو القصة كاملة.",
        "ضغط الصورة المثالية تعبان… وأنت أكثر من اللي يبيّن للناس.",
      ],
      en: [
        "Asking who you are shows you're honest with yourself, not lost.",
        "Comparison steals your peace, and what you see of others isn't the whole story.",
        "The pressure of the perfect image is exhausting… you're more than what shows.",
      ],
    },
    gentleQuestion: {
      ar: "وش اللي خلاك تحس بهالضياع أكثر شي مؤخراً؟",
      en: "What made you feel this lost the most lately?",
    },
    options: {
      ar: [
        { id: "vent", label: "أفضفض عن إحساسي" },
        { id: "values", label: "نلقى وش يهمّني أنا" },
        { id: "calm", label: "أحتاج أهدأ" },
      ],
      en: [
        { id: "vent", label: "Vent about how I feel" },
        { id: "values", label: "Find what matters to me" },
        { id: "calm", label: "I need to calm down" },
      ],
    },
  },

  spiritual_values: {
    validations: {
      ar: [
        "الصراع الداخلي مع قيمك يدل إنك إنسان حيّ الضمير… مو ناقص.",
        "إحساس الذنب ثقيل، وأنا أسمعك بدون وعظ ولا لوم.",
        "البحث عن سكينتك رحلة، وأنا أمشي معك بهدوء.",
      ],
      en: [
        "Inner conflict with your values shows a living conscience… you're not lacking.",
        "Guilt is heavy, and I hear you without preaching or blame.",
        "The search for your peace is a journey, and I walk it with you calmly.",
      ],
    },
    gentleQuestion: {
      ar: "تبي تتكلم عن اللي يثقل على قلبك بهدوء؟",
      en: "Would you like to talk calmly about what weighs on your heart?",
    },
    options: {
      ar: [
        { id: "vent", label: "أتكلم عن اللي بقلبي" },
        { id: "reflect", label: "نتأمل بهدوء" },
        { id: "calm", label: "أحتاج سكينة" },
      ],
      en: [
        { id: "vent", label: "Talk about what's in my heart" },
        { id: "reflect", label: "Reflect calmly" },
        { id: "calm", label: "I need peace" },
      ],
    },
  },

  health: {
    validations: {
      ar: [
        "تعبك مع صحتك مو سهل، وكل يوم تعدّيه فيه قوة ما تشوفها أنت.",
        "القلق على صحتك طبيعي، وأنا هنا أسمع الجزء النفسي اللي يتعبك.",
        "ما راح أقلل من اللي تمر فيه… مشاعرك وجسمك يهمّوني.",
      ],
      en: [
        "Struggling with your health isn't easy, and every day you get through holds strength you don't see.",
        "Worrying about your health is natural, and I'm here for the emotional part that tires you.",
        "I won't minimize what you're going through… your feelings and body matter to me.",
      ],
    },
    gentleQuestion: {
      ar: "وش أكثر شي يثقل عليك هالأيام؟",
      en: "What feels heaviest on you these days?",
    },
    options: {
      ar: [
        { id: "vent", label: "أفضفض عن تعبي" },
        { id: "rest", label: "لحظة هدوء" },
        { id: "support", label: "دعم نفسي متخصص" },
      ],
      en: [
        { id: "vent", label: "Vent about my exhaustion" },
        { id: "rest", label: "A quiet moment" },
        { id: "support", label: "Specialized support" },
      ],
    },
  },

  crisis: {
    validations: {
      ar: ["أنا معك الآن… وسلامتك أهم شي."],
      en: ["I'm with you right now… your safety matters most."],
    },
    gentleQuestion: {
      ar: "تقدر تبقى معي لحظة؟",
      en: "Can you stay with me for a moment?",
    },
    options: {
      ar: [{ id: "help_now", label: "أحتاج أحد يساعدني الآن" }],
      en: [{ id: "help_now", label: "I need someone to help me now" }],
    },
  },
};

// ─────────────────────────────────────────────────────────────
// Quick Relief Mode
// ─────────────────────────────────────────────────────────────

export const QUICK_RELIEF: Record<Language, { intro: string; options: ReplyOption[] }> = {
  ar: {
    intro: "تمام… ما راح أطوّل عليك. اختر أقرب شيء تحتاجه الآن:",
    options: [
      { id: "calm_min", label: "أهدأ خلال دقيقة" },
      { id: "organize", label: "أرتّب أفكاري" },
      { id: "vent_fast", label: "أفضفض بسرعة" },
      { id: "help_now", label: "أحتاج أحد يساعدني" },
    ],
  },
  en: {
    intro: "Alright… I won't keep you long. Pick the closest thing you need now:",
    options: [
      { id: "calm_min", label: "Calm down in a minute" },
      { id: "organize", label: "Organize my thoughts" },
      { id: "vent_fast", label: "Vent quickly" },
      { id: "help_now", label: "I need someone to help me" },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// Silent Mode (empty / emoji-only messages)
// ─────────────────────────────────────────────────────────────

export const SILENT_MODE: Record<Language, { text: string; options: ReplyOption[] }> = {
  ar: {
    text: "وصلتني…\nأنا هنا.",
    options: [
      { id: "stay_silent", label: "ابقَ معي بصمت" },
      { id: "soothe", label: "قل لي شيء يهديني" },
      { id: "write", label: "أريد أن أكتب" },
      { id: "help_now", label: "أحتاج مساعدة" },
    ],
  },
  en: {
    text: "It reached me…\nI'm here.",
    options: [
      { id: "stay_silent", label: "Stay with me in silence" },
      { id: "soothe", label: "Say something soothing" },
      { id: "write", label: "I want to write" },
      { id: "help_now", label: "I need help" },
    ],
  },
};

// Crying mode — minimal, no questions.
export const CRYING_MODE: Record<Language, string> = {
  ar: "خذ وقتك…\nمو لازم تقول شيء الآن.\nأنا هنا.",
  en: "Take your time…\nyou don't have to say anything now.\nI'm here.",
};

// ─────────────────────────────────────────────────────────────
// Follow-up replies, keyed by option id.
// ─────────────────────────────────────────────────────────────

export const FOLLOWUP_REPLIES: Record<string, Record<Language, string>> = {
  calm: {
    ar: "خذ نفس عميق معي… شهيق هادئ من الأنف، وزفير طويل من الفم. مرّة ثانية، على مهلك. أنا هنا.",
    en: "Take a deep breath with me… a calm inhale, a long exhale. Once more, slowly. I'm here.",
  },
  breathe: {
    ar: "خلّنا نهدّي سوا: شهيق ٤ عدّات… امسك ٤… زفير ٦. كرّرها ثلاث مرات بهدوء، وأنا معك في كل نفس.",
    en: "Let's calm together: inhale 4… hold 4… exhale 6. Three times slowly, and I'm with you on every breath.",
  },
  calm_min: {
    ar: "تمام، دقيقة وحدة وبس. حط يدك على صدرك، وخذ ثلاث أنفاس بطيئة معي. أنت في أمان هذي اللحظة.",
    en: "Okay, just one minute. Hand on your chest, three slow breaths with me. You're safe this moment.",
  },
  ground: {
    ar: "خلّنا نثبّت نفسك: سمّ لي ٣ أشياء تشوفها حولك الحين… بدون استعجال. أنا أنتظرك.",
    en: "Let's ground you: name 3 things you can see around you… no rush. I'm waiting for you.",
  },
  vent: {
    ar: "أنا كلّي لك. اكتب اللي على قلبك، حتى لو كلمة وحدة… ما راح أقاطعك ولا أحكم عليك.",
    en: "I'm all yours. Write what's on your heart, even one word… I won't interrupt or judge you.",
  },
  vent_fast: {
    ar: "اكتب اللي يضايقك بسرعة، بدون ترتيب… طلّعه وبس. أنا أقراك.",
    en: "Write what's bothering you quickly, no order… just let it out. I'm reading you.",
  },
  organize: {
    ar: "خلّنا نرتّبها: وش أكثر شي ضاغط عليك الحين؟ نبدأ فيه وحده بس، والباقي ننتظره.",
    en: "Let's organize: what's pressing on you most right now? We'll start with that one.",
  },
  writeout: {
    ar: "زين. فضفض اللي في بالك بدون ما ترتّبه… وأنا أساعدك بعدين نلملمه سوا.",
    en: "Good. Pour out what's on your mind unsorted… I'll help you gather it after.",
  },
  oneThing: {
    ar: "خلّنا نختار فكرة وحدة بس نشتغل عليها الحين. وش أكثر وحدة تلح عليك؟",
    en: "Let's pick just one thought to work on now. Which presses on you the most?",
  },
  browse: {
    ar: "ولا يهمك، تصفّح على راحتك. أنا موجود هنا متى ما حبيت تتكلم.",
    en: "No worries, browse at your ease. I'm here whenever you want to talk.",
  },
  rest: {
    ar: "خذ لك لحظة هدوء… ما فيه شي مستعجل. أنا باقي معك بدون أي ضغط.",
    en: "Take a quiet moment… nothing is urgent. I'm staying with you, no pressure.",
  },
  talk: {
    ar: "أنا أسمعك. احكِ على راحتك، من وين ما تبي تبدأ.",
    en: "I'm listening. Talk at your ease, start wherever you want.",
  },
  reflect: {
    ar: "خلّنا نأخذ نفس ونتأمل بهدوء… ما فيه إجابات لازم تجي الحين. بس نكون حاضرين.",
    en: "Let's take a breath and reflect calmly… no answers have to come now. Just being present.",
  },
  values: {
    ar: "خلّنا نلقى وش يهمّك أنت فعلاً، بعيد عن الناس. وش الشي اللي لو سويته تحس إنك صادق مع نفسك؟",
    en: "Let's find what truly matters to you, away from others. What would make you feel true to yourself?",
  },
  kindness: {
    ar: "جرّب تكلّم نفسك مثل ما تكلّم صديق تحبه… وش كان بتقول له لو كان مكانك؟",
    en: "Try talking to yourself like a friend you love… what would you tell them in your place?",
  },
  boundaries: {
    ar: "خلّنا نرتّب أولوياتك: وش أهم شيئين فقط لازم تخلّصهم، والباقي يستنى؟",
    en: "Let's sort priorities: what are only the two most important things, and the rest can wait?",
  },
  smallstep: {
    ar: "خطوة صغيرة وحدة بس لهالأسبوع… مو لازم تكون كبيرة. وش أصغر شي تحس إنك تقدر عليه؟",
    en: "Just one small step for this week… not big. What's the smallest thing you can do?",
  },
  situation: {
    ar: "احكِ لي عن الموقف اللي يضغطك، وخلّنا نفككه سوا خطوة خطوة.",
    en: "Tell me about the situation pressuring you, and let's unpack it together step by step.",
  },
  step: {
    ar: "خلّنا نفكر بخطوة وحدة بسيطة تريّحك، بدون ما نحل كل شي مرة وحدة. وش أقربها لك؟",
    en: "Let's think of one simple step that eases you, without solving everything at once.",
  },
  stay_silent: {
    ar: "تمام… أنا باقي معك. ما فيه كلام لازم. خذ وقتك، ووجودك يكفي.",
    en: "Okay… I'm staying with you. No words needed. Take your time, your presence is enough.",
  },
  soothe: {
    ar: "خذ نفس… أنت في مكان آمن هذي اللحظة. اللي تحس فيه راح يخف، وأنا ما راح أروح.",
    en: "Take a breath… you're in a safe place this moment. What you feel will ease, and I won't leave.",
  },
  write: {
    ar: "أنا أقراك. اكتب اللي تبي، بأي ترتيب، وأنا معك كلمة كلمة.",
    en: "I'm reading you. Write whatever you want, any order, and I'm with you word by word.",
  },
};
