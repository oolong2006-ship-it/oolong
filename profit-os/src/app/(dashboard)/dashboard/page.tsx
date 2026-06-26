import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { AlertCard } from '@/components/dashboard/AlertCard'
import { RecommendationCard } from '@/components/dashboard/RecommendationCard'
import { PageHeader } from '@/components/common/PageHeader'
import { formatCurrency, formatPercent } from '@/lib/utils'
import {
  TrendingUp,
  ShoppingCart,
  Trash2,
  Building2,
  LayoutDashboard,
} from 'lucide-react'
import { subDays, startOfMonth, endOfMonth } from 'date-fns'
import type { AlertItem, Recommendation } from '@/types'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null

  const orgId = session.user.organizationId
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)

  // Fetch summary data
  const [salesAgg, purchasesAgg, wasteAgg, branchCount, alerts, recommendations] =
    await Promise.all([
      // Sales last 30 days
      prisma.salesRecord.aggregate({
        where: {
          organizationId: orgId,
          date: { gte: thirtyDaysAgo },
        },
        _sum: { grossSales: true, discounts: true, netSales: true, orderCount: true },
      }),
      // Purchases last 30 days
      prisma.purchaseInvoice.aggregate({
        where: {
          organizationId: orgId,
          invoiceDate: { gte: thirtyDaysAgo },
        },
        _sum: { totalAmount: true },
      }),
      // Waste last 30 days
      prisma.wasteRecord.aggregate({
        where: {
          organizationId: orgId,
          recordDate: { gte: thirtyDaysAgo },
        },
        _sum: { totalCost: true },
      }),
      // Branch count
      prisma.branch.count({
        where: { organizationId: orgId, isActive: true },
      }),
      // Recent alerts
      prisma.alert.findMany({
        where: { organizationId: orgId, isResolved: false },
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
        take: 5,
      }),
      // Top recommendations
      prisma.recommendation.findMany({
        where: { organizationId: orgId, status: 'NEW' },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take: 5,
      }),
    ])

  const netSales = salesAgg._sum.netSales ?? 0
  const grossSales = salesAgg._sum.grossSales ?? 0
  const totalOrders = salesAgg._sum.orderCount ?? 0
  const totalPurchases = purchasesAgg._sum.totalAmount ?? 0
  const totalWaste = wasteAgg._sum.totalCost ?? 0
  const foodCostPct = netSales > 0 ? (totalPurchases / netSales) * 100 : 0
  const wastePct = netSales > 0 ? (totalWaste / netSales) * 100 : 0
  const aov = totalOrders > 0 ? netSales / totalOrders : 0

  // Branch performance
  const branchSnapshots = await prisma.branchProfitabilitySnapshot.findMany({
    where: {
      organizationId: orgId,
      period: { gte: thirtyDaysAgo },
    },
    include: { branch: { select: { name: true, nameAr: true } } },
    orderBy: { profitMarginPct: 'desc' },
    take: 5,
  })

  return (
    <div>
      <PageHeader
        title="Dashboard"
        titleAr="لوحة التحكم الرئيسية"
        subtitle="آخر 30 يوم"
        icon={LayoutDashboard}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="صافي المبيعات"
          value={formatCurrency(netSales)}
          subtitle={`${totalOrders.toLocaleString('ar-SA')} طلب`}
          icon={TrendingUp}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="نسبة تكلفة الغذاء"
          value={formatPercent(foodCostPct)}
          subtitle={`إجمالي المشتريات: ${formatCurrency(totalPurchases)}`}
          icon={ShoppingCart}
          iconColor="text-purple-600"
          variant={foodCostPct > 35 ? 'danger' : foodCostPct > 30 ? 'warning' : 'success'}
        />
        <MetricCard
          title="متوسط قيمة الطلب"
          value={formatCurrency(aov)}
          subtitle={`إجمالي المبيعات: ${formatCurrency(grossSales)}`}
          icon={TrendingUp}
          iconColor="text-green-600"
        />
        <MetricCard
          title="نسبة الهدر"
          value={formatPercent(wastePct)}
          subtitle={`قيمة الهدر: ${formatCurrency(totalWaste)}`}
          icon={Trash2}
          iconColor="text-red-600"
          variant={wastePct > 3 ? 'danger' : wastePct > 2 ? 'warning' : 'success'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Performance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Building2 size={18} className="text-slate-500" />
              أداء الفروع
            </h2>
            <span className="text-xs text-slate-400">{branchCount} فرع نشط</span>
          </div>

          {branchSnapshots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-right pb-2 font-medium text-slate-500 text-xs">الفرع</th>
                    <th className="text-right pb-2 font-medium text-slate-500 text-xs">المبيعات</th>
                    <th className="text-right pb-2 font-medium text-slate-500 text-xs">تكلفة الغذاء%</th>
                    <th className="text-right pb-2 font-medium text-slate-500 text-xs">هامش الربح%</th>
                  </tr>
                </thead>
                <tbody>
                  {branchSnapshots.map((snap: typeof branchSnapshots[number], i: number) => (
                    <tr key={snap.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2.5 font-medium text-slate-700">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">#{i + 1}</span>
                          {snap.branch.nameAr ?? snap.branch.name}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600 number-display">
                        {formatCurrency(snap.netSales)}
                      </td>
                      <td className="py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          (snap.foodCost / snap.netSales * 100) > 35
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {snap.netSales > 0
                            ? formatPercent((snap.foodCost / snap.netSales) * 100)
                            : '—'}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          (snap.profitMarginPct ?? 0) > 15
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {formatPercent(snap.profitMarginPct ?? 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Building2 size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا توجد بيانات فروع حتى الآن</p>
              <p className="text-xs mt-1">ابدأ باستيراد بيانات المبيعات</p>
            </div>
          )}
        </div>

        {/* Alerts & Recommendations */}
        <div className="space-y-6">
          {/* Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3 text-sm">التنبيهات الحرجة</h2>
            {alerts.length > 0 ? (
              <div className="space-y-2">
                {(alerts as AlertItem[]).map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">لا توجد تنبيهات حرجة</p>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3 text-sm">التوصيات الذكية</h2>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {(recommendations as Recommendation[]).map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">لا توجد توصيات جديدة</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
