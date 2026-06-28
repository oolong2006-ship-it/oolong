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
      select: {
        id: true,
        userId: true,
        nameAr: true,
        nameEn: true,
        status: true,
        finalIssuedAt: true,
      },
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

    // Get the latest report with sections ordered by orderIndex
    const report = await db.generatedReport.findFirst({
      where: { establishmentId: id },
      orderBy: { generatedAt: "desc" },
      include: {
        sections: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "لم يتم إنشاء تقرير لهذا المشروع بعد." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        isFinal: report.isFinal,
        readinessScore: report.readinessScore,
        generatedAt: report.generatedAt,
        establishmentName: establishment.nameAr ?? establishment.nameEn ?? "المنشأة",
        establishmentStatus: establishment.status,
        finalIssuedAt: establishment.finalIssuedAt,
      },
      sections: report.sections.map((s: { id: string; sectionKey: string; titleAr: string | null; content: string | null; orderIndex: number }) => ({
        id: s.id,
        sectionKey: s.sectionKey,
        titleAr: s.titleAr,
        content: s.content,
        orderIndex: s.orderIndex,
      })),
    });
  } catch (error) {
    console.error("[GET /api/projects/[id]/report]", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم." },
      { status: 500 }
    );
  }
}
