import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import type {
  AiAnalysisInput,
  AiAnalysisOutput,
  AiSectionKey,
  ReadinessScores,
} from "@/types";
import type { Establishment, QuestionnaireAnswer } from "@prisma/client";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 8096;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  return new Anthropic({ apiKey });
}

// ─── Establishment Context Builder ────────────────────────────────────────────

function buildEstablishmentContext(
  establishment: Establishment,
  answers: QuestionnaireAnswer[]
): string {
  const answerMap: Record<string, Record<string, string | null>> = {};

  for (const answer of answers) {
    if (!answerMap[answer.section]) answerMap[answer.section] = {};
    answerMap[answer.section][answer.questionKey] =
      answer.answerValue ?? (answer.answerJson ? JSON.stringify(answer.answerJson) : null);
  }

  return `
# معلومات المنشأة

**الاسم بالعربية:** ${establishment.nameAr ?? "غير محدد"}
**الاسم بالإنجليزية:** ${establishment.nameEn ?? "غير محدد"}
**نوع النشاط:** ${establishment.activityType ?? "غير محدد"}
**المدينة:** ${establishment.city ?? "غير محدد"}
**سنة التأسيس:** ${establishment.foundingYear ?? "غير محدد"}
**عدد الفروع:** ${establishment.branchCount ?? "غير محدد"}
**الموقع الإلكتروني:** ${establishment.websiteUrl ?? "غير محدد"}

## المنتجات والخدمات
**المنتجات الرئيسية:** ${establishment.mainProducts ?? answerMap.products?.mainProducts ?? "غير محدد"}
**الأكثر مبيعاً:** ${establishment.bestSeller ?? answerMap.products?.bestSeller ?? "غير محدد"}
**متوسط السعر:** ${establishment.avgPrice ? `${establishment.avgPrice} ريال` : "غير محدد"}
**نقاط التميز:** ${establishment.uniquePoints ?? answerMap.products?.uniquePoints ?? "غير محدد"}
**وصفات موثقة:** ${establishment.hasDocRecipes === true ? "نعم" : establishment.hasDocRecipes === false ? "لا" : "غير محدد"}
**جودة قابلة للتكرار:** ${establishment.qualityReplicable === true ? "نعم" : establishment.qualityReplicable === false ? "لا" : "غير محدد"}

## السوق والمنافسة
**العميل المستهدف:** ${establishment.targetCustomer ?? answerMap.market?.targetCustomer ?? "غير محدد"}
**المنافسون:** ${establishment.competitors ?? answerMap.market?.competitors ?? "غير محدد"}
**المدن المستهدفة للتوسع:** ${establishment.expansionCities ?? answerMap.market?.expansionCities ?? "غير محدد"}
**قوة الطلب:** ${establishment.demandStrength ?? answerMap.market?.demandStrength ?? "غير محدد"}
**الموسمية:** ${establishment.seasonality ?? answerMap.market?.seasonality ?? "غير محدد"}

## المالية
**متوسط المبيعات الشهرية:** ${establishment.avgMonthlySales ? `${establishment.avgMonthlySales} ريال` : "غير محدد"}
**متوسط الطلبات اليومية:** ${establishment.avgDailyOrders ?? "غير محدد"}
**متوسط قيمة الفاتورة:** ${establishment.avgInvoiceValue ? `${establishment.avgInvoiceValue} ريال` : "غير محدد"}
**تكلفة البضاعة المباعة:** ${establishment.cogs ? `${establishment.cogs}%` : "غير محدد"}
**الإيجار:** ${establishment.rent ? `${establishment.rent} ريال` : "غير محدد"}
**الرواتب:** ${establishment.salaries ? `${establishment.salaries} ريال` : "غير محدد"}
**مصاريف التشغيل:** ${establishment.opExpenses ? `${establishment.opExpenses} ريال` : "غير محدد"}
**صافي الربح:** ${establishment.netProfit ? `${establishment.netProfit} ريال` : "غير محدد"}
**تكلفة فرع جديد:** ${establishment.newBranchCost ? `${establishment.newBranchCost} ريال` : "غير محدد"}
**فترة الاسترداد:** ${establishment.paybackPeriod ?? "غير محدد"}

## العمليات والأنظمة
**وجود SOPs:** ${establishment.hasSOPs === true ? "نعم" : establishment.hasSOPs === false ? "لا" : "غير محدد"}
**نظام POS:** ${establishment.hasPOS === true ? "نعم" : establishment.hasPOS === false ? "لا" : "غير محدد"}
**نظام ERP:** ${establishment.hasERP === true ? "نعم" : establishment.hasERP === false ? "لا" : "غير محدد"}
**دليل التشغيل:** ${establishment.hasOpsManual === true ? "نعم" : establishment.hasOpsManual === false ? "لا" : "غير محدد"}
**دليل التدريب:** ${establishment.hasTrainingManual === true ? "نعم" : establishment.hasTrainingManual === false ? "لا" : "غير محدد"}
**ضبط الجودة:** ${establishment.qualityControl ?? "غير محدد"}
**إجراءات الشكاوى:** ${establishment.complaintProcess ?? "غير محدد"}
**التدقيق الداخلي:** ${establishment.hasInternalAudit === true ? "نعم" : establishment.hasInternalAudit === false ? "لا" : "غير محدد"}

## الموارد البشرية
**موظفون لكل فرع:** ${establishment.employeesPerBranch ?? "غير محدد"}
**الهيكل التنظيمي:** ${establishment.orgStructure ?? "غير محدد"}
**مدة التدريب:** ${establishment.trainingDuration ?? "غير محدد"}
**مدرب داخلي:** ${establishment.hasInternalTrainer === true ? "نعم" : establishment.hasInternalTrainer === false ? "لا" : "غير محدد"}
**سهولة استنساخ الكوادر:** ${establishment.easyToReplicate === true ? "نعم" : establishment.easyToReplicate === false ? "لا" : "غير محدد"}

## سلسلة الإمداد
**الموردون الرئيسيون:** ${establishment.mainSuppliers ?? "غير محدد"}
**عقود موردين:** ${establishment.hasSupplierContracts === true ? "نعم" : establishment.hasSupplierContracts === false ? "لا" : "غير محدد"}
**مواصفات مواد:** ${establishment.hasMaterialSpecs === true ? "نعم" : establishment.hasMaterialSpecs === false ? "لا" : "غير محدد"}
**مطبخ مركزي:** ${establishment.hasCentralKitchen === true ? "نعم" : establishment.hasCentralKitchen === false ? "لا" : "غير محدد"}
**مستودع مركزي:** ${establishment.hasCentralWarehouse === true ? "نعم" : establishment.hasCentralWarehouse === false ? "لا" : "غير محدد"}
**إلزام موردين:** ${establishment.canMandateSuppliers === true ? "نعم" : establishment.canMandateSuppliers === false ? "لا" : "غير محدد"}

## نية الامتياز التجاري
**سبب الامتياز:** ${establishment.franchiseWhy ?? "غير محدد"}
**عدد الفروع المستهدفة:** ${establishment.targetBranchCount ?? "غير محدد"}
**نطاق التوسع:** ${establishment.expansionScope ?? "غير محدد"}
**رسوم الامتياز المقترحة:** ${establishment.proposedFees ? `${establishment.proposedFees} ريال` : "غير محدد"}
**نسبة الإتاوة المقترحة:** ${establishment.proposedRoyalty ? `${establishment.proposedRoyalty}%` : "غير محدد"}
**دعم المنتفع:** ${establishment.franchiseeSupport ?? "غير محدد"}
`.trim();
}

