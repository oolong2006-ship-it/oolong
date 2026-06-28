import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { paymentService } from "@/lib/payment";

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
    const { amount, currency, description } = body as {
      amount?: number;
      currency?: string;
      description?: string;
    };

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "المبلغ غير صالح." },
        { status: 400 }
      );
    }

    // Initiate payment via service (creates DB record internally)
    const result = await paymentService.initiate({
      userId: session.id,
      amount,
      currency: currency ?? "SAR",
      description: description ?? "تقرير جاهزية الفرنشايز",
    });

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      redirectUrl: result.checkoutUrl,
      providerRef: result.providerRef,
    });
  } catch (error) {
    console.error("[POST /api/payment/create]", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء إنشاء طلب الدفع. يرجى المحاولة مجدداً." },
      { status: 500 }
    );
  }
}
