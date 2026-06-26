import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ShieldCheck } from 'lucide-react'
import { subDays } from 'date-fns'

export default async function QualityPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId
  const thirtyDaysAgo = subDays(new Date(), 30)

  const [issues, scorecards] = await Promise.all([
    prisma.qualityIssue.findMany({
      where: { organizationId: orgId, issueDate: { gte: thirtyDaysAgo } },
      include: {
        supplier: { select: { name: true, nameAr: true } },
        branch: { select: { name: true, nameAr: true } },
        correctiveActions: { select: { id: true, status: true } },
      },
      orderBy: { issueDate: 'desc' },
    }),
    prisma.supplierScorecard.findMany({
      where: { organizationId: orgId },
      include: { supplier: { select: { name: true, nameAr: true } } },
      orderBy: { overallScore: 'desc' },
      take: 10,
    }),
  ])

  const openIssues = issues.filter((i: typeof issues[number]) => i.status !== 'resolved' && i.status !== 'closed')
  const criticalIssues = issues.filter((i: typeof issues[number]) => i.severity === 'CRITICAL')
  const resolvedIssues = issues.filter((i: typeof issues[number]) => i.status === 'resolved' || i.status === 'closed')
  const resolutionRate = issues.length > 0 ? (resolvedIssues.length / issues.length) * 100 : 0

  const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
    LOW: { label: 'منخفض', color: 'text-slate-600', bg: 'bg-slate-100' },
    MEDIUM: { label: 'متوسط', color: 'text-amber-700', bg: 'bg-amber-100' },
    HIGH: { label: 'عالي', color: 'text-orange-700', bg: 'bg-orange-100' },
    CRITICAL: { label: 'حرج', color: 'text-red-700', bg: 'bg-red-100' },
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    open: { label: 'مفتوح', color: 'text-red-600' },
    in_progress: { label: 'قيد المعالجة', color: 'text-amber-600' },
    resolved: { label: 'تم الحل', color: 'text-green-600' },
    closed: { label: 'مغلق', color: 'text-slate-400' },
  }

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'

  return (
    <div>
      <PageHeader title="Quality" titleAr="إدارة الجودة" icon={ShieldCheck} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="مشاكل مفتوحة"
          value={openIssues.length.toString()}
          variant={openIssues.length > 5 ? 'danger' : openIssues.length > 0 ? 'warning' : 'success'}
        />
        <MetricCard
          title="مشاكل حرجة"
          value={criticalIssues.length.toString()}
          variant={criticalIssues.length > 0 ? 'danger' : 'success'}
        />
        <MetricCard
          title="إجمالي المشاكل (30 يوم)"
          value={issues.length.toString()}
        />
        <MetricCard
          title="معدل الحل"
          value={`${resolutionRate.toFixed(0)}%`}
          variant={resolutionRate >= 80 ? 'success' : resolutionRate >= 50 ? 'warning' : 'danger'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Quality Issues */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">مشاكل الجودة (30 يوم)</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {issues.slice(0, 10).map((issue: typeof issues[number]) => {
              const sev = severityConfig[issue.severity] ?? severityConfig.MEDIUM
              const st = statusConfig[issue.status] ?? statusConfig.open
              return (
                <div key={issue.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-slate-800 text-sm">{issue.category}</p>
                    <div className="flex gap-1.5 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sev.bg} ${sev.color}`}>
                        {sev.label}
                      </span>
                      <span className={`text-xs font-medium ${st.color}`}>{st.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{issue.description}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {issue.supplier?.nameAr ?? issue.supplier?.name ?? '—'}
                    {issue.branch && ` · ${issue.branch.nameAr ?? issue.branch.name}`}
                    {' · '}{new Date(issue.issueDate).toLocaleDateString('ar-SA')}
                  </p>
                  {issue.correctiveActions.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      {issue.correctiveActions.length} إجراء تصحيحي
                    </p>
                  )}
                </div>
              )
            })}
            {issues.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">لا توجد مشاكل جودة</div>
            )}
          </div>
        </div>

        {/* Supplier Scorecards */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">تقييم الموردين</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-right p-3 font-medium text-slate-600 text-xs">المورد</th>
                <th className="text-right p-3 font-medium text-slate-600 text-xs">السعر</th>
                <th className="text-right p-3 font-medium text-slate-600 text-xs">الجودة</th>
                <th className="text-right p-3 font-medium text-slate-600 text-xs">التوصيل</th>
                <th className="text-right p-3 font-medium text-slate-600 text-xs">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {scorecards.map((sc: typeof scorecards[number]) => (
                <tr key={sc.id} className="border-t border-slate-50 hover:bg-slate-50">
                  <td className="p-3 font-medium">{sc.supplier.nameAr ?? sc.supplier.name}</td>
                  <td className="p-3 text-slate-600">{sc.priceScore.toFixed(0)}</td>
                  <td className="p-3 text-slate-600">{sc.qualityScore.toFixed(0)}</td>
                  <td className="p-3 text-slate-600">{sc.deliveryScore.toFixed(0)}</td>
                  <td className={`p-3 font-bold number-display ${scoreColor(sc.overallScore)}`}>
                    {sc.overallScore.toFixed(1)}
                  </td>
                </tr>
              ))}
              {scorecards.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 text-sm">
                    لا توجد تقييمات موردين
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
