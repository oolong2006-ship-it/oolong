import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { BarChart3 } from 'lucide-react'
import { subDays } from 'date-fns'
import { engineerMenu } from '@/lib/calculations/menuEngineering'
import { calculateRecipeFoodCost } from '@/lib/calculations/recipe'

export default async function MenuEngineeringPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId
  const thirtyDaysAgo = subDays(new Date(), 30)

  const snapshots = await prisma.itemProfitabilitySnapshot.findMany({
    where: { organizationId: orgId, period: { gte: thirtyDaysAgo } },
    include: { menuItem: { select: { name: true, nameAr: true } } },
  })

  // Group by menuItemId and sum
  const byItem = new Map<string, { name: string; salesQuantity: number; contributionMargin: number; foodCostPct: number }>()
  for (const snap of snapshots) {
    const existing = byItem.get(snap.menuItemId)
    if (existing) {
      existing.salesQuantity += snap.salesQuantity
      existing.contributionMargin = (existing.contributionMargin + snap.contributionMargin) / 2
    } else {
      byItem.set(snap.menuItemId, {
        name: snap.menuItem.nameAr ?? snap.menuItem.name,
        salesQuantity: snap.salesQuantity,
        contributionMargin: snap.contributionMargin,
        foodCostPct: snap.foodCostPct,
      })
    }
  }

  const items = Array.from(byItem.entries()).map(([id, data]) => ({ id, ...data }))
  const engineered = engineerMenu(items)

  const classLabels: Record<string, { label: string; color: string; bg: string }> = {
    STAR: { label: 'نجم', color: 'text-green-700', bg: 'bg-green-100' },
    PLOWHORSE: { label: 'حصان العمل', color: 'text-blue-700', bg: 'bg-blue-100' },
    PUZZLE: { label: 'لغز', color: 'text-amber-700', bg: 'bg-amber-100' },
    DOG: { label: 'ذيل القائمة', color: 'text-red-700', bg: 'bg-red-100' },
  }

  return (
    <div>
      <PageHeader title="Menu Engineering" titleAr="هندسة القائمة (مصفوفة BCG)" icon={BarChart3} />

      {/* Stats by class */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(['STAR', 'PLOWHORSE', 'PUZZLE', 'DOG'] as const).map(cls => {
          const count = engineered.filter(i => i.classification === cls).length
          const cfg = classLabels[cls]
          return (
            <div key={cls} className="bg-white rounded-xl border border-slate-200 p-4">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color} ${cfg.bg}`}>
                {cfg.label}
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-2">{count}</p>
              <p className="text-xs text-slate-400">منتج</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-right p-4 font-medium text-slate-600">المنتج</th>
              <th className="text-right p-4 font-medium text-slate-600">الكمية المباعة</th>
              <th className="text-right p-4 font-medium text-slate-600">نسبة المبيعات%</th>
              <th className="text-right p-4 font-medium text-slate-600">هامش المساهمة</th>
              <th className="text-right p-4 font-medium text-slate-600">نسبة التكلفة%</th>
              <th className="text-right p-4 font-medium text-slate-600">التصنيف</th>
            </tr>
          </thead>
          <tbody>
            {engineered.sort((a, b) => {
              const order = { STAR: 0, PLOWHORSE: 1, PUZZLE: 2, DOG: 3 }
              return order[a.classification] - order[b.classification]
            }).map(item => {
              const cfg = classLabels[item.classification]
              return (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 number-display">{item.salesQuantity.toLocaleString('ar-SA')}</td>
                  <td className="p-4">{formatPercent(item.salesMixPct)}</td>
                  <td className={`p-4 number-display font-medium ${item.contributionMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.contributionMargin)}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      (byItem.get(item.id)?.foodCostPct ?? 0) > 35 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {formatPercent(byItem.get(item.id)?.foodCostPct ?? 0)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.color} ${cfg.bg}`}>
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              )
            })}
            {engineered.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">لا توجد بيانات كافية لهندسة القائمة</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
