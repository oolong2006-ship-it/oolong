import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [availableCredits, establishments] = await Promise.all([
      db.projectCredit.count({
        where: { userId: session.id, used: false },
      }),
      db.establishment.findMany({
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
      }),
    ]);

    const projects = establishments.length;
    const completedReports = establishments.filter(
      (e: { status: string }) => e.status === "final_issued"
    ).length;

    const recentProjects = establishments.slice(0, 3);

    return NextResponse.json({
      credits: availableCredits,
      projects,
      completedReports,
      recentProjects,
      userName: session.name,
    });
  } catch (error) {
    console.error("[dashboard/route] Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل البيانات" },
      { status: 500 }
    );
  }
}
