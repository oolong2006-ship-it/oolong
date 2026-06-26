import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Building2 } from 'lucide-react'
import { subDays } from 'date-fns'
import { analyzeBranchProfitability, rankBranches } from '@/lib/calculations/branchProfitability'

export default async function BranchesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId
  const thirtyDaysAgo = subDays(new Date(), 30)

  const [branches, snapshots] = await Promise.all([
    prisma.branch.findMany({ where: { organizationId: orgId, isActive: true } }),
    prisma.branchProfitabilitySnapshot.findMany({
      where: { organizationId: orgId, period: { gte: thirtyDaysAgo } },
      include: { branch: { select: { name: true, nameAr: true, code: true } } },
    }),
  ])

  // Aggregate snapshots by branch
  const branchAgg = new Map<string, {
    name: string
    netSales: number
    foodCost: number
    wasteValue: number
    deliveryFees: number
    packagingCost: number
    contributionProfit: number
    orderCount: number
  }>()

  for (const snap of snapshots) {
    const key = snap.branchId
    const existing = branchAgg.get(key)
    if (existing) {
      existing.netSales += snap.netSales
      existing.foodCost += snap.foodCost
      existing.wasteValue += snap.wasteValue
      existing.deliveryFees += snap.deliveryFees
      existing.packagingCost += snap.packagingCost
      existing.contributionProfit += snap.contributionProfit
      existing.orderCount += snap.orderCount
    } else {
      branchAgg.set(key, {
        name: snap.branch.nameAr ?? snap.branch.name,
        netSales: snap.netSales,
        foodCost: snap.foodCost,
        wasteValue: snap.wasteValue,
        deliveryFees: snap.deliveryFees,
        packagingCost: snap.packagingCost,
        contributionProfit: snap.contributionProfit,
        orderCount: snap.orderCount,
      })
    }
  }

  const branchList = Array.from(branchAgg.entries()).map(([id, data]) => {
    const analysis = analyzeBranchProfitability({
      netSales: data.netSales,
      foodCost: data.foodCost,
      packagingCost: data.packagingCost,
      platformFees: data.deliveryFees,
      wasteValue: data.wasteValue,
    })
    return { id, name: data.name, ...analysis, orderCount: data.orderCount }
  })

  const ranked = rankBranches(branchList.map(b => ({
    id: b.id,
    name: b.name,
    margin: b.contributionMarginPct,
    netSales: b.netSales,
  })))

  const totalNetSales = branchList.reduce((s, b) => s + b.netSales, 0)
  const avgFoodCostPct = branchList.length > 0
    ? branchList.reduce((s, b) => s + b.foodCostPct, 0) / branchList.length
    : 0

  return (
    <div>
      <PageHeader title="Branches" titleAr="ربحية الفروع" icon={Building2} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="إجمالي الفروع النشطة" value={branches.length.toString()} />
        <MetricCard title="إجمالي صافي المبيعات" value={formatCurrency(totalNetSales)} />
        <MetricCard
          title="متوسط تكلفة الغذاء%"
          value={formatPercent(avgFoodCostPct)}
          variant={avgFoodCostPct > 35 ? 'danger' : 'default'}
        />
        <MetricCard title="فروع تحت التحليل" value={branchList.length.toString()} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-right p-4 font-medium text-slate-600">الترتيب</th>
              <th className="text-right p-4 font-medium text-slate-600">الفرع</th>
              <th className="text-right p-4 font-medium text-slate-600">صافي المبيعات</th>
              <th className="text-right p-4 font-medium text-slate-600">تكلفة الغذاء%</th>
              <th className="text-right p-4 font-medium text-slate-600">نسبة الهدر%</th>
              <th className="text-right p-4 font-medium text-slate-600">ربح المساهمة</th>
              <th className="text-right p-4 font-medium text-slate-600">الهامش%</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((b) => {
              const fullData = branchList.find(bl => bl.id === b.id)
              return (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-4">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      b.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                      b.rank === 2 ? 'bg-slate-100 text-slate-600' :
                      b.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {b.rank}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{b.name}</td>
                  <td className="p-4 number-display">{formatCurrency(b.netSales)}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      (fullData?.foodCostPct ?? 0) > 35 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {formatPercent(fullData?.foodCostPct ?? 0)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      (fullData?.wasteValuePct ?? 0) > 3 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {formatPercent(fullData?.wasteValuePct ?? 0)}
                    </span>
                  </td>
                  <td className={`p-4 number-display font-medium ${(fullData?.contributionProfit ?? 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(fullData?.contributionProfit ?? 0)}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      b.margin > 20 ? 'bg-green-100 text-green-700' :
                      b.margin > 10 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {formatPercent(b.margin)}
                    </span>
                  </td>
                </tr>
              )
            })}
            {ranked.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-400">لا توجد بيانات ربحية للفروع</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
