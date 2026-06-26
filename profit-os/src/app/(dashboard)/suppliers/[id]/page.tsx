import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId

  const supplier = await prisma.supplier.findFirst({
    where: { id, organizationId: orgId },
    include: {
      contacts: true,
      contracts: { orderBy: { createdAt: 'desc' }, take: 3 },
      scorecards: { orderBy: { createdAt: 'desc' }, take: 3 },
      purchaseInvoices: {
        orderBy: { invoiceDate: 'desc' },
        take: 10,
        select: { id: true, invoiceNumber: true, invoiceDate: true, totalAmount: true },
      },
    },
  })

  if (!supplier) notFound()

  return (
    <div>
      <PageHeader title={supplier.nameAr ?? supplier.name} titleAr={supplier.nameAr ?? supplier.name} icon={Users} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">معلومات المورد</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">الكود</dt>
              <dd className="font-medium">{supplier.code}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">جهة الاتصال</dt>
              <dd>{supplier.contactName ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">الهاتف</dt>
              <dd dir="ltr">{supplier.phone ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">البريد</dt>
              <dd dir="ltr">{supplier.email ?? '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">أحدث الفواتير</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-right pb-2 text-slate-500 font-medium text-xs">رقم الفاتورة</th>
                <th className="text-right pb-2 text-slate-500 font-medium text-xs">التاريخ</th>
                <th className="text-right pb-2 text-slate-500 font-medium text-xs">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {supplier.purchaseInvoices.map((inv: typeof supplier.purchaseInvoices[number]) => (
                <tr key={inv.id} className="border-b border-slate-50">
                  <td className="py-2.5 font-medium">{inv.invoiceNumber}</td>
                  <td className="py-2.5 text-slate-500">{formatDate(inv.invoiceDate)}</td>
                  <td className="py-2.5 number-display font-medium">{formatCurrency(inv.totalAmount)}</td>
                </tr>
              ))}
              {supplier.purchaseInvoices.length === 0 && (
                <tr><td colSpan={3} className="py-4 text-center text-slate-400 text-sm">لا توجد فواتير</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
