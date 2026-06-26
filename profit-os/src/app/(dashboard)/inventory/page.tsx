import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Package } from 'lucide-react'

export default async function InventoryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId

  const [itemCount, items] = await Promise.all([
    prisma.inventoryItem.count({ where: { organizationId: orgId, isActive: true } }),
    prisma.inventoryItem.findMany({
      where: { organizationId: orgId, isActive: true },
      include: {
        unit: { select: { abbreviation: true } },
        warehouseStock: { select: { quantity: true, averageCost: true } },
        branchStock: { select: { quantity: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ])

  // Calculate total stock value
  const totalStockValue = items.reduce((sum: number, item: typeof items[number]) => {
    const totalQty = item.warehouseStock.reduce((s: number, ws: { quantity: number }) => s + ws.quantity, 0)
    const avgCost = item.currentAverageCost ?? 0
    return sum + totalQty * avgCost
  }, 0)

  // Items below reorder point
  const belowReorder = items.filter((item: typeof items[number]) => {
    if (!item.reorderPoint) return false
    const totalQty = item.warehouseStock.reduce((s: number, ws: { quantity: number }) => s + ws.quantity, 0)
    return totalQty <= item.reorderPoint
  })

  return (
    <div>
      <PageHeader title="Inventory" titleAr="إدارة المخزون" icon={Package} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard title="إجمالي الأصناف" value={formatNumber(itemCount)} />
        <MetricCard title="قيمة المخزون" value={formatCurrency(totalStockValue)} />
        <MetricCard
          title="أصناف دون نقطة الإعادة"
          value={formatNumber(belowReorder.length)}
          variant={belowReorder.length > 0 ? 'warning' : 'success'}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-right p-4 font-medium text-slate-600">الصنف</th>
              <th className="text-right p-4 font-medium text-slate-600">SKU</th>
              <th className="text-right p-4 font-medium text-slate-600">الوحدة</th>
              <th className="text-right p-4 font-medium text-slate-600">الكمية الإجمالية</th>
              <th className="text-right p-4 font-medium text-slate-600">متوسط التكلفة</th>
              <th className="text-right p-4 font-medium text-slate-600">القيمة</th>
              <th className="text-right p-4 font-medium text-slate-600">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: typeof items[number]) => {
              const totalQty = item.warehouseStock.reduce((s: number, ws: { quantity: number }) => s + ws.quantity, 0)
              const avgCost = item.currentAverageCost ?? 0
              const totalValue = totalQty * avgCost
              const isBelowReorder = item.reorderPoint ? totalQty <= item.reorderPoint : false
              return (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-4 font-medium">{item.nameAr ?? item.name}</td>
                  <td className="p-4 text-slate-500 font-mono text-xs">{item.sku}</td>
                  <td className="p-4 text-slate-500">{item.unit?.abbreviation ?? '—'}</td>
                  <td className="p-4 number-display">{formatNumber(totalQty, 2)}</td>
                  <td className="p-4 number-display">{formatCurrency(avgCost)}</td>
                  <td className="p-4 number-display font-medium">{formatCurrency(totalValue)}</td>
                  <td className="p-4">
                    {isBelowReorder ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">إعادة طلب</span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">كافٍ</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {items.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-400">لا توجد أصناف في المخزون</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
