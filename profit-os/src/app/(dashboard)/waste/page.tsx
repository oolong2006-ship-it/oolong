import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { subDays } from 'date-fns'
import { PREVENTABLE_REASONS } from '@/lib/calculations/waste'

export default async function WastePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId
  const thirtyDaysAgo = subDays(new Date(), 30)

  const wasteRecords = await prisma.wasteRecord.findMany({
    where: { organizationId: orgId, recordDate: { gte: thirtyDaysAgo } },
    include: {
      inventoryItem: { select: { name: true, nameAr: true } },
      branch: { select: { name: true, nameAr: true } },
    },
    orderBy: { recordDate: 'desc' },
  })

  const totalWasteValue = wasteRecords.reduce((s: number, r: typeof wasteRecords[number]) => s + (r.totalCost ?? 0), 0)
  const preventableWaste = wasteRecords
    .filter((r: typeof wasteRecords[number]) => PREVENTABLE_REASONS.includes(r.wasteReason as typeof PREVENTABLE_REASONS[number]))
    .reduce((s: number, r: typeof wasteRecords[number]) => s + (r.totalCost ?? 0), 0)
  const preventablePct = totalWasteValue > 0 ? (preventableWaste / totalWasteValue) * 100 : 0

  // Group by reason
  const byReasonMap: Record<string, number> = {}
  for (const r of wasteRecords) {
    const key = r.wasteReason
    byReasonMap[key] = (byReasonMap[key] ?? 0) + (r.totalCost ?? 0)
  }
  const byReason = Object.entries(byReasonMap)
    .map(([reason, totalValue]) => ({ reason, totalValue }))
    .sort((a, b) => b.totalValue - a.totalValue)

  // Group by inventory item
  const byItem = new Map<string, { name: string; value: number; count: number }>()
  for (const r of wasteRecords) {
    const key = r.inventoryItemId ?? r.itemName
    const name = r.inventoryItem?.nameAr ?? r.inventoryItem?.name ?? r.itemName
    const existing = byItem.get(key)
    if (existing) {
      existing.value += (r.totalCost ?? 0)
      existing.count++
    } else {
      byItem.set(key, { name, value: r.totalCost ?? 0, count: 1 })
    }
  }
  const topItems = Array.from(byItem.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const reasonLabels: Record<string, string> = {
    EXPIRED: 'انتهاء الصلاحية',
    SPOILED: 'تلف',
    OVERPRODUCTION: 'زيادة في الإنتاج',
    WRONG_PREPARATION: 'خطأ في التحضير',
    PORTIONING_ISSUE: 'مشكلة في التقطيع',
    STORAGE_ISSUE: 'مشكلة في التخزين',
    RECEIVING_REJECTION: 'رفض استلام',
    CUSTOMER_RETURN: 'إرجاع عميل',
    DELIVERY_DAMAGE: 'تلف توصيل',
    OTHER: 'أخرى',
  }

  return (
    <div>
      <PageHeader title="Waste" titleAr="تقرير الهدر" icon={Trash2} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="إجمالي قيمة الهدر"
          value={formatCurrency(totalWasteValue)}
          variant={totalWasteValue > 5000 ? 'danger' : 'default'}
        />
        <MetricCard title="عدد سجلات الهدر" value={wasteRecords.length.toString()} />
        <MetricCard
          title="الهدر القابل للمنع"
          value={formatCurrency(preventableWaste)}
          variant={preventablePct > 50 ? 'danger' : 'warning'}
        />
        <MetricCard
          title="نسبة الهدر القابل للمنع"
          value={formatPercent(preventablePct)}
          variant={preventablePct > 50 ? 'danger' : 'default'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* By Reason */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">الهدر حسب السبب</h2>
          <div className="space-y-3">
            {byReason.map((r: { reason: string; totalValue: number }) => (
              <div key={r.reason} className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  PREVENTABLE_REASONS.includes(r.reason as typeof PREVENTABLE_REASONS[number])
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {reasonLabels[r.reason] ?? r.reason}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-red-400 h-1.5 rounded-full"
                    style={{ width: `${totalWasteValue > 0 ? (r.totalValue / totalWasteValue) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-700 number-display shrink-0">
                  {formatCurrency(r.totalValue)}
                </span>
              </div>
            ))}
            {byReason.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">لا توجد بيانات</p>
            )}
          </div>
        </div>

        {/* Top Wasted Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">أعلى الأصناف هدراً</h2>
          <div className="space-y-2">
            {topItems.map((item: { id: string; name: string; value: number; count: number }, idx: number) => (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-5">{idx + 1}</span>
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-red-600 number-display">{formatCurrency(item.value)}</span>
              </div>
            ))}
            {topItems.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">لا توجد بيانات</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Waste Records */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">آخر سجلات الهدر (30 يوم)</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-right p-3 font-medium text-slate-600">التاريخ</th>
              <th className="text-right p-3 font-medium text-slate-600">الصنف</th>
              <th className="text-right p-3 font-medium text-slate-600">الفرع</th>
              <th className="text-right p-3 font-medium text-slate-600">السبب</th>
              <th className="text-right p-3 font-medium text-slate-600">الكمية</th>
              <th className="text-right p-3 font-medium text-slate-600">القيمة</th>
            </tr>
          </thead>
          <tbody>
            {wasteRecords.slice(0, 50).map((r: typeof wasteRecords[number]) => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-3 text-slate-500">
                  {new Date(r.recordDate).toLocaleDateString('ar-SA')}
                </td>
                <td className="p-3 font-medium">{r.inventoryItem?.nameAr ?? r.inventoryItem?.name ?? r.itemName}</td>
                <td className="p-3 text-slate-500">{r.branch?.nameAr ?? r.branch?.name ?? '—'}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    PREVENTABLE_REASONS.includes(r.wasteReason as typeof PREVENTABLE_REASONS[number])
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {reasonLabels[r.wasteReason] ?? r.wasteReason}
                  </span>
                </td>
                <td className="p-3 number-display">{r.quantity} {r.unit}</td>
                <td className="p-3 number-display font-medium text-red-600">{formatCurrency(r.totalCost ?? 0)}</td>
              </tr>
            ))}
            {wasteRecords.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">لا توجد سجلات هدر</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
