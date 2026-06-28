import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

// POST /api/admin/credits/grant
// Body: { userId: string }
// Manually grants a ProjectCredit to a user without requiring a payment
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "ممنوع — صلاحيات مدير مطلوبة" }, { status: 403 })
    }

    const body = await request.json() as { userId?: string }
    const { userId } = body

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId مطلوب" }, { status: 400 })
    }

    // Verify user exists and is not deleted
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }
    if (user.deletedAt) {
      return NextResponse.json({ error: "لا يمكن منح رصيد لمستخدم محذوف" }, { status: 400 })
    }

    // Create credit without linking to a payment
    const credit = await db.projectCredit.create({
      data: {
        userId,
        used: false,
        // paymentId is intentionally null — this is a manual/admin grant
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.id,
        action: "ADMIN_GRANT_CREDIT",
        entity: "ProjectCredit",
        entityId: credit.id,
        meta: { targetUserId: userId, targetUserEmail: user.email },
      },
    }).catch(() => {
      // Audit log failure should not block the response
    })

    return NextResponse.json({
      success: true,
      creditId: credit.id,
      message: `تم منح رصيد مشروع للمستخدم ${user.name} بنجاح`,
    })
  } catch (error) {
    console.error("[admin/credits/grant POST] error:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}