// ─── Section Prompt Templates ─────────────────────────────────────────────────

const SECTION_PROMPTS: Record<AiSectionKey, string> = {
  executive_summary: `
اكتب ملخصاً تنفيذياً شاملاً لهذه المنشأة بهدف تقييم جاهزيتها للامتياز التجاري.
يجب أن يشمل الملخص:
1. لمحة عامة عن المنشأة وطبيعة نشاطها
2. أبرز نقاط القوة
3. أبرز التحديات والفجوات
4. الاستنتاج العام حول مستوى الجاهزية للامتياز
اكتب بأسلوب احترافي ومنهجي باللغة العربية. الطول المطلوب: 3-5 فقرات.
  `.trim(),

  brand_analysis: `
حلل هوية العلامة التجارية لهذه المنشأة من منظور الامتياز التجاري.
تناول:
1. قوة العلامة التجارية وتميزها في السوق
2. وضوح الهوية البصرية والرسالة والقيم
3. الحضور الرقمي وانعكاسه على قابلية التوسع
4. نقاط التميز التنافسية وقابليتها للاستنساخ
5. توصيات لتعزيز العلامة التجارية قبل الامتياز
الناتج المطلوب: تحليل مفصل بنقاط واضحة.
  `.trim(),

  market_analysis: `
قدم تحليلاً للسوق والوضع التنافسي لهذه المنشأة.
تناول:
1. تقييم قوة الطلب وحجم السوق المستهدف
2. تحليل المنافسين وموقع المنشأة منهم
3. تقييم المدن والمناطق المستهدفة للتوسع
4. عوامل الموسمية وتأثيرها على خطة الامتياز
5. الفرص والتهديدات الرئيسية في السوق
الناتج المطلوب: تحليل SWOT مختصر وتوصيات للتوسع.
  `.trim(),

  financial_analysis: `
حلل الوضع المالي لهذه المنشأة من منظور الامتياز التجاري.
تناول:
1. تقييم هامش الربح والمؤشرات المالية الأساسية
2. جدوى تكلفة فتح فرع جديد وفترة الاسترداد
3. هيكل التكاليف وقابليته للتكرار في فروع أخرى
4. مقترحات رسوم الامتياز والإتاوة: هل هي واقعية؟
5. الفجوات المالية التي تحتاج إلى معالجة قبل الامتياز
الناتج المطلوب: تحليل مالي مفصل مع مؤشرات رئيسية.
  `.trim(),

  operations_analysis: `
قيّم جاهزية العمليات والأنظمة لدى هذه المنشأة للتوسع عبر الامتياز.
تناول:
1. مدى توثيق العمليات (SOPs، أدلة التشغيل والتدريب)
2. الأنظمة التقنية المستخدمة وكفاءتها
3. آليات ضبط الجودة وقابليتها للتوحيد
4. إجراءات خدمة العملاء والشكاوى
5. الفجوات التشغيلية الواجب سدها قبل الامتياز
الناتج المطلوب: تقييم تفصيلي مع خطة عمل مقترحة.
  `.trim(),

  hr_analysis: `
حلل جاهزية الكوادر البشرية وهيكل الموارد البشرية للتوسع عبر الامتياز.
تناول:
1. كفاية عدد الموظفين وهيكلهم التنظيمي
2. منهجية التدريب وقابليتها للتكرار في فروع جديدة
3. مدى توفر كوادر يمكنها قيادة فروع مستقلة
4. سهولة نقل المهارات والمعرفة لمنتفعي الامتياز
5. توصيات لبناء برنامج تدريبي متكامل للامتياز
الناتج المطلوب: تقييم شامل مع توصيات عملية.
  `.trim(),

  supply_chain_analysis: `
قيّم سلسلة الإمداد لدى هذه المنشأة من منظور الامتياز التجاري.
تناول:
1. جودة وموثوقية الموردين الحاليين
2. مدى إمكانية إلزام منتفعي الامتياز باستخدام موردين محددين
3. توفر المواصفات والمعايير الموثقة للمواد
4. دور المطبخ المركزي والمستودع في دعم التوسع
5. مخاطر سلسلة الإمداد وكيفية التخفيف منها
الناتج المطلوب: تحليل مفصل مع استراتيجية مقترحة.
  `.trim(),

  franchise_readiness: `
قدم تقييماً شاملاً لجاهزية هذه المنشأة للدخول في نظام الامتياز التجاري.
تناول:
1. مدى استيفاء معايير الجاهزية الأساسية للامتياز
2. تقييم الرؤية والهدف من التوسع عبر الامتياز
3. واقعية خطة التوسع المقترحة (عدد الفروع، المدى الجغرافي)
4. نموذج الامتياز المقترح (الرسوم، الإتاوة، الدعم): تقييم ومقارنة
5. الخطوات التأسيسية المطلوبة قبل إطلاق نظام الامتياز
الناتج المطلوب: حكم تقييمي واضح مع خارطة طريق مقترحة.
  `.trim(),

  recommendations: `
بناءً على تحليل المنشأة الشامل، قدم قائمة بالتوصيات الاستراتيجية والعملية.
هيكل التوصيات:
1. **أولويات فورية (0-3 أشهر):** إجراءات عاجلة يجب اتخاذها
2. **أولويات قصيرة المدى (3-6 أشهر):** بناء الأسس اللازمة
3. **أولويات متوسطة المدى (6-12 شهراً):** الاستعداد الكامل للإطلاق
4. **مؤشرات النجاح:** KPIs لقياس تقدم الاستعداد
اكتب التوصيات بأسلوب نقطي وعملي قابل للتنفيذ.
  `.trim(),
};

