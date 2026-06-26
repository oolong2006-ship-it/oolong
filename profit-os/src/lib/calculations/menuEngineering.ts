/**
 * Menu Engineering (BCG Matrix) Calculations
 * Pure functions for menu item classification.
 * Formula reference: docs/calculation-formulas.md
 */

export type MenuEngineeringClass = 'STAR' | 'PLOWHORSE' | 'PUZZLE' | 'DOG'

export interface MenuItemForEngineering {
  id: string
  name: string
  salesQuantity: number
  contributionMargin: number
}

export interface EngineeredMenuItem extends MenuItemForEngineering {
  salesMixPct: number
  popularityScore: number
  profitabilityScore: number
  classification: MenuEngineeringClass
  avgContributionMargin: number
  totalQuantity: number
}

/**
 * Sales Mix % = Item Quantity / Total Quantity * 100
 * Returns 0 if totalQuantity is 0.
 */
export function calculateSalesMixPct(itemQuantity: number, totalQuantity: number): number {
  if (totalQuantity === 0) return 0
  return (itemQuantity / totalQuantity) * 100
}

/**
 * Popularity Score = Item Sales Mix % / Expected Popularity %
 * Expected Popularity = (1 / menuItemCount) * 70% (Miller's rule)
 * Score >= 1 = Popular
 */
export function calculatePopularityScore(
  itemSalesQuantity: number,
  totalSalesQuantity: number,
  menuItemCount: number
): number {
  if (totalSalesQuantity === 0 || menuItemCount === 0) return 0
  const popularityPct = (itemSalesQuantity / totalSalesQuantity) * 100
  const expectedPopularityPct = (1 / menuItemCount) * 100 * 0.7 // 70% of expected
  return popularityPct / expectedPopularityPct
}

/**
 * Profitability Score = Item CM / Average CM
 * Score >= 1 = High Profit
 */
export function calculateProfitabilityScore(
  itemContributionMargin: number,
  avgContributionMargin: number
): number {
  if (avgContributionMargin === 0) return 0
  return itemContributionMargin / avgContributionMargin
}

/**
 * BCG Classification:
 * Popular + High Profit = STAR
 * Popular + Low Profit  = PLOWHORSE
 * Unpopular + High Profit = PUZZLE
 * Unpopular + Low Profit  = DOG
 */
export function classifyMenuItem(
  popularityScore: number,
  profitabilityScore: number
): MenuEngineeringClass {
  const isPopular = popularityScore >= 1
  const isProfitable = profitabilityScore >= 1

  if (isPopular && isProfitable) return 'STAR'
  if (isPopular && !isProfitable) return 'PLOWHORSE'
  if (!isPopular && isProfitable) return 'PUZZLE'
  return 'DOG'
}

/**
 * Run full menu engineering analysis on a set of menu items.
 */
export function engineerMenu(items: MenuItemForEngineering[]): EngineeredMenuItem[] {
  if (items.length === 0) return []

  const totalQuantity = items.reduce((sum, item) => sum + item.salesQuantity, 0)
  const avgContributionMargin =
    items.reduce((sum, item) => sum + item.contributionMargin, 0) / items.length

  return items.map((item) => {
    const salesMixPct = calculateSalesMixPct(item.salesQuantity, totalQuantity)
    const popularityScore = calculatePopularityScore(
      item.salesQuantity,
      totalQuantity,
      items.length
    )
    const profitabilityScore = calculateProfitabilityScore(
      item.contributionMargin,
      avgContributionMargin
    )
    const classification = classifyMenuItem(popularityScore, profitabilityScore)

    return {
      ...item,
      salesMixPct,
      popularityScore,
      profitabilityScore,
      classification,
      avgContributionMargin,
      totalQuantity,
    }
  })
}

/**
 * Get strategy recommendations for each classification.
 */
export function getClassificationStrategy(classification: MenuEngineeringClass): {
  labelEn: string
  labelAr: string
  strategy: string
  strategyAr: string
  color: string
} {
  const strategies: Record<MenuEngineeringClass, {
    labelEn: string
    labelAr: string
    strategy: string
    strategyAr: string
    color: string
  }> = {
    STAR: {
      labelEn: 'Star',
      labelAr: 'نجم',
      strategy: 'Maintain quality, promote heavily, protect price',
      strategyAr: 'حافظ على الجودة، رَوِّج بقوة، احمِ السعر',
      color: '#22c55e',
    },
    PLOWHORSE: {
      labelEn: 'Plowhorse',
      labelAr: 'حصان العمل',
      strategy: 'Reduce cost, reposition, or increase price slightly',
      strategyAr: 'خفِّض التكلفة أو أعِد التسعير',
      color: '#3b82f6',
    },
    PUZZLE: {
      labelEn: 'Puzzle',
      labelAr: 'لغز',
      strategy: 'Feature prominently, improve placement, add combo',
      strategyAr: 'أبرِزه في القائمة أو اجمعه مع وجبة',
      color: '#f59e0b',
    },
    DOG: {
      labelEn: 'Dog',
      labelAr: 'ذيل القائمة',
      strategy: 'Remove from menu or completely redesign',
      strategyAr: 'أزِله من القائمة أو أعِد تصميمه بالكامل',
      color: '#ef4444',
    },
  }

  return strategies[classification]
}
