import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { formatCurrency } from '@/lib/utils'
import { UtensilsCrossed } from 'lucide-react'

export default async function MenuPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId

  const categories = await prisma.menuCategory.findMany({
    where: { organizationId: orgId, isActive: true },
    include: {
      menuItems: {
        where: { isActive: true },
        include: { sellingPrices: { where: { isDefault: true }, take: 1 } },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div>
      <PageHeader title="Menu" titleAr="قائمة الطعام" icon={UtensilsCrossed} />
      <div className="space-y-6">
        {categories.map((cat: typeof categories[number]) => (
          <div key={cat.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              {cat.nameAr ?? cat.name}
              <span className="text-xs text-slate-400 font-normal mr-2">
                ({cat.menuItems.length} منتج)
              </span>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {cat.menuItems.map((item: typeof cat.menuItems[number]) => (
                <div key={item.id} className="border border-slate-100 rounded-lg p-3 hover:border-blue-200 transition-colors">
                  <p className="font-medium text-slate-800 text-sm">{item.nameAr ?? item.name}</p>
                  {item.sku && <p className="text-xs text-slate-400 mt-0.5 font-mono">{item.sku}</p>}
                  <p className="text-blue-600 font-bold text-sm mt-2 number-display">
                    {item.sellingPrices[0] ? formatCurrency(item.sellingPrices[0].sellingPrice) : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <UtensilsCrossed size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد منتجات في القائمة</p>
          </div>
        )}
      </div>
    </div>
  )
}
