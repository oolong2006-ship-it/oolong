import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

type PaymentStatus = "pending" | "completed" | "failed" | "refunded"
const VALID_STATUSES: PaymentStatus[] = ["pending", "completed", "failed", "refunded"]

async function requireAdmin() {
  const session = await getSession()
  if (!session) return { error: "غير مصرح", status: 401 }
  if (session.role !== "ADMIN") return { error: "ممنوع — صلاحيات مدير مطلوبة", status: 403 }
  return { session }
}

// GET /api/admin/payments — list all payments, filterable by status
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20", 10))
    const statusParam = searchParams.get("status")

    const where = {
      ...(statusParam && VALID_STATUSES.includes(statusParam as PaymentStatus)
        ? { status: statusParam as PaymentStatus }
        : {}),
    }

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      db.payment.count({ where }),
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = payments.map((p: any) => ({
      id: p.id,
      userId: p.userId,
      userName: p.user.name,
      userEmail: p.user.email,
      amount: p.amount,
      currency: p.currency,
      totalAmount: p.totalAmount,
      status: p.status,
      provider: p.provider,
      providerRef: p.providerRef,
      description: p.description,
      creditGranted: p.creditGranted,
      createdAt: p.createdAt.toISOString(),
    }))

    return NextResponse.json({
      payments: mapped,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("[admin/payments GET] error:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}
