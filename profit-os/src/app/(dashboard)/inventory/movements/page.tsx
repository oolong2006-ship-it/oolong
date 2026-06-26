import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Package } from 'lucide-react'

export default async function MovementsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId

  const movements = await prisma.stockMovement.findMany({
    where: { organizationId: orgId },
    include: {
      inventoryItem: { select: { name: true, nameAr: true, sku: true } },
      branch: { select: { name: true, nameAr: true } },
    },
    orderBy: { movementDate: 'desc' },
    take: 50,
  })

  const movementTypeLabels: Record<string, string> = {
    PURCHASE_RECEIPT: 'استلام مشتريات',
    TRANSFER_IN: 'تحويل وارد',
    TRANSFER_OUT: 'تحويل صادر',
    PRODUCTION_ISSUE: 'إصدار للإنتاج',
    BRANCH_ISSUE: 'إصدار للفرع',
    SALES_CONSUMPTION: 'استهلاك مبيعات',
    WASTE: 'هدر',
    RETURN_TO_SUPPLIER: 'إرجاع للمورد',
    ADJUSTMENT: 'تسوية',
    COUNT_VARIANCE: 'فرق جرد',
  }

  return (
    <div>
      <PageHeader title="Stock Movements" titleAr="حركات المخزون" icon={Package} />
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-right p-4 font-medium text-slate-600">التاريخ</th>
              <th className="text-right p-4 font-medium text-slate-600">الصنف</th>
              <th className="text-right p-4 font-medium text-slate-600">النوع</th>
              <th className="text-right p-4 font-medium text-slate-600">الكمية</th>
              <th className="text-right p-4 font-medium text-slate-600">التكلفة الإجمالية</th>
              <th className="text-right p-4 font-medium text-slate-600">الفرع</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m: typeof movements[number]) => (
              <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-4 text-slate-500">{formatDate(m.movementDate)}</td>
                <td className="p-4">
                  <p className="font-medium">{m.inventoryItem.nameAr ?? m.inventoryItem.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{m.inventoryItem.sku}</p>
                </td>
                <td className="p-4">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {movementTypeLabels[m.movementType] ?? m.movementType}
                  </span>
                </td>
                <td className={`p-4 font-medium number-display ${m.quantity < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {m.quantity > 0 ? '+' : ''}{m.quantity.toFixed(2)}
                </td>
                <td className="p-4 number-display">{m.totalCost ? formatCurrency(m.totalCost) : '—'}</td>
                <td className="p-4 text-slate-500">{m.branch ? (m.branch.nameAr ?? m.branch.name) : '—'}</td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">لا توجد حركات</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
