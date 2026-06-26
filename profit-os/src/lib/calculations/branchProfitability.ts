/**
 * Branch Profitability Calculations
 * Pure functions for branch-level P&L analysis.
 * Formula reference: docs/calculation-formulas.md
 */

export interface BranchCostData {
  netSales: number
  foodCost: number
  packagingCost: number
  platformFees: number
  wasteValue: number
  laborCost?: number
  rentCost?: number
  utilitiesCost?: number
  fixedCostAllocations?: number
}

export interface BranchProfitabilityResult {
  netSales: number
  contributionProfit: number
  operatingProfitEstimate: number
  contributionMarginPct: number
  operatingMarginPct: number
  foodCostPct: number
  wasteValuePct: number
  platformFeesPct: number
}

/**
 * Contribution Profit = Net Sales - Food Cost - Packaging - Platform Fees - Waste
 * This is profitability before fixed costs (labor, rent, etc.)
 */
export function calculateBranchContributionProfit(data: {
  netSales: number
  foodCost: number
  packagingCost: number
  platformFees: number
  wasteValue: number
}): number {
  return (
    data.netSales -
    data.foodCost -
    data.packagingCost -
    data.platformFees -
    data.wasteValue
  )
}

/**
 * Operating Profit Estimate = Contribution Profit - Labor - Rent - Utilities - Fixed Allocations
 */
export function calculateBranchOperatingProfitEstimate(
  contributionProfit: number,
  laborCost = 0,
  rentCost = 0,
  utilitiesCost = 0,
  fixedCostAllocations = 0
): number {
  return contributionProfit - laborCost - rentCost - utilitiesCost - fixedCostAllocations
}

/**
 * Branch Margin % = Profit / Net Sales * 100
 * Returns 0 if netSales is 0.
 */
export function calculateBranchMargin(profit: number, netSales: number): number {
  if (netSales === 0) return 0
  return (profit / netSales) * 100
}

/**
 * Food Cost % = Food Cost / Net Sales * 100
 * Alert if > 35%.
 */
export function calculateFoodCostPct(foodCost: number, netSales: number): number {
  if (netSales === 0) return 0
  return (foodCost / netSales) * 100
}

/**
 * Waste % = Waste Value / Net Sales * 100
 * Alert if > 3%.
 */
export function calculateWastePct(wasteValue: number, netSales: number): number {
  if (netSales === 0) return 0
  return (wasteValue / netSales) * 100
}

/**
 * Rank branches by margin (highest first).
 */
export function rankBranches(
  branches: Array<{ id: string; name: string; margin: number; netSales: number }>
): Array<{ id: string; name: string; margin: number; netSales: number; rank: number }> {
  return branches
    .sort((a, b) => b.margin - a.margin)
    .map((branch, index) => ({ ...branch, rank: index + 1 }))
}

/**
 * Full branch profitability analysis.
 */
export function analyzeBranchProfitability(data: BranchCostData): BranchProfitabilityResult {
  const contributionProfit = calculateBranchContributionProfit(data)
  const operatingProfitEstimate = calculateBranchOperatingProfitEstimate(
    contributionProfit,
    data.laborCost,
    data.rentCost,
    data.utilitiesCost,
    data.fixedCostAllocations
  )
  const contributionMarginPct = calculateBranchMargin(contributionProfit, data.netSales)
  const operatingMarginPct = calculateBranchMargin(operatingProfitEstimate, data.netSales)
  const foodCostPct = calculateFoodCostPct(data.foodCost, data.netSales)
  const wasteValuePct = calculateWastePct(data.wasteValue, data.netSales)
  const platformFeesPct =
    data.netSales === 0 ? 0 : (data.platformFees / data.netSales) * 100

  return {
    netSales: data.netSales,
    contributionProfit,
    operatingProfitEstimate,
    contributionMarginPct,
    operatingMarginPct,
    foodCostPct,
    wasteValuePct,
    platformFeesPct,
  }
}

/**
 * Calculate vs target variance for a branch metric.
 */
export function calculateVsTarget(
  actual: number,
  target: number
): { variance: number; variancePct: number; isBelowTarget: boolean } {
  const variance = actual - target
  const variancePct = target === 0 ? 0 : (variance / target) * 100
  return { variance, variancePct, isBelowTarget: actual < target }
}
