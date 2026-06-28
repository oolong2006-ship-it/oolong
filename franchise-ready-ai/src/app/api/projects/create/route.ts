import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { nameAr?: string; activityType?: string; city?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const { nameAr, activityType, city } = body;

  if (!nameAr?.trim()) {
    return NextResponse.json(
      { error: "اسم المنشأة مطلوب" },
      { status: 400 }
    );
  }

  try {
    // Find an unused credit for this user
    const credit = await db.projectCredit.findFirst({
      where: { userId: session.id, used: false },
    });

    if (!credit) {
      return NextResponse.json(
        { error: "لا يوجد رصيد كافٍ لإنشاء مشروع جديد" },
        { status: 402 }
      );
    }

    // Create establishment and mark credit as used in a transaction
    const establishment = await db.$transaction(async (tx: typeof db) => {
      const newEstablishment = await tx.establishment.create({
        data: {
          userId: session.id,
          creditId: credit.id,
          nameAr: nameAr.trim(),
          activityType: activityType?.trim() || null,
          city: city?.trim() || null,
          status: "draft",
        },
      });

      await tx.projectCredit.update({
        where: { id: credit.id },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });

      return newEstablishment;
    });

    return NextResponse.json({ projectId: establishment.id }, { status: 201 });
  } catch (error) {
    console.error("[projects/create/route] Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء المشروع" },
      { status: 500 }
    );
  }
}
