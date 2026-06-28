import { NextResponse } from "next/server";
import { getSession, getSessionTokenFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
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

    // Verify establishment ownership
    const establishment = await db.establishment.findUnique({
      where: { id },
      select: { id: true, userId: true, nameAr: true, nameEn: true, status: true },
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

    // Get latest generated report
    const report = await db.generatedReport.findFirst({
      where: { establishmentId: id },
      orderBy: { generatedAt: "desc" },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "لم يتم تحليل هذا المشروع بعد." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reportId: report.id,
      establishmentName: establishment.nameAr ?? establishment.nameEn ?? "المنشأة",
      readinessScore: report.readinessScore ?? 0,
      brandStrength: report.brandStrength ?? 0,
      replicability: report.replicability ?? 0,
      productClarity: report.productClarity ?? 0,
      unitEconomics: report.unitEconomics ?? 0,
      systemsSOPs: report.systemsSOPs ?? 0,
      supplyChain: report.supplyChain ?? 0,
      legalReadiness: report.legalReadiness ?? 0,
      generatedAt: report.generatedAt,
      isFinal: report.isFinal,
    });
  } catch (error) {
    console.error("[GET /api/projects/[id]/score]", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم." },
      { status: 500 }
    );
  }
}
