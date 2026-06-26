/**
 * Recipe & Food Cost Calculations
 * Pure functions for recipe costing.
 * Formula reference: docs/calculation-formulas.md
 */

export interface RecipeIngredient {
  quantity: number
  unit: string
  unitCost: number
  yieldPct: number // e.g., 0.85 for 85% yield
  wastePct: number // e.g., 0.05 for 5% waste (usually 0 when yield is used)
}

/**
 * Recipe Food Cost = Sum of (quantity / yieldPct) * unitCost
 * yieldPct accounts for trim loss (e.g., 0.85 = 85% usable)
 */
export function calculateRecipeFoodCost(ingredients: RecipeIngredient[]): number {
  return ingredients.reduce((sum, ingredient) => {
    const effectiveQuantity = ingredient.yieldPct > 0
      ? ingredient.quantity / ingredient.yieldPct
      : ingredient.quantity
    return sum + effectiveQuantity * ingredient.unitCost
  }, 0)
}

/**
 * Packaging Cost = Sum of (quantity * unitCost) for packaging items
 */
export function calculatePackagingCost(
  packagingItems: Array<{ unitCost: number; quantity: number }>
): number {
  return packagingItems.reduce((sum, item) => sum + item.unitCost * item.quantity, 0)
}

/**
 * Item Contribution Margin = Selling Price - Food Cost - Packaging Cost - Channel Fee
 */
export function calculateItemContributionMargin(
  sellingPrice: number,
  foodCost: number,
  packagingCost: number,
  channelFeeEstimate = 0
): number {
  return sellingPrice - foodCost - packagingCost - channelFeeEstimate
}

/**
 * Food Cost % = Food Cost / Selling Price * 100
 * Returns 0 if sellingPrice is 0. Target: 25-35%.
 */
export function calculateFoodCostPercentage(foodCost: number, sellingPrice: number): number {
  if (sellingPrice === 0) return 0
  return (foodCost / sellingPrice) * 100
}

/**
 * Gross Margin % = Contribution Margin / Selling Price * 100
 * Returns 0 if sellingPrice is 0.
 */
export function calculateGrossMarginPercentage(
  contributionMargin: number,
  sellingPrice: number
): number {
  if (sellingPrice === 0) return 0
  return (contributionMargin / sellingPrice) * 100
}

/**
 * Recommended Selling Price = (Food Cost + Packaging Cost) / Target Food Cost %
 * Returns 0 if targetFoodCostPct is 0.
 */
export function calculateRecommendedSellingPrice(
  foodCost: number,
  packagingCost: number,
  targetFoodCostPct: number
): number {
  if (targetFoodCostPct === 0) return 0
  const totalVariableCost = foodCost + packagingCost
  return totalVariableCost / (targetFoodCostPct / 100)
}

/**
 * Price Impact of Ingredient Change
 * How much recipe cost changes when ingredient price changes.
 */
export function calculatePriceImpactOfIngredientChange(
  oldIngredientCost: number,
  newIngredientCost: number,
  ingredientQuantityInRecipe: number,
  yieldPct: number
): number {
  const effectiveQty = yieldPct > 0 ? ingredientQuantityInRecipe / yieldPct : ingredientQuantityInRecipe
  return (newIngredientCost - oldIngredientCost) * effectiveQty
}

/**
 * Full item profitability analysis
 */
export function analyzeItemProfitability(params: {
  sellingPrice: number
  ingredients: RecipeIngredient[]
  packagingItems: Array<{ unitCost: number; quantity: number }>
  channelFeeEstimate?: number
}): {
  foodCost: number
  packagingCost: number
  totalVariableCost: number
  contributionMargin: number
  foodCostPct: number
  grossMarginPct: number
  isProfitable: boolean
} {
  const foodCost = calculateRecipeFoodCost(params.ingredients)
  const packagingCost = calculatePackagingCost(params.packagingItems)
  const channelFeeEstimate = params.channelFeeEstimate ?? 0
  const totalVariableCost = foodCost + packagingCost + channelFeeEstimate
  const contributionMargin = params.sellingPrice - totalVariableCost
  const foodCostPct = calculateFoodCostPercentage(foodCost, params.sellingPrice)
  const grossMarginPct = calculateGrossMarginPercentage(contributionMargin, params.sellingPrice)

  return {
    foodCost,
    packagingCost,
    totalVariableCost,
    contributionMargin,
    foodCostPct,
    grossMarginPct,
    isProfitable: contributionMargin > 0,
  }
}
