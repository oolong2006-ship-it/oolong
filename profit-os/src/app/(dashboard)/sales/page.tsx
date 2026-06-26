import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'
import { subDays } from 'date-fns'
import { aggregateSalesRecords } from '@/lib/calculations/sales'

export default async function SalesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId

  const thirtyDaysAgo = subDays(new Date(), 30)
  const sixtyDaysAgo = subDays(new Date(), 60)

  const [currentPeriodRecords, previousPeriodRecords, channelSales, topItems] = await Promise.all([
    prisma.salesRecord.findMany({
      where: { organizationId: orgId, date: { gte: thirtyDaysAgo } },
    }),
    prisma.salesRecord.findMany({
      where: { organizationId: orgId, date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    prisma.salesRecord.groupBy({
      by: ['channelId'],
      where: { organizationId: orgId, date: { gte: thirtyDaysAgo } },
      _sum: { netSales: true, orderCount: true },
      orderBy: { _sum: { netSales: 'desc' } },
    }),
    prisma.salesRecordItem.groupBy({
      by: ['itemName'],
      where: {
        salesRecord: {
          organizationId: orgId,
          date: { gte: thirtyDaysAgo },
        },
      },
      _sum: { netAmount: true, quantity: true },
      orderBy: { _sum: { netAmount: 'desc' } },
      take: 10,
    }),
  ])

  const current = aggregateSalesRecords(currentPeriodRecords)
  const previous = aggregateSalesRecords(previousPeriodRecords)
  const growthPct = previous.totalNetSales > 0
    ? ((current.totalNetSales - previous.totalNetSales) / previous.totalNetSales) * 100
    : 0

  return (
    <div>
      <PageHeader title="Sales" titleAr="تحليل المبيعات" subtitle="آخر 30 يوم" icon={TrendingUp} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="إجمالي المبيعات"
          value={formatCurrency(current.totalGrossSales)}
          trend={{ value: growthPct, label: 'مقارنة بالفترة السابقة', isPositiveGood: true }}
          icon={TrendingUp}
        />
        <MetricCard
          title="صافي المبيعات"
          value={formatCurrency(current.totalNetSales)}
          subtitle={`الخصومات: ${formatCurrency(current.totalDiscounts)}`}
        />
        <MetricCard
          title="عدد الطلبات"
          value={formatNumber(current.totalOrders)}
          subtitle="إجمالي الطلبات"
        />
        <MetricCard
          title="متوسط قيمة الطلب"
          value={formatCurrency(current.averageOrderValue)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">المبيعات حسب القناة</h2>
          {channelSales.length > 0 ? (
            <div className="space-y-3">
              {channelSales.map((ch: typeof channelSales[number]) => {
                const chNetSales = ch._sum.netSales ?? 0
                const pct = current.totalNetSales > 0
                  ? (chNetSales / current.totalNetSales) * 100
                  : 0
                return (
                  <div key={ch.channelId ?? 'direct'} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{ch.channelId ?? 'مباشر'}</span>
                        <span className="font-medium number-display">{formatCurrency(chNetSales)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{pct.toFixed(1)}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">لا توجد بيانات مبيعات</p>
          )}
        </div>

        {/* Top selling items */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">أعلى المنتجات مبيعاً</h2>
          {topItems.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-right pb-2 font-medium text-slate-500 text-xs">المنتج</th>
                  <th className="text-right pb-2 font-medium text-slate-500 text-xs">الكمية</th>
                  <th className="text-right pb-2 font-medium text-slate-500 text-xs">الإيراد</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item: typeof topItems[number], i: number) => (
                  <tr key={item.itemName} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2.5">
                      <span className="text-slate-400 text-xs ml-1">#{i + 1}</span>
                      {item.itemName}
                    </td>
                    <td className="py-2.5 text-slate-600 number-display">
                      {formatNumber(item._sum.quantity ?? 0)}
                    </td>
                    <td className="py-2.5 font-medium number-display">
                      {formatCurrency(item._sum.netAmount ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">لا توجد بيانات تفصيلية</p>
          )}
        </div>
      </div>
    </div>
  )
}
