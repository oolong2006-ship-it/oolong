/**
 * Delivery Platform Profitability Calculations
 * Pure functions for analyzing delivery platform economics.
 * Formula reference: docs/calculation-formulas.md
 */

export interface DeliverySettlementData {
  grossSales: number
  discounts: number
  platformCommission: number
  promotionCost: number
  bankFees: number
  deliveryFees: number
  marketingFees: number
  vatOnFees: number
  orderCount: number
  estimatedFoodCost: number
  packagingCost: number
}

export interface DeliveryAnalysisResult {
  netAfterFees: number
  contributionMargin: number
  profitPerOrder: number
  marginPct: number
  effectiveCommissionRate: number
  isProfitable: boolean
  isLossMaking: boolean
}

/**
 * Net After Platform Fees = Gross Sales - Discounts - Commission - Promotion - Bank - Delivery - Marketing - VAT on Fees
 */
export function calculateNetAfterPlatformFees(data: {
  grossSales: number
  discounts: number
  platformCommission: number
  promotionCost: number
  bankFees: number
  deliveryFees: number
  marketingFees: number
  vatOnFees: number
}): number {
  return (
    data.grossSales -
    data.discounts -
    data.platformCommission -
    data.promotionCost -
    data.bankFees -
    data.deliveryFees -
    data.marketingFees -
    data.vatOnFees
  )
}

/**
 * Platform Contribution Margin = Net After Fees - Food Cost - Packaging Cost
 */
export function calculatePlatformContributionMargin(
  netAfterFees: number,
  estimatedFoodCost: number,
  packagingCost: number
): number {
  return netAfterFees - estimatedFoodCost - packagingCost
}

/**
 * Profit per Order = Contribution Margin / Order Count
 * Returns 0 if orderCount is 0.
 */
export function calculateProfitPerOrder(contributionMargin: number, orderCount: number): number {
  if (orderCount === 0) return 0
  return contributionMargin / orderCount
}

/**
 * Platform Margin % = (Contribution Margin / Gross Sales) * 100
 * Returns 0 if grossSales is 0.
 */
export function calculatePlatformMarginPercentage(
  contributionMargin: number,
  grossSales: number
): number {
  if (grossSales === 0) return 0
  return (contributionMargin / grossSales) * 100
}

/**
 * Effective Commission Rate % = (Commission + Promotion + Bank + Marketing) / Gross Sales * 100
 * This is the TRUE cost of the platform vs nominal commission %.
 */
export function calculateEffectiveCommissionRate(
  platformCommission: number,
  promotionCost: number,
  bankFees: number,
  marketingFees: number,
  grossSales: number
): number {
  if (grossSales === 0) return 0
  return ((platformCommission + promotionCost + bankFees + marketingFees) / grossSales) * 100
}

/**
 * Full delivery profitability analysis for a settlement period.
 */
export function analyzeDeliveryProfitability(data: DeliverySettlementData): DeliveryAnalysisResult {
  const netAfterFees = calculateNetAfterPlatformFees(data)
  const contributionMargin = calculatePlatformContributionMargin(
    netAfterFees,
    data.estimatedFoodCost,
    data.packagingCost
  )
  const profitPerOrder = calculateProfitPerOrder(contributionMargin, data.orderCount)
  const marginPct = calculatePlatformMarginPercentage(contributionMargin, data.grossSales)
  const effectiveCommissionRate = calculateEffectiveCommissionRate(
    data.platformCommission,
    data.promotionCost,
    data.bankFees,
    data.marketingFees,
    data.grossSales
  )

  return {
    netAfterFees,
    contributionMargin,
    profitPerOrder,
    marginPct,
    effectiveCommissionRate,
    isProfitable: contributionMargin > 0,
    isLossMaking: contributionMargin < 0,
  }
}
