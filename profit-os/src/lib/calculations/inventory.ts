/**
 * Inventory Calculations
 * Pure functions for stock control and consumption analysis.
 * Formula reference: docs/calculation-formulas.md
 */

/**
 * Actual Consumption = Opening + Purchases + Transfers In - Transfers Out - Waste - Closing
 */
export function calculateActualConsumption(
  openingStock: number,
  purchases: number,
  transfersIn: number,
  transfersOut: number,
  waste: number,
  closingStock: number
): number {
  return openingStock + purchases + transfersIn - transfersOut - waste - closingStock
}

/**
 * Ideal Consumption = Sum of (sold_qty * recipe_ingredient_qty_per_portion)
 */
export function calculateIdealConsumption(
  soldItems: Array<{ quantity: number; recipeIngredientQuantity: number }>
): number {
  return soldItems.reduce((sum, item) => sum + item.quantity * item.recipeIngredientQuantity, 0)
}

/**
 * Consumption Variance = Actual - Ideal
 * Positive = more consumed than expected (waste, theft, over-portioning)
 */
export function calculateConsumptionVariance(
  actualConsumption: number,
  idealConsumption: number
): number {
  return actualConsumption - idealConsumption
}

/**
 * Consumption Variance % = Variance / Ideal * 100
 * Returns 0 if idealConsumption is 0. Alert if > 5%.
 */
export function calculateConsumptionVariancePct(
  actualConsumption: number,
  idealConsumption: number
): number {
  if (idealConsumption === 0) return 0
  return ((actualConsumption - idealConsumption) / idealConsumption) * 100
}

/**
 * Days of Stock = Current Stock / Average Daily Usage
 * Returns 0 if averageDailyUsage is 0.
 */
export function calculateDaysOfStock(currentStock: number, averageDailyUsage: number): number {
  if (averageDailyUsage === 0) return 0
  return currentStock / averageDailyUsage
}

/**
 * Stock Turnover Rate = COGS / Average Inventory Value
 * Returns 0 if averageInventoryValue is 0.
 */
export function calculateStockTurnover(
  costOfGoodsSold: number,
  averageInventoryValue: number
): number {
  if (averageInventoryValue === 0) return 0
  return costOfGoodsSold / averageInventoryValue
}

/**
 * Weighted Average Cost = (Existing Qty * Existing Cost + New Qty * New Cost) / Total Qty
 * Returns 0 if total quantity is 0.
 */
export function calculateWeightedAverageCost(
  existingQuantity: number,
  existingCost: number,
  newQuantity: number,
  newCost: number
): number {
  const totalQuantity = existingQuantity + newQuantity
  if (totalQuantity === 0) return 0
  return (existingQuantity * existingCost + newQuantity * newCost) / totalQuantity
}

/**
 * Identify items where Days of Stock > threshold (slow-moving).
 */
export function identifySlowMovingItems(
  items: Array<{
    id: string
    name: string
    daysOfStock: number
    threshold: number
  }>
): Array<{ id: string; name: string; daysOfStock: number }> {
  return items.filter((item) => item.daysOfStock > item.threshold)
}

/**
 * Identify items below reorder point.
 */
export function identifyReorderItems(
  items: Array<{
    id: string
    name: string
    currentStock: number
    reorderPoint: number
  }>
): Array<{ id: string; name: string; currentStock: number; reorderPoint: number }> {
  return items.filter((item) => item.currentStock <= item.reorderPoint)
}
