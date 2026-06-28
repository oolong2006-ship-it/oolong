import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    // Verify admin session
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "ممنوع — صلاحيات مدير مطلوبة" }, { status: 403 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Run queries in parallel
    const [
      totalUsers,
      todayPaymentsAgg,
      totalRevenueAgg,
      reportsIssued,
      recentPaymentsRaw,
      recentProjectsRaw,
      totalCompletedPayments,
      totalFinalIssuedProjects,
    ] = await Promise.all([
      // Total non-deleted users
      db.user.count({ where: { deletedAt: null } }),

      // Today's completed payments
      db.payment.aggregate({
        where: {
          status: "completed",
          createdAt: { gte: today, lt: tomorrow },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),

      // All-time completed revenue
      db.payment.aggregate({
        where: { status: "completed" },
        _sum: { totalAmount: true },
      }),

      // Final issued reports count (final_issued establishments)
      db.establishment.count({ where: { status: "final_issued" } }),

      // Recent 10 payments
      db.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),

      // Recent 10 projects with their latest report
      db.establishment.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
          reports: {
            orderBy: { generatedAt: "desc" },
            take: 1,
            select: { readinessScore: true, publicUrl: true, isFinal: true },
          },
        },
      }),

      // Total completed payments (for conversion rate calc)
      db.payment.count({ where: { status: "completed" } }),

      // Total final_issued projects
      db.establishment.count({ where: { status: "final_issued" } }),
    ])

    // Conversion rate: (final_issued projects / completed payments) * 100
    const conversionRate =
      totalCompletedPayments > 0
        ? (totalFinalIssuedProjects / totalCompletedPayments) * 100
        : 0

    // Check DB health by running a trivial query
    let dbStatus: "ok" | "error" = "ok"
    try {
      await db.$queryRaw`SELECT 1`
    } catch {
      dbStatus = "error"
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentPayments = recentPaymentsRaw.map((p: any) => ({
      id: p.id,
      userName: p.user.name,
      userEmail: p.user.email,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      provider: p.provider,
      createdAt: p.createdAt.toISOString(),
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentProjects = recentProjectsRaw.map((e: any) => ({
      id: e.id,
      nameAr: e.nameAr,
      nameEn: e.nameEn,
      userName: e.user.name,
      status: e.status,
      readinessScore: e.reports[0]?.readinessScore ?? null,
      createdAt: e.createdAt.toISOString(),
    }))

    return NextResponse.json({
      totalUsers,
      paymentsToday: todayPaymentsAgg._sum.totalAmount ?? 0,
      paymentsCountToday: todayPaymentsAgg._count.id,
      totalRevenue: totalRevenueAgg._sum.totalAmount ?? 0,
      reportsIssued,
      conversionRate,
      recentPayments,
      recentProjects,
      systemHealth: {
        db: dbStatus,
        uptime: process.uptime(),
      },
    })
  } catch (error) {
    console.error("[admin/stats] error:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}
