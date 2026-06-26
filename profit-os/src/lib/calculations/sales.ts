/**
 * Sales Calculations
 * Pure functions for sales data analysis.
 * Formula reference: docs/calculation-formulas.md
 */

export interface SalesData {
  grossSales: number
  discounts: number
  vatAmount: number
  orderCount: number
}

/**
 * Net Sales = Gross Sales - Discounts
 */
export function calculateNetSales(grossSales: number, discounts: number): number {
  return grossSales - discounts
}

/**
 * AOV = Net Sales / Order Count
 * Returns 0 if orderCount is 0.
 */
export function calculateAverageOrderValue(netSales: number, orderCount: number): number {
  if (orderCount === 0) return 0
  return netSales / orderCount
}

/**
 * Growth % = ((Current - Previous) / Previous) * 100
 * Returns 0 if previousPeriodSales is 0.
 */
export function calculateSalesGrowth(currentPeriodSales: number, previousPeriodSales: number): number {
  if (previousPeriodSales === 0) return 0
  return ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100
}

/**
 * Gross Sales = Sum of (quantity * unitPrice) for each item
 */
export function calculateGrossSales(items: Array<{ quantity: number; unitPrice: number }>): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

/**
 * Sales Mix % = (Item Sales / Total Sales) * 100
 * Returns 0 if totalSales is 0.
 */
export function calculateSalesMix(itemSales: number, totalSales: number): number {
  if (totalSales === 0) return 0
  return (itemSales / totalSales) * 100
}

/**
 * Sales Contribution = Net Sales - Food Cost - Packaging Cost
 */
export function calculateSalesContribution(
  netSales: number,
  foodCost: number,
  packagingCost: number
): number {
  return netSales - foodCost - packagingCost
}

/**
 * Aggregate sales summary from multiple records
 */
export function aggregateSalesRecords(
  records: Array<{
    grossSales: number
    discounts: number
    netSales: number
    orderCount: number
    vatAmount: number
  }>
): {
  totalGrossSales: number
  totalDiscounts: number
  totalNetSales: number
  totalOrders: number
  totalVat: number
  averageOrderValue: number
} {
  const totals = records.reduce(
    (acc, r) => ({
      totalGrossSales: acc.totalGrossSales + r.grossSales,
      totalDiscounts: acc.totalDiscounts + r.discounts,
      totalNetSales: acc.totalNetSales + r.netSales,
      totalOrders: acc.totalOrders + r.orderCount,
      totalVat: acc.totalVat + r.vatAmount,
    }),
    { totalGrossSales: 0, totalDiscounts: 0, totalNetSales: 0, totalOrders: 0, totalVat: 0 }
  )

  return {
    ...totals,
    averageOrderValue: calculateAverageOrderValue(totals.totalNetSales, totals.totalOrders),
  }
}
