import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { formatCurrency } from '@/lib/utils'
import { Users } from 'lucide-react'

export default async function SuppliersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId

  const suppliers = await prisma.supplier.findMany({
    where: { organizationId: orgId, isActive: true },
    include: {
      scorecards: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { purchaseInvoices: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <PageHeader title="Suppliers" titleAr="إدارة الموردين" icon={Users} />
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-right p-4 font-medium text-slate-600">المورد</th>
              <th className="text-right p-4 font-medium text-slate-600">جهة الاتصال</th>
              <th className="text-right p-4 font-medium text-slate-600">الفواتير</th>
              <th className="text-right p-4 font-medium text-slate-600">التقييم</th>
              <th className="text-right p-4 font-medium text-slate-600">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s: typeof suppliers[number]) => (
              <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-4">
                  <p className="font-medium text-slate-800">{s.nameAr ?? s.name}</p>
                  <p className="text-xs text-slate-400">{s.code}</p>
                </td>
                <td className="p-4 text-slate-600">{s.contactName ?? '—'}</td>
                <td className="p-4 text-slate-600">{s._count.purchaseInvoices}</td>
                <td className="p-4">
                  {s.scorecards[0] ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.scorecards[0].overallScore >= 75 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {s.scorecards[0].overallScore.toFixed(0)}/100
                    </span>
                  ) : <span className="text-slate-400 text-xs">لم يُقيَّم</span>}
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.isApproved ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {s.isApproved ? 'معتمد' : 'غير معتمد'}
                  </span>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا يوجد موردون</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
