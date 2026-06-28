import { NextResponse } from "next/server";
import { getSession, getSessionTokenFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateReadinessScore, generateReportSection } from "@/lib/ai";
import type { AiSectionKey } from "@/types";

export const dynamic = "force-dynamic";

const REPORT_SECTION_KEYS = [
  "cover",
  "disclaimer",
  "toc",
  "executive_summary",
  "establishment_profile",
  "brand_overview",
  "readiness_score",
  "business_assessment",
  "product_analysis",
  "market_analysis",
  "operational_readiness",
  "financial_model",
  "franchise_model",
  "franchise_fees",
  "franchisee_requirements",
  "franchisor_support",
  "training_support",
  "supply_chain_model",
  "quality_control",
  "required_manuals",
  "saudi_compliance",
  "disclosure_draft",
  "risks_mitigation",
  "roadmap_90days",
  "roadmap_12months",
  "missing_info",
  "final_recommendation",
  "next_steps",
] as const;

const SECTION_TITLE_MAP: Record<string, string> = {
  cover: "غلاف التقرير",
  disclaimer: "إخلاء المسؤولية",
  toc: "فهرس المحتويات",
  executive_summary: "الملخص التنفيذي",
  establishment_profile: "ملف المنشأة",
  brand_overview: "نظرة عامة على العلامة التجارية",
  readiness_score: "درجة الجاهزية",
  business_assessment: "تقييم النشاط التجاري",
  product_analysis: "تحليل المنتجات والخدمات",
  market_analysis: "تحليل السوق والمنافسة",
  operational_readiness: "جاهزية العمليات",
  financial_model: "النموذج المالي",
  franchise_model: "نموذج الامتياز التجاري",
  franchise_fees: "رسوم الامتياز والإتاوة",
  franchisee_requirements: "متطلبات المنتفع",
  franchisor_support: "دعم المانح",
  training_support: "برنامج التدريب والدعم",
  supply_chain_model: "نموذج سلسلة التوريد",
  quality_control: "ضبط الجودة والمعايير",
  required_manuals: "الأدلة والوثائق المطلوبة",
  saudi_compliance: "الامتثال للأنظمة السعودية",
  disclosure_draft: "مسودة وثيقة الإفصاح",
  risks_mitigation: "المخاطر والتخفيف",
  roadmap_90days: "خارطة الطريق (90 يوماً)",
  roadmap_12months: "خارطة الطريق (12 شهراً)",
  missing_info: "المعلومات الناقصة",
  final_recommendation: "التوصية النهائية",
  next_steps: "الخطوات التالية",
};

// Map report section keys to AI section keys where applicable
const AI_SECTION_MAP: Partial<Record<string, AiSectionKey>> = {
  executive_summary: "executive_summary",
  brand_overview: "brand_analysis",
  market_analysis: "market_analysis",
  financial_model: "financial_analysis",
  operational_readiness: "operations_analysis",
  training_support: "hr_analysis",
  supply_chain_model: "supply_chain_analysis",
  final_recommendation: "franchise_readiness",
  next_steps: "recommendations",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "غير مصرح. يرجى تسجيل الدخول." },
        { status: 401 }
      );
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "غير مصرح. يرجى تسجيل الدخول." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get establishment and verify ownership
    const establishment = await db.establishment.findUnique({
      where: { id },
      include: { answers: true },
    });

    if (!establishment) {
      return NextResponse.json(
        { success: false, error: "المشروع غير موجود." },
        { status: 404 }
      );
    }

    if (establishment.userId !== session.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح بالوصول إلى هذا المشروع." },
        { status: 403 }
      );
    }

    if (establishment.status === "locked") {
      return NextResponse.json(
        { success: false, error: "هذا المشروع مقفل ولا يمكن تحليله مجدداً." },
        { status: 400 }
      );
    }

    // Calculate readiness scores via AI
    const scores = await calculateReadinessScore(establishment, establishment.answers);

    // Create GeneratedReport record
    const report = await db.generatedReport.create({
      data: {
        establishmentId: id,
        readinessScore: scores.readinessScore,
        brandStrength: scores.brandStrength,
        replicability: scores.replicability,
        productClarity: scores.productClarity,
        unitEconomics: scores.unitEconomics,
        systemsSOPs: scores.systemsSOPs,
        supplyChain: scores.supplyChain,
        legalReadiness: scores.legalReadiness,
      },
    });

    // Generate all 28 report sections
    const sectionPromises = REPORT_SECTION_KEYS.map(async (sectionKey, index) => {
      let content = "";

      const aiKey = AI_SECTION_MAP[sectionKey];
      if (aiKey) {
        try {
          const result = await generateReportSection({
            establishmentId: id,
            sectionKey: aiKey,
            establishment,
            answers: establishment.answers,
          });
          content = result.content;
        } catch (err) {
          console.error(`[analyze] Failed to generate section ${sectionKey}:`, err);
          content = `لم يتمكن النظام من توليد هذا القسم تلقائياً. يرجى إعادة المحاولة.`;
        }
      } else {
        // For structural/metadata sections, generate placeholder content
        content = generatePlaceholderContent(sectionKey, establishment, scores);
      }

      return db.reportSection.create({
        data: {
          reportId: report.id,
          sectionKey,
          titleAr: SECTION_TITLE_MAP[sectionKey] ?? sectionKey,
          content,
          orderIndex: index,
        },
      });
    });

    await Promise.all(sectionPromises);

    // Update establishment status
    await db.establishment.update({
      where: { id },
      data: { status: "ai_generated" },
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      score: scores.readinessScore,
    });
  } catch (error) {
    console.error("[POST /api/projects/[id]/analyze]", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء تحليل البيانات. يرجى المحاولة مجدداً." },
      { status: 500 }
    );
  }
}

