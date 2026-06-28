import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const establishments = await db.establishment.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        activityType: true,
        city: true,
        status: true,
        dataCompletion: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(establishments);
  } catch (error) {
    console.error("[projects/route] Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل المشاريع" },
      { status: 500 }
    );
  }
}
