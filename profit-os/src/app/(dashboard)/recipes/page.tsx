import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/common/PageHeader'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { ChefHat } from 'lucide-react'
import { calculateRecipeFoodCost } from '@/lib/calculations/recipe'

export default async function RecipesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return null
  const orgId = session.user.organizationId

  const menuItems = await prisma.menuItem.findMany({
    where: { organizationId: orgId, isActive: true },
    include: {
      category: { select: { nameAr: true, name: true } },
      recipes: {
        where: { isActive: true },
        include: {
          ingredients: {
            include: {
              inventoryItem: { select: { currentAverageCost: true, name: true, nameAr: true } },
            },
          },
        },
        take: 1,
      },
      sellingPrices: { where: { isDefault: true }, take: 1 },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <PageHeader title="Recipes" titleAr="الوصفات وتكلفة الغذاء" icon={ChefHat} />
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-right p-4 font-medium text-slate-600">المنتج</th>
              <th className="text-right p-4 font-medium text-slate-600">الفئة</th>
              <th className="text-right p-4 font-medium text-slate-600">سعر البيع</th>
              <th className="text-right p-4 font-medium text-slate-600">تكلفة الغذاء</th>
              <th className="text-right p-4 font-medium text-slate-600">نسبة التكلفة%</th>
              <th className="text-right p-4 font-medium text-slate-600">هامش الربح</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item: typeof menuItems[number]) => {
              const recipe = item.recipes[0]
              const sellingPrice = item.sellingPrices[0]?.sellingPrice ?? 0
              let foodCost = 0
              if (recipe) {
                foodCost = calculateRecipeFoodCost(
                  recipe.ingredients.map((ing: typeof recipe.ingredients[number]) => ({
                    quantity: ing.quantity,
                    unit: ing.unit,
                    unitCost: ing.inventoryItem.currentAverageCost ?? 0,
                    yieldPct: ing.yieldPct,
                    wastePct: ing.wastePct,
                  }))
                )
              }
              const foodCostPct = sellingPrice > 0 ? (foodCost / sellingPrice) * 100 : 0
              const contributionMargin = sellingPrice - foodCost

              return (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-4 font-medium">{item.nameAr ?? item.name}</td>
                  <td className="p-4 text-slate-500">{item.category?.nameAr ?? item.category?.name ?? '—'}</td>
                  <td className="p-4 number-display font-medium">{sellingPrice > 0 ? formatCurrency(sellingPrice) : '—'}</td>
                  <td className="p-4 number-display">{recipe ? formatCurrency(foodCost) : 'لا وصفة'}</td>
                  <td className="p-4">
                    {recipe && sellingPrice > 0 ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        foodCostPct > 35 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {formatPercent(foodCostPct)}
                      </span>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className={`p-4 number-display font-medium ${contributionMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {recipe && sellingPrice > 0 ? formatCurrency(contributionMargin) : '—'}
                  </td>
                </tr>
              )
            })}
            {menuItems.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">لا توجد منتجات</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