function generatePlaceholderContent(
  sectionKey: string,
  establishment: { nameAr: string | null; nameEn: string | null; activityType: string | null; city: string | null },
  scores: { readinessScore: number; brandStrength: number; replicability: number; productClarity: number; unitEconomics: number; systemsSOPs: number; supplyChain: number; legalReadiness: number }
): string {
  const name = establishment.nameAr ?? establishment.nameEn ?? "المنشأة";
  const date = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  switch (sectionKey) {
    case "cover":
      return `تقرير جاهزية الامتياز التجاري\n\nالمنشأة: ${name}\nنوع النشاط: ${establishment.activityType ?? "—"}\nالمدينة: ${establishment.city ?? "—"}\nتاريخ التقرير: ${date}\n\nإعداد: فرنشايز ريدي | منصة الذكاء الاصطناعي للامتياز التجاري`;

    case "disclaimer":
      return `إخلاء المسؤولية\n\nهذا التقرير ذو طابع استشاري بحت ولا يُعدّ وثيقة قانونية معتمدة أو بديلاً عن الاستشارة القانونية المتخصصة. جميع البيانات الواردة في هذا التقرير مستندة إلى المعلومات التي أدخلها صاحب المنشأة، وتعكس تقييماً أولياً بناءً على الذكاء الاصطناعي.\n\nلا تتحمل منصة فرنشايز ريدي مسؤولية أي قرارات تجارية أو استثمارية تُتخذ استناداً إلى هذا التقرير. يُنصح بمراجعة مستشار قانوني وتجاري متخصص في الامتياز قبل اتخاذ أي إجراء.`;

    case "toc":
      return `فهرس المحتويات\n\n1. الملخص التنفيذي\n2. ملف المنشأة\n3. نظرة عامة على العلامة التجارية\n4. درجة الجاهزية\n5. تقييم النشاط التجاري\n6. تحليل المنتجات والخدمات\n7. تحليل السوق والمنافسة\n8. جاهزية العمليات\n9. النموذج المالي\n10. نموذج الامتياز التجاري\n11. رسوم الامتياز والإتاوة\n12. متطلبات المنتفع\n13. دعم المانح\n14. برنامج التدريب والدعم\n15. نموذج سلسلة التوريد\n16. ضبط الجودة والمعايير\n17. الأدلة والوثائق المطلوبة\n18. الامتثال للأنظمة السعودية\n19. مسودة وثيقة الإفصاح\n20. المخاطر والتخفيف\n21. خارطة الطريق (90 يوماً)\n22. خارطة الطريق (12 شهراً)\n23. المعلومات الناقصة\n24. التوصية النهائية\n25. الخطوات التالية`;

    case "readiness_score":
      return `درجة الجاهزية الإجمالية: ${scores.readinessScore}/100\n\nتفصيل الدرجات:\n• قوة العلامة التجارية: ${scores.brandStrength}/100\n• قابلية التكرار: ${scores.replicability}/100\n• وضوح المنتج: ${scores.productClarity}/100\n• الاقتصاديات التشغيلية: ${scores.unitEconomics}/100\n• الأنظمة والإجراءات: ${scores.systemsSOPs}/100\n• سلسلة التوريد: ${scores.supplyChain}/100\n• الجاهزية القانونية: ${scores.legalReadiness}/100`;

    case "establishment_profile":
      return `ملف المنشأة\n\nالاسم: ${name}\nنوع النشاط: ${establishment.activityType ?? "—"}\nالمدينة: ${establishment.city ?? "—"}\n\nتم تجميع هذا الملف بناءً على البيانات المدخلة من قِبل صاحب المنشأة.`;

    case "franchise_fees":
      return `رسوم الامتياز والإتاوة\n\nسيتم تفصيل هيكل الرسوم المقترح وفق الهيكل التجاري للمنشأة. تشمل هذه القسم: رسوم الامتياز الابتدائية، نسبة الإتاوة الشهرية، رسوم التجديد، ومساهمات التسويق المشترك.`;

    case "franchisee_requirements":
      return `متطلبات المنتفع\n\nيتضمن هذا القسم الشروط الأساسية المطلوبة في المنتفع المحتمل، بما فيها: المتطلبات المالية، الخبرة التشغيلية، الالتزام الزمني، والموقع الجغرافي المقترح.`;

    case "franchisor_support":
      return `دعم المانح\n\nيستعرض هذا القسم حزمة الدعم التي ستقدمها المنشأة الأم لمنتفعي الامتياز، وتشمل: الدعم قبل الافتتاح، والدعم التشغيلي المستمر، والدعم التسويقي.`;

    case "quality_control":
      return `ضبط الجودة والمعايير\n\nيوضح هذا القسم آليات ضبط الجودة المعتمدة ومعايير الأداء التي يُلزم بها منتفعو الامتياز لضمان تجربة موحدة للعملاء في جميع الفروع.`;

    case "required_manuals":
      return `الأدلة والوثائق المطلوبة\n\nقائمة الأدلة الواجب إعدادها قبل إطلاق نظام الامتياز:\n• دليل العمليات التشغيلية\n• دليل التدريب\n• دليل العلامة التجارية\n• دليل خدمة العملاء\n• دليل الجودة\n• عقد الامتياز`;

    case "saudi_compliance":
      return `الامتثال للأنظمة السعودية\n\nيتناول هذا القسم متطلبات الامتثال للأنظمة والتشريعات السعودية ذات الصلة بالامتياز التجاري، بما في ذلك متطلبات هيئة الامتياز التجاري، نظام السجل التجاري، وأنظمة العمل والموارد البشرية.`;

    case "disclosure_draft":
      return `مسودة وثيقة الإفصاح\n\nهذه مسودة أولية لوثيقة الإفصاح المطلوبة قانوناً في عقود الامتياز التجاري. تحتوي على المعلومات الجوهرية التي يجب الإفصاح عنها للمنتفع المحتمل قبل توقيع العقد. يُنصح بمراجعة محامٍ متخصص قبل الاستخدام.`;

    case "business_assessment":
      return `تقييم النشاط التجاري\n\nسيتم تفصيل تقييم شامل للنشاط التجاري للمنشأة بناءً على البيانات المدخلة.`;

    case "product_analysis":
      return `تحليل المنتجات والخدمات\n\nسيتم تفصيل تحليل منتجات وخدمات المنشأة من منظور قابليتها للتكرار والتوحيد في إطار الامتياز التجاري.`;

    case "franchise_model":
      return `نموذج الامتياز التجاري\n\nسيتم تفصيل النموذج المقترح للامتياز التجاري وفق خصائص المنشأة وطبيعة نشاطها.`;

    case "missing_info":
      return `المعلومات الناقصة\n\nبناءً على تحليل البيانات المدخلة، تم رصد بعض المعلومات التي لم يتم توفيرها بالكامل، والتي قد تؤثر على دقة التقييم. يُنصح بمراجعة هذه البيانات وإكمالها.`;

    default:
      return `محتوى هذا القسم سيتم توليده بناءً على البيانات الخاصة بمنشأتك.`;
  }
}
