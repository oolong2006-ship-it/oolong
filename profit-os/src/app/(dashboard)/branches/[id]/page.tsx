import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Building2 } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function BranchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId

  const branch = await prisma.branch.findFirst({
    where: { id, organizationId: orgId },
    include: { brand: { select: { name: true, nameAr: true } } },
  })

  if (!branch) notFound()

  const snapshots = await prisma.branchProfitabilitySnapshot.findMany({
    where: { branchId: id, organizationId: orgId },
    orderBy: { period: 'desc' },
    take: 6,
  })

  return (
    <div>
      <PageHeader title={branch.nameAr ?? branch.name} titleAr={branch.nameAr ?? branch.name} icon={Building2} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">معلومات الفرع</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">الكود</dt>
              <dd className="font-medium">{branch.code}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">النوع</dt>
              <dd>{branch.branchType}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">المدينة</dt>
              <dd>{branch.city ?? '—'}</dd>
            </div>
            {branch.targetFoodCostPct && (
              <div className="flex justify-between">
                <dt className="text-slate-500">هدف تكلفة الغذاء</dt>
                <dd className="font-medium">{formatPercent(branch.targetFoodCostPct)}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">الأداء الشهري</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-right pb-2 text-slate-500 font-medium text-xs">الفترة</th>
                <th className="text-right pb-2 text-slate-500 font-medium text-xs">المبيعات</th>
                <th className="text-right pb-2 text-slate-500 font-medium text-xs">تكلفة الغذاء%</th>
                <th className="text-right pb-2 text-slate-500 font-medium text-xs">ربح المساهمة</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s: typeof snapshots[number]) => (
                <tr key={s.id} className="border-b border-slate-50">
                  <td className="py-2.5 text-slate-500">{new Date(s.period).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}</td>
                  <td className="py-2.5 number-display">{formatCurrency(s.netSales)}</td>
                  <td className="py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${(s.foodCost/s.netSales*100) > 35 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {s.netSales > 0 ? formatPercent(s.foodCost/s.netSales*100) : '—'}
                    </span>
                  </td>
                  <td className={`py-2.5 number-display font-medium ${s.contributionProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(s.contributionProfit)}
                  </td>
                </tr>
              ))}
              {snapshots.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-slate-400 text-sm">لا توجد بيانات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
