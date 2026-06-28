import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const creditRecords = await db.projectCredit.findMany({
      where: { userId: session.id },
      include: {
        payment: {
          select: {
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const availableCredits = creditRecords.filter((c: { used: boolean }) => !c.used).length;

    return NextResponse.json({
      credits: availableCredits,
      history: creditRecords,
    });
  } catch (error) {
    console.error("[user/credits/route] Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل بيانات الرصيد" },
      { status: 500 }
    );
  }
}
