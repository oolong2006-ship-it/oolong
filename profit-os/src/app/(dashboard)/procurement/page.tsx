import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart } from 'lucide-react'
import { subDays } from 'date-fns'

export default async function ProcurementPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId
  const thirtyDaysAgo = subDays(new Date(), 30)

  const [invoiceAgg, supplierSpend, recentInvoices] = await Promise.all([
    prisma.purchaseInvoice.aggregate({
      where: { organizationId: orgId, invoiceDate: { gte: thirtyDaysAgo } },
      _sum: { totalAmount: true, vatAmount: true },
      _count: true,
    }),
    prisma.purchaseInvoice.groupBy({
      by: ['supplierId'],
      where: { organizationId: orgId, invoiceDate: { gte: thirtyDaysAgo } },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10,
    }),
    prisma.purchaseInvoice.findMany({
      where: { organizationId: orgId },
      include: { supplier: { select: { name: true, nameAr: true } } },
      orderBy: { invoiceDate: 'desc' },
      take: 20,
    }),
  ])

  const totalSpend = invoiceAgg._sum.totalAmount ?? 0
  const totalVat = invoiceAgg._sum.vatAmount ?? 0
  const invoiceCount = invoiceAgg._count

  // Get supplier names for spend
  const supplierIds = supplierSpend.map((s: { supplierId: string }) => s.supplierId)
  const suppliers = await prisma.supplier.findMany({
    where: { id: { in: supplierIds } },
    select: { id: true, name: true, nameAr: true },
  })
  const supplierMap = Object.fromEntries(suppliers.map((s: { id: string; name: string; nameAr: string | null }) => [s.id, s]))

  return (
    <div>
      <PageHeader title="Procurement" titleAr="إدارة المشتريات" subtitle="آخر 30 يوم" icon={ShoppingCart} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard title="إجمالي المشتريات" value={formatCurrency(totalSpend)} subtitle={`${invoiceCount} فاتورة`} />
        <MetricCard title="ضريبة القيمة المضافة" value={formatCurrency(totalVat)} />
        <MetricCard title="عدد الفواتير" value={invoiceCount.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">المشتريات حسب المورد</h2>
          {supplierSpend.length > 0 ? (
            <div className="space-y-3">
              {supplierSpend.map((s: typeof supplierSpend[number], i: number) => {
                const sup = supplierMap[s.supplierId]
                const amount = s._sum.totalAmount ?? 0
                const pct = totalSpend > 0 ? (amount / totalSpend) * 100 : 0
                return (
                  <div key={s.supplierId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">
                        <span className="text-slate-400 text-xs ml-1">#{i+1}</span>
                        {sup?.nameAr ?? sup?.name ?? s.supplierId}
                      </span>
                      <span className="font-medium number-display">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{pct.toFixed(1)}% من إجمالي المشتريات</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">لا توجد فواتير مشتريات</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">أحدث الفواتير</h2>
          <div className="space-y-2">
            {recentInvoices.map((inv: typeof recentInvoices[number]) => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-700">{inv.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">{inv.supplier.nameAr ?? inv.supplier.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold number-display">{formatCurrency(inv.totalAmount)}</p>
                  <p className="text-xs text-slate-400">{new Date(inv.invoiceDate).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
            ))}
            {recentInvoices.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">لا توجد فواتير</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