// ─── Generate Report Section ──────────────────────────────────────────────────

export async function generateReportSection(
  input: AiAnalysisInput
): Promise<AiAnalysisOutput> {
  const { establishmentId, sectionKey, establishment, answers } = input;

  const client = getClient();
  const context = buildEstablishmentContext(establishment, answers);
  const sectionPrompt = SECTION_PROMPTS[sectionKey];

  const systemPrompt = `أنت خبير في الامتياز التجاري والاستشارات الإدارية في منطقة الخليج العربي.
مهمتك تحليل بيانات المنشآت التجارية وإعداد تقارير احترافية تُساعد أصحابها على تقييم جاهزيتهم للتوسع عبر الامتياز التجاري.
اكتب دائماً بالعربية الفصحى الواضحة، وبأسلوب مهني ومنهجي يناسب التقارير الاستشارية.
لا تستخدم مصطلحات إنجليزية إلا ضرورة قصوى مع ذكر المقابل العربي.`;

  const userMessage = `${context}

---

${sectionPrompt}`;

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const message = await stream.finalMessage();

  let content = "";
  for (const block of message.content) {
    if (block.type === "text") {
      content = block.text;
      break;
    }
  }
  const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

  // Persist to DB
  await db.aiAnalysisResult.upsert({
    where: { establishmentId_sectionKey: { establishmentId, sectionKey } },
    create: {
      establishmentId,
      sectionKey,
      prompt: userMessage,
      rawOutput: content,
      model: MODEL,
      tokensUsed,
    },
    update: {
      prompt: userMessage,
      rawOutput: content,
      model: MODEL,
      tokensUsed,
      generatedAt: new Date(),
    },
  });

  return { sectionKey, content, tokensUsed };
}

