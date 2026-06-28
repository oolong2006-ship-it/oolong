import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

async function requireAdmin() {
  const session = await getSession()
  if (!session) return { error: "غير مصرح", status: 401 }
  if (session.role !== "ADMIN") return { error: "ممنوع — صلاحيات مدير مطلوبة", status: 403 }
  return { session }
}

// GET /api/admin/users — list all users with stats
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20", 10))
    const search = searchParams.get("search")?.trim() ?? ""

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          projectCredits: { select: { id: true, used: true } },
          establishments: { select: { id: true } },
        },
      }),
      db.user.count({ where }),
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      role: u.role,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      credits: u.projectCredits.filter((c: any) => !c.used).length,
      projectsCount: u.establishments.length,
      createdAt: u.createdAt.toISOString(),
      deletedAt: u.deletedAt?.toISOString() ?? null,
    }))

    return NextResponse.json({
      users: mapped,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("[admin/users GET] error:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}

// PATCH /api/admin/users?userId=xxx — grant credit or update role
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "userId مطلوب" }, { status: 400 })
    }

    const body = await request.json() as { role?: string; grantCredit?: boolean }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.deletedAt) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    // Update role if provided
    if (body.role) {
      if (!["USER", "ADMIN"].includes(body.role)) {
        return NextResponse.json({ error: "دور غير صالح" }, { status: 400 })
      }
      await db.user.update({
        where: { id: userId },
        data: { role: body.role as "USER" | "ADMIN" },
      })
    }

    // Grant credit if requested
    if (body.grantCredit) {
      await db.projectCredit.create({
        data: { userId, used: false },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[admin/users PATCH] error:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}

// DELETE /api/admin/users?userId=xxx — soft delete
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "userId مطلوب" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }
    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "لا يمكن حذف حساب مدير" }, { status: 400 })
    }
    if (user.deletedAt) {
      return NextResponse.json({ error: "المستخدم محذوف مسبقاً" }, { status: 400 })
    }

    await db.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[admin/users DELETE] error:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}
