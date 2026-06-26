import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Truck } from 'lucide-react'
import { subDays } from 'date-fns'
import { analyzeDeliveryProfitability } from '@/lib/calculations/delivery'

export default async function DeliveryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId

  const thirtyDaysAgo = subDays(new Date(), 30)

  const settlements = await prisma.deliverySettlement.findMany({
    where: { organizationId: orgId, periodStart: { gte: thirtyDaysAgo } },
    include: {
      platform: { select: { name: true, nameAr: true } },
      branch: { select: { name: true, nameAr: true } },
    },
    orderBy: { periodStart: 'desc' },
  })

  // Group by platform and calculate profitability
  const platformMap = new Map<string, {
    platformName: string
    grossSales: number
    netSettlement: number
    orderCount: number
    platformCommission: number
    promotionCost: number
    bankFees: number
    marketingFees: number
    vatOnFees: number
    deliveryFees: number
  }>()

  for (const s of settlements) {
    const key = s.platformId
    const existing = platformMap.get(key) ?? {
      platformName: s.platform.nameAr ?? s.platform.name,
      grossSales: 0,
      netSettlement: 0,
      orderCount: 0,
      platformCommission: 0,
      promotionCost: 0,
      bankFees: 0,
      marketingFees: 0,
      vatOnFees: 0,
      deliveryFees: 0,
    }
    platformMap.set(key, {
      ...existing,
      grossSales: existing.grossSales + s.grossSales,
      netSettlement: existing.netSettlement + s.netSettlement,
      orderCount: existing.orderCount + s.orderCount,
      platformCommission: existing.platformCommission + s.platformCommission,
      promotionCost: existing.promotionCost + s.promotionCost,
      bankFees: existing.bankFees + s.bankFees,
      marketingFees: existing.marketingFees + s.marketingFees,
      vatOnFees: existing.vatOnFees + s.vatOnFees,
      deliveryFees: existing.deliveryFees + s.deliveryFees,
    })
  }

  const platforms = Array.from(platformMap.entries()).map(([id, data]) => {
    const analysis = analyzeDeliveryProfitability({
      grossSales: data.grossSales,
      discounts: 0,
      platformCommission: data.platformCommission,
      promotionCost: data.promotionCost,
      bankFees: data.bankFees,
      marketingFees: data.marketingFees,
      vatOnFees: data.vatOnFees,
      deliveryFees: data.deliveryFees,
      orderCount: data.orderCount,
      estimatedFoodCost: data.grossSales * 0.3, // 30% estimate if no recipe data
      packagingCost: data.grossSales * 0.02, // 2% estimate
    })
    return { id, ...data, ...analysis }
  }).sort((a, b) => b.grossSales - a.grossSales)

  const totalGross = platforms.reduce((s, p) => s + p.grossSales, 0)
  const totalNet = platforms.reduce((s, p) => s + p.netSettlement, 0)
  const totalOrders = platforms.reduce((s, p) => s + p.orderCount, 0)
  const avgMargin = platforms.length > 0
    ? platforms.reduce((s, p) => s + p.marginPct, 0) / platforms.length
    : 0

  return (
    <div>
      <PageHeader title="Delivery" titleAr="ربحية منصات التوصيل" subtitle="آخر 30 يوم" icon={Truck} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="إجمالي مبيعات التوصيل" value={formatCurrency(totalGross)} />
        <MetricCard title="صافي التسويات" value={formatCurrency(totalNet)} />
        <MetricCard title="إجمالي الطلبات" value={totalOrders.toLocaleString('ar-SA')} />
        <MetricCard
          title="متوسط هامش الربح"
          value={formatPercent(avgMargin)}
          variant={avgMargin < 10 ? 'danger' : avgMargin < 20 ? 'warning' : 'success'}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-4 text-sm">تحليل المنصات</h2>
        {platforms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-right pb-3 font-medium text-slate-500 text-xs">المنصة</th>
                  <th className="text-right pb-3 font-medium text-slate-500 text-xs">إجمالي المبيعات</th>
                  <th className="text-right pb-3 font-medium text-slate-500 text-xs">صافي التسوية</th>
                  <th className="text-right pb-3 font-medium text-slate-500 text-xs">العمولة الفعلية%</th>
                  <th className="text-right pb-3 font-medium text-slate-500 text-xs">هامش الربح%</th>
                  <th className="text-right pb-3 font-medium text-slate-500 text-xs">ربح/طلب</th>
                  <th className="text-right pb-3 font-medium text-slate-500 text-xs">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {platforms.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-800">{p.platformName}</td>
                    <td className="py-3 number-display">{formatCurrency(p.grossSales)}</td>
                    <td className="py-3 number-display">{formatCurrency(p.netSettlement)}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.effectiveCommissionRate > 30
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {formatPercent(p.effectiveCommissionRate)}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.marginPct < 0
                          ? 'bg-red-100 text-red-700'
                          : p.marginPct < 10
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {formatPercent(p.marginPct)}
                      </span>
                    </td>
                    <td className="py-3 number-display">{formatCurrency(p.profitPerOrder)}</td>
                    <td className="py-3">
                      {p.isLossMaking ? (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">خاسر</span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">رابح</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Truck size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد بيانات تسويات</p>
            <p className="text-xs mt-1">استورد تقارير التسوية من المنصات</p>
          </div>
        )}
      </div>
    </div>
  )
}
