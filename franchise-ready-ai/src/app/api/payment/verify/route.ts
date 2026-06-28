import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { paymentService, grantProjectCredit } from "@/lib/payment";

export async function POST(request: Request) {
  try {
    // Authenticate
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "غير مُصادَق عليه. يرجى تسجيل الدخول أولاً." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reference } = body as { reference?: string };

    if (!reference || typeof reference !== "string" || !reference.trim()) {
      return NextResponse.json(
        { success: false, error: "مرجع الدفع مطلوب." },
        { status: 400 }
      );
    }

    // Find payment by providerRef or id
    const payment = await db.payment.findFirst({
      where: {
        OR: [
          { providerRef: reference },
          { id: reference },
        ],
        userId: session.id,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "لم يتم العثور على سجل الدفع." },
        { status: 404 }
      );
    }

    // If already completed and credit granted, return existing credit
    if (payment.status === "completed" && payment.creditGranted) {
      const existingCredit = await db.projectCredit.findUnique({
        where: { paymentId: payment.id },
      });
      if (existingCredit) {
        return NextResponse.json({ success: true, creditId: existingCredit.id });
      }
    }

    // Verify with payment provider
    const verifyResult = await paymentService.verify(
      payment.providerRef ?? reference
    );

    // Update payment status in DB
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: verifyResult.status,
        providerPayload: verifyResult.providerPayload as object,
      },
    });

    if (verifyResult.status !== "completed") {
      const statusMessages: Record<string, string> = {
        pending: "لا يزال الدفع معلقاً. يرجى الانتظار.",
        failed: "فشلت عملية الدفع. يرجى المحاولة مجدداً.",
        refunded: "تم استرداد مبلغ الدفع.",
      };
      return NextResponse.json(
        {
          success: false,
          error: statusMessages[verifyResult.status] ?? "حالة الدفع غير معروفة.",
        },
        { status: 402 }
      );
    }

    // Grant project credit
    const { creditId } = await grantProjectCredit(payment.id);

    return NextResponse.json({ success: true, creditId });
  } catch (error) {
    console.error("[POST /api/payment/verify]", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء التحقق من الدفع. يرجى التواصل مع الدعم الفني." },
      { status: 500 }
    );
  }
}