// ─── Calculate Readiness Score ────────────────────────────────────────────────

export async function calculateReadinessScore(
  establishment: Establishment,
  answers: QuestionnaireAnswer[]
): Promise<ReadinessScores> {
  const client = getClient();
  const context = buildEstablishmentContext(establishment, answers);

  const systemPrompt = `أنت خبير في الامتياز التجاري متخصص في تقييم جاهزية المنشآت للتوسع عبر الامتياز.
قيّم المنشأة وأعط درجات من 0 إلى 100 لكل محور.`;

  const userMessage = `${context}

---

بناءً على البيانات أعلاه، قيّم المنشأة وأعطِ درجة من 0 إلى 100 لكل محور من المحاور التالية:

1. **readinessScore**: درجة الجاهزية الإجمالية للامتياز
2. **brandStrength**: قوة العلامة التجارية والهوية
3. **replicability**: قابلية النموذج للاستنساخ في مواقع أخرى
4. **productClarity**: وضوح المنتج/الخدمة وتوثيقها
5. **unitEconomics**: جدوى الاقتصاديات لكل وحدة/فرع
6. **systemsSOPs**: جاهزية الأنظمة والإجراءات الموثقة
7. **supplyChain**: تطور وموثوقية سلسلة الإمداد
8. **legalReadiness**: الجاهزية القانونية (تسجيل العلامة، السجل التجاري، إلخ)

أجب بتنسيق JSON فقط بدون أي نص إضافي:
{
  "readinessScore": <رقم>,
  "brandStrength": <رقم>,
  "replicability": <رقم>,
  "productClarity": <رقم>,
  "unitEconomics": <رقم>,
  "systemsSOPs": <رقم>,
  "supplyChain": <رقم>,
  "legalReadiness": <رقم>
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  let rawText = "{}";
  for (const block of response.content) {
    if (block.type === "text") {
      rawText = block.text;
      break;
    }
  }

  // Extract JSON from response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from AI readiness score response");
  }

  const scores = JSON.parse(jsonMatch[0]) as ReadinessScores;

  // Clamp all values between 0-100
  const clamp = (v: unknown): number =>
    Math.min(100, Math.max(0, Math.round(Number(v) || 0)));

  return {
    readinessScore: clamp(scores.readinessScore),
    brandStrength: clamp(scores.brandStrength),
    replicability: clamp(scores.replicability),
    productClarity: clamp(scores.productClarity),
    unitEconomics: clamp(scores.unitEconomics),
    systemsSOPs: clamp(scores.systemsSOPs),
    supplyChain: clamp(scores.supplyChain),
    legalReadiness: clamp(scores.legalReadiness),
  };
}

// ─── Generate Full Report ─────────────────────────────────────────────────────

export const AI_SECTION_KEYS: AiSectionKey[] = [
  "executive_summary",
  "brand_analysis",
  "market_analysis",
  "financial_analysis",
  "operations_analysis",
  "hr_analysis",
  "supply_chain_analysis",
  "franchise_readiness",
  "recommendations",
];

export const AI_SECTION_LABELS: Record<AiSectionKey, string> = {
  executive_summary: "الملخص التنفيذي",
  brand_analysis: "تحليل العلامة التجارية",
  market_analysis: "تحليل السوق والمنافسة",
  financial_analysis: "التحليل المالي",
  operations_analysis: "تحليل العمليات والأنظمة",
  hr_analysis: "تحليل الموارد البشرية",
  supply_chain_analysis: "تحليل سلسلة الإمداد",
  franchise_readiness: "تقييم الجاهزية للامتياز",
  recommendations: "التوصيات الاستراتيجية",
};
