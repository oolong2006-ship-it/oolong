import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, mobile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[user/profile] GET Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل البيانات" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    name?: string;
    mobile?: string | null;
    currentPassword?: string;
    newPassword?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  try {
    // Password change request
    if (body.currentPassword !== undefined || body.newPassword !== undefined) {
      if (!body.currentPassword || !body.newPassword) {
        return NextResponse.json(
          { error: "يرجى تقديم كلمة المرور الحالية والجديدة" },
          { status: 400 }
        );
      }

      if (body.newPassword.length < 8) {
        return NextResponse.json(
          { error: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل" },
          { status: 400 }
        );
      }

      const user = await db.user.findUnique({
        where: { id: session.id },
        select: { password: true },
      });

      if (!user) {
        return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
      }

      const valid = await verifyPassword(body.currentPassword, user.password);
      if (!valid) {
        return NextResponse.json(
          { error: "كلمة المرور الحالية غير صحيحة" },
          { status: 400 }
        );
      }

      const hashed = await hashPassword(body.newPassword);
      await db.user.update({
        where: { id: session.id },
        data: { password: hashed },
      });

      return NextResponse.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
    }

    // Profile info update
    const updateData: { name?: string; mobile?: string | null } = {};
    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json({ error: "الاسم لا يمكن أن يكون فارغًا" }, { status: 400 });
      }
      updateData.name = body.name.trim();
    }
    if (body.mobile !== undefined) {
      updateData.mobile = body.mobile?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "لا توجد بيانات للتحديث" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: session.id },
      data: updateData,
      select: { id: true, name: true, email: true, mobile: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("[user/profile] PATCH Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ البيانات" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Soft delete
    await db.user.update({
      where: { id: session.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "تم حذف الحساب بنجاح" });
  } catch (error) {
    console.error("[user/profile] DELETE Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الحساب" },
      { status: 500 }
    );
  }
}
