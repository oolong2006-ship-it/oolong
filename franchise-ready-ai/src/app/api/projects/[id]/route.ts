import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const establishment = await db.establishment.findUnique({
      where: { id },
      include: {
        uploadedFiles: true,
        answers: true,
        aiResults: true,
        reports: {
          include: { sections: true },
          orderBy: { version: "desc" },
        },
        credit: true,
      },
    });

    if (!establishment) {
      return NextResponse.json({ error: "المشروع غير موجود" }, { status: 404 });
    }

    if (establishment.userId !== session.id && session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    return NextResponse.json(establishment);
  } catch (error) {
    console.error("[projects/[id]/route] GET Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل المشروع" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  try {
    const establishment = await db.establishment.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!establishment) {
      return NextResponse.json({ error: "المشروع غير موجود" }, { status: 404 });
    }

    if (establishment.userId !== session.id && session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    if (establishment.status === "locked") {
      return NextResponse.json(
        { error: "المشروع مقفل ولا يمكن تعديله" },
        { status: 403 }
      );
    }

    // Disallow updating sensitive / system fields
    const forbidden = new Set([
      "id",
      "userId",
      "creditId",
      "createdAt",
      "updatedAt",
      "lockedAt",
      "finalIssuedAt",
    ]);
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!forbidden.has(key)) {
        updateData[key] = value;
      }
    }

    const updated = await db.establishment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[projects/[id]/route] PATCH Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث المشروع" },
      { status: 500 }
    );
  }
}
