import type { CategoryId, Language, ReplyOption } from "./types";

// ─────────────────────────────────────────────────────────────
// Example response bank for Waleef.
// Tone: short, warm, human, Saudi Arabic by default.
// Structure per reply: validation first → at most one gentle
// question → 2–3 simple options.
// ─────────────────────────────────────────────────────────────

export interface CategoryResponse {
  /** Warm openers (validation first). Pick one at random. */
  validations: Record<Language, string[]>;
  /** A single, gentle question (optional to use). */
  gentleQuestion: Record<Language, string>;
  /** 2–3 simple options offered to the user. */
  options: Record<Language, ReplyOption[]>;
}

export const RESPONSES: Record<CategoryId, CategoryResponse> = {
  general: {
    validations: {
      ar: [
        "أنا أسمعك… وأنا معك.",
        "وجودك هنا خطوة، وأنا ما راح أضغطك.",
        "ما يحتاج تشرح كل شيء الآن… خلّنا نبدأ من أبسط شيء.",
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
    options: {
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
    },
  },

  overthinking: {
    validations: {
      ar: [
        "عقلك تعبان من كثر ما يدور… طبيعي تحس إنك مو مرتاح.",
        "التفكير الزايد يرهق، وأنا فاهم إنه مو بإيدك تطفّيه بسهولة.",
        "أحياناً الراس يصير زحمة… وأنا هنا أساعدك ترتبها بهدوء.",
      ],
      en: [
        "Your mind is tired from spinning so much… it makes sense you don't feel at ease.",
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
        "Anxiety is a heavy feeling, and your body feels it before your mind… I'm with you.",
        "Feels like your chest is tight? Take a breath with me… you're not alone.",
        "It's natural to feel on edge, and I won't ask you to ignore what you feel.",
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
        "Your exhaustion from work is clear, and it's not weakness… you just reached a limit.",
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

  social_anxiety: {
    validations: {
      ar: [
        "الخوف من نظرة الناس مرهق، وأنا ما راح أحكم عليك أبداً.",
        "إنك تحس بالتوتر مع الناس ما يعني إن فيك خطأ… أنت بس حسّاس وصادق.",
        "خطوة إنك تتكلم معي الحين، وهذي مو بسيطة عليك… أقدّرها.",
      ],
      en: [
        "Fear of people's eyes is exhausting, and I will never judge you.",
        "Feeling nervous around people doesn't mean something's wrong with you… you're just sensitive and honest.",
        "Talking to me now is a step, and I know it's not easy for you… I value it.",
      ],
    },
    gentleQuestion: {
      ar: "فيه موقف معيّن قاعد يقلقك، ولا إحساس عام؟",
      en: "Is there a specific situation worrying you, or a general feeling?",
    },
    options: {
      ar: [
        { id: "situation", label: "موقف معيّن يقلقني" },
        { id: "prepare", label: "أجهّز نفسي لموقف" },
        { id: "calm", label: "أحتاج أهدأ" },
      ],
      en: [
        { id: "situation", label: "A specific situation" },
        { id: "prepare", label: "Prepare for a situation" },
        { id: "calm", label: "I need to calm down" },
      ],
    },
  },

  addiction: {
    validations: {
      ar: [
        "إنك تتكلم عن هذا الشي شجاعة، مو عيب… وأنا ما راح ألومك.",
        "العادات اللي تتعبك ما تعرّف مين أنت… وأنا معك بدون حكم.",
        "صعب تواجه شي ماسك فيك، ووقوفك هنا بحد ذاته خطوة كبيرة.",
      ],
      en: [
        "Talking about this takes courage, it's not shameful… and I won't blame you.",
        "The habits that tire you don't define who you are… I'm with you, no judgment.",
        "Facing something that has a grip on you is hard, and standing here is itself a big step.",
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

  identity: {
    validations: {
      ar: [
        "المقارنة تسرق راحتك، واللي تشوفه عن غيرك مو القصة كاملة.",
        "إنك تسأل مين أنت دليل إنك صادق مع نفسك، مو ضايع.",
        "ضغط الصورة المثالية تعبان… وأنت أكثر من اللي يبيّن للناس.",
      ],
      en: [
        "Comparison steals your peace, and what you see of others isn't the whole story.",
        "Asking who you are is a sign you're honest with yourself, not lost.",
        "The pressure of the perfect image is exhausting… and you're more than what shows to people.",
      ],
    },
    gentleQuestion: {
      ar: "وش اللي خلاك تحس بهالمقارنة أكثر شي مؤخراً؟",
      en: "What made you feel this comparison the most lately?",
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

  body_image: {
    validations: {
      ar: [
        "علاقتك بشكلك ممكن تكون متعبة، وأنا أسمعك بدون أي حكم.",
        "قيمتك مو محصورة بمرآة… وأنا أشوف فيك أكثر من الشكل.",
        "صعب تعيش وأنت ناقد نفسك طول الوقت… تستاهل لطف أكثر.",
      ],
      en: [
        "Your relationship with your body can be tiring, and I hear you without any judgment.",
        "Your worth isn't trapped in a mirror… I see more in you than appearance.",
        "It's hard to live while criticizing yourself all the time… you deserve more kindness.",
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

  chronic_illness: {
    validations: {
      ar: [
        "تحمّلك للمرض مو سهل، وكل يوم تعدّيه فيه قوة ما تشوفها أنت.",
        "تعبك جسدي ونفسي، وأنا هنا أسمع الجزء اللي ما تلقى أحد يسمعه.",
        "ما راح أقلل من اللي تمر فيه… وجودك ومشاعرك تهمّني.",
      ],
      en: [
        "Carrying illness isn't easy, and every day you get through has a strength you don't see.",
        "Your exhaustion is physical and emotional, and I'm here to hear the part no one listens to.",
        "I won't minimize what you're going through… your presence and feelings matter to me.",
      ],
    },
    gentleQuestion: {
      ar: "وش أكثر شي تحس إنه يثقل عليك هالأيام؟",
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
        { id: "support", label: "Specialized emotional support" },
      ],
    },
  },

  elderly: {
    validations: {
      ar: [
        "مرحلة التقاعد فيها هدوء بس أحياناً وحدة… وأنا هنا أونسك.",
        "خبرتك وعمرك قيمة، واللي تحس فيه من فراغ شي طبيعي.",
        "ما أنت منسي… وجودك له معنى، وأنا أسمعك بكل احترام.",
      ],
      en: [
        "Retirement has calm but sometimes loneliness… and I'm here to keep you company.",
        "Your experience and years are valuable, and the emptiness you feel is natural.",
        "You're not forgotten… your presence has meaning, and I hear you with full respect.",
      ],
    },
    gentleQuestion: {
      ar: "تحب تحكي لي عن يومك، ولا عن شي ناقصك؟",
      en: "Would you like to tell me about your day, or about something you miss?",
    },
    options: {
      ar: [
        { id: "talk", label: "أحكي عن يومي" },
        { id: "memories", label: "أتكلم عن ذكرياتي" },
        { id: "calm", label: "شي يونّسني" },
      ],
      en: [
        { id: "talk", label: "Talk about my day" },
        { id: "memories", label: "Share my memories" },
        { id: "calm", label: "Something for company" },
      ],
    },
  },

  family: {
    validations: {
      ar: [
        "خلافات البيت تعور لأنها مع أقرب الناس… وأنا أسمعك بدون أي طرف.",
        "تعبك من العائلة مفهوم، ومشاعرك صحيحة حتى لو معقّدة.",
        "أصعب الجروح اللي تجيك من اللي تحبهم… وأنا معك في وسطها.",
      ],
      en: [
        "Family conflicts hurt because they're with the closest people… I hear you, no sides.",
        "Your exhaustion from family makes sense, and your feelings are valid even if tangled.",
        "The hardest wounds come from the ones you love… and I'm with you in the middle of it.",
      ],
    },
    gentleQuestion: {
      ar: "تبي تفضفض عن اللي صار، ولا تبي نفكر بخطوة تريّحك؟",
      en: "Do you want to vent about what happened, or think of a step that eases you?",
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

  financial: {
    validations: {
      ar: [
        "الضغط المالي يخنق ويأثر على كل شي… وأنا فاهم ثقله عليك.",
        "خوفك على وضعك طبيعي، وما هو دليل فشل… الظروف صعبة فعلاً.",
        "تعبك من الفلوس مو بس أرقام… هو قلق على راحة بالك، وأنا معك.",
      ],
      en: [
        "Financial pressure suffocates and touches everything… I get how heavy it is on you.",
        "Your fear about your situation is natural, not a sign of failure… circumstances are genuinely hard.",
        "Your money stress isn't just numbers… it's worry over your peace of mind, and I'm with you.",
      ],
    },
    gentleQuestion: {
      ar: "وش أكثر شي يقلقك في الوضع الحالي؟",
      en: "What worries you most about the current situation?",
    },
    options: {
      ar: [
        { id: "vent", label: "أفضفض عن الضغط" },
        { id: "calm", label: "أهدأ من القلق" },
        { id: "support", label: "أرتّب أولوياتي" },
      ],
      en: [
        { id: "vent", label: "Vent about the pressure" },
        { id: "calm", label: "Ease the worry" },
        { id: "support", label: "Sort my priorities" },
      ],
    },
  },

  spiritual: {
    validations: {
      ar: [
        "الصراع الداخلي مع قيمك يدل إنك إنسان حيّ الضمير… مو ناقص.",
        "إحساس الذنب ثقيل، وأنا أسمعك بدون وعظ ولا لوم.",
        "البحث عن سكينتك الروحية رحلة، وأنا أمشي معك بهدوء.",
      ],
      en: [
        "Inner conflict with your values shows you're a person with a living conscience… not lacking.",
        "Guilt is heavy, and I hear you without preaching or blame.",
        "The search for your spiritual peace is a journey, and I walk it with you calmly.",
      ],
    },
    gentleQuestion: {
      ar: "تبي تتكلم عن اللي يثقل على قلبك بهدوء؟",
      en: "Would you like to talk calmly about what weighs on your heart?",
    },
    options: {
      ar: [
        { id: "vent", label: "أتكلم عن اللي بقلبي" },
        { id: "calm", label: "أحتاج سكينة" },
        { id: "reflect", label: "نتأمل بهدوء" },
      ],
      en: [
        { id: "vent", label: "Talk about what's in my heart" },
        { id: "calm", label: "I need peace" },
        { id: "reflect", label: "Reflect calmly" },
      ],
    },
  },

  trauma: {
    validations: {
      ar: [
        "اللي مريت فيه صعب، وما كان غلطك… وأنا آخذ كلامك بجد.",
        "إنك تحمل ذكرى مؤلمة وتكمّل، هذا مو شي بسيط… أنا معك.",
        "ما راح أطلب منك تتجاوز شي قبل ما تكون جاهز… على راحتك.",
      ],
      en: [
        "What you went through is hard, and it wasn't your fault… I take your words seriously.",
        "Carrying a painful memory and still going on is not a small thing… I'm with you.",
        "I won't ask you to get over anything before you're ready… at your own pace.",
      ],
    },
    gentleQuestion: {
      ar: "تبي تحكي بقدر ما ترتاح، ولا تبي بس أكون معك بصمت؟",
      en: "Would you like to talk as much as feels okay, or just have me here quietly?",
    },
    options: {
      ar: [
        { id: "talk", label: "أحكي على راحتي" },
        { id: "ground", label: "أحتاج أثبّت نفسي" },
        { id: "support", label: "أوصل لمختص آمن" },
      ],
      en: [
        { id: "talk", label: "Talk at my own pace" },
        { id: "ground", label: "I need to ground myself" },
        { id: "support", label: "Reach a safe specialist" },
      ],
    },
  },

  crisis: {
    // Crisis copy is handled by the crisis module; kept here for completeness.
    validations: {
      ar: ["أنا معك الحين… وسلامتك أهم شي."],
      en: ["I'm with you right now… your safety is what matters most."],
    },
    gentleQuestion: {
      ar: "تقدر تبقى معي لحظة؟",
      en: "Can you stay with me for a moment?",
    },
    options: {
      ar: [{ id: "crisis", label: "أحتاج أحد يساعدني الآن" }],
      en: [{ id: "crisis", label: "I need someone to help me now" }],
    },
  },
};

// ─────────────────────────────────────────────────────────────
// Quick Relief Mode copy.
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

// Replies for the silent-mode soft options + quick chips, keyed by option id.
export const FOLLOWUP_REPLIES: Record<string, Record<Language, string>> = {
  calm: {
    ar: "خذ نفس عميق معي… شهيق هادئ من الأنف، وزفير طويل من الفم. مرّة ثانية، على مهلك. أنا هنا.",
    en: "Take a deep breath with me… a calm inhale through the nose, a long exhale through the mouth. Once more, slowly. I'm here.",
  },
  breathe: {
    ar: "خلّنا نهدّي سوا: شهيق ٤ عدّات… امسك ٤… زفير ٦. كرّرها ثلاث مرات بهدوء، وأنا معك في كل نفس.",
    en: "Let's calm together: inhale for 4… hold for 4… exhale for 6. Repeat it three times slowly, and I'm with you on every breath.",
  },
  calm_min: {
    ar: "تمام، دقيقة وحدة وبس. حط يدك على صدرك، وخذ ثلاث أنفاس بطيئة معي. أنت في أمان هذي اللحظة.",
    en: "Okay, just one minute. Put your hand on your chest and take three slow breaths with me. You're safe in this moment.",
  },
  ground: {
    ar: "خلّنا نثبّت نفسك: سمّ لي ٣ أشياء تشوفها حولك الحين… بدون استعجال. أنا أنتظرك.",
    en: "Let's ground you: name 3 things you can see around you right now… no rush. I'm waiting for you.",
  },
  vent: {
    ar: "أنا كلّي لك. اكتب اللي على قلبك، حتى لو كلمة وحدة أو كلام مبعثر… ما راح أقاطعك ولا أحكم عليك.",
    en: "I'm all yours. Write what's on your heart, even one word or scattered thoughts… I won't interrupt or judge you.",
  },
  vent_fast: {
    ar: "اكتب اللي يضايقك بسرعة، بدون ترتيب… طلّعه وبس. أنا أقراك.",
    en: "Write what's bothering you quickly, no order… just let it out. I'm reading you.",
  },
  organize: {
    ar: "خلّنا نرتّبها: وش أكثر شي ضاغط عليك الحين؟ نبدأ فيه وحده بس، والباقي ننتظره.",
    en: "Let's organize: what's pressing on you the most right now? We'll start with just that one, the rest can wait.",
  },
  writeout: {
    ar: "زين. فضفض اللي في بالك بدون ما ترتّبه… أنا أساعدك بعدين نلملمه سوا.",
    en: "Good. Pour out what's on your mind without arranging it… I'll help you gather it together after.",
  },
  oneThing: {
    ar: "خلّنا نختار فكرة وحدة بس نشتغل عليها الحين. وش أكثر وحدة تلح عليك؟",
    en: "Let's pick just one thought to work on now. Which one is pressing on you the most?",
  },
  browse: {
    ar: "ولا يهمك، تصفّح على راحتك. أنا موجود هنا متى ما حبيت تتكلم، ولو بعد شوي.",
    en: "No worries, browse at your ease. I'm here whenever you feel like talking, even later.",
  },
  rest: {
    ar: "خذ لك لحظة هدوء… ما فيه شي مستعجل. أنا باقي معك بدون أي ضغط.",
    en: "Take a quiet moment… nothing is urgent. I'm staying with you, no pressure at all.",
  },
  talk: {
    ar: "أنا أسمعك. احكِ على راحتك، من وين ما تبي تبدأ.",
    en: "I'm listening. Talk at your ease, start wherever you want.",
  },
  reflect: {
    ar: "خلّنا نأخذ نفس ونتأمل بهدوء… ما فيه إجابات لازم تجي الحين. بس نكون حاضرين.",
    en: "Let's take a breath and reflect calmly… no answers have to come now. Just being present.",
  },
  memories: {
    ar: "يا هلا بذكرياتك. احكِ لي عنها، أنا أحب أسمع.",
    en: "I'd love to hear your memories. Tell me about them, I love to listen.",
  },
  values: {
    ar: "خلّنا نلقى وش يهمّك أنت فعلاً، بعيد عن الناس. وش الشي اللي لو سويته تحس إنك صادق مع نفسك؟",
    en: "Let's find what truly matters to you, away from others. What's one thing that, if you did it, you'd feel true to yourself?",
  },
  kindness: {
    ar: "جرّب تكلّم نفسك مثل ما تكلّم صديق تحبه… وش كان بتقول له لو كان مكانك؟",
    en: "Try talking to yourself the way you'd talk to a friend you love… what would you say to them in your place?",
  },
  boundaries: {
    ar: "خلّنا نرتّب أولوياتك: وش أهم شيئين فقط لازم تخلّصهم، والباقي يستنى؟",
    en: "Let's sort your priorities: what are only the two most important things to finish, and the rest can wait?",
  },
  smallstep: {
    ar: "خطوة صغيرة وحدة بس لهالأسبوع… مو لازم تكون كبيرة. وش أصغر شي تحس إنك تقدر عليه؟",
    en: "Just one small step for this week… it doesn't have to be big. What's the smallest thing you feel you can do?",
  },
  situation: {
    ar: "احكِ لي عن الموقف اللي يقلقك، وخلّنا نفككه سوا خطوة خطوة.",
    en: "Tell me about the situation worrying you, and let's unpack it together step by step.",
  },
  prepare: {
    ar: "خلّنا نجهّزك بهدوء: وش أكثر جزء في الموقف يخوّفك؟ نبدأ منه.",
    en: "Let's prepare you calmly: what part of the situation scares you most? We'll start there.",
  },
  step: {
    ar: "خلّنا نفكر بخطوة وحدة بسيطة تريّحك، بدون ما نحل كل شي مرة وحدة. وش أقربها لك؟",
    en: "Let's think of one simple step that eases you, without solving everything at once. Which feels closest?",
  },
};
