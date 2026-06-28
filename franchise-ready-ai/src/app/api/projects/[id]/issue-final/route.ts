import { NextResponse } from "next/server";
import { getSession, getSessionTokenFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

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

    // Verify establishment ownership and status
    const establishment = await db.establishment.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true, nameAr: true, nameEn: true },
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

    const allowedStatuses = ["ai_generated", "preview_ready"];
    if (!allowedStatuses.includes(establishment.status)) {
      return NextResponse.json(
        {
          success: false,
          error:
            establishment.status === "locked"
              ? "هذا المشروع مقفل بالفعل ولا يمكن إعادة إصداره."
              : "لا يمكن إصدار التقرير النهائي في الحالة الحالية للمشروع.",
        },
        { status: 400 }
      );
    }

    // Get latest report
    const report = await db.generatedReport.findFirst({
      where: { establishmentId: id },
      orderBy: { generatedAt: "desc" },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "لم يتم إنشاء تقرير لهذا المشروع بعد." },
        { status: 404 }
      );
    }

    const now = new Date();

    // Mark report as final and lock the establishment
    await db.$transaction([
      db.generatedReport.update({
        where: { id: report.id },
        data: { isFinal: true },
      }),
      db.establishment.update({
        where: { id },
        data: {
          status: "locked",
          finalIssuedAt: now,
          lockedAt: now,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/projects/[id]/issue-final]", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء إصدار التقرير. يرجى المحاولة مجدداً." },
      { status: 500 }
    );
  }
}
