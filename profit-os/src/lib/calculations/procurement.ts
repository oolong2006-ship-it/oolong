/**
 * Procurement Calculations
 * Pure functions for purchase cost analysis.
 * Formula reference: docs/calculation-formulas.md
 */

/**
 * Price Variance = Actual Price - Contract Price
 * Positive = overpaid, Negative = favorable
 */
export function calculatePriceVariance(
  actualUnitPrice: number,
  contractUnitPrice: number
): number {
  return actualUnitPrice - contractUnitPrice
}

/**
 * Price Variance % = (Actual - Contract) / Contract * 100
 * Returns 0 if contractUnitPrice is 0.
 */
export function calculatePriceVariancePercentage(
  actualUnitPrice: number,
  contractUnitPrice: number
): number {
  if (contractUnitPrice === 0) return 0
  return ((actualUnitPrice - contractUnitPrice) / contractUnitPrice) * 100
}

/**
 * Potential Saving = Quantity * (Actual Price - Best Available Price)
 * Positive = potential saving exists, Negative = already at best price
 */
export function calculatePotentialSaving(
  actualQuantity: number,
  actualUnitPrice: number,
  bestAvailableUnitPrice: number
): number {
  return actualQuantity * (actualUnitPrice - bestAvailableUnitPrice)
}

/**
 * Supplier Dependency % = Supplier Spend / Total Spend * 100
 * Alert if > 40%.
 */
export function calculateSupplierDependency(
  supplierPurchaseValue: number,
  totalPurchaseValue: number
): number {
  if (totalPurchaseValue === 0) return 0
  return (supplierPurchaseValue / totalPurchaseValue) * 100
}

/**
 * Contract Compliance Rate = Compliant Invoices / Total Invoices * 100
 * Returns 100 if no invoices.
 */
export function calculateContractComplianceRate(
  compliantInvoices: number,
  totalInvoices: number
): number {
  if (totalInvoices === 0) return 100
  return (compliantInvoices / totalInvoices) * 100
}

/**
 * Detect if a new invoice is a potential duplicate.
 * Same supplier + same invoice number + same total = duplicate.
 */
export function detectDuplicateInvoice(
  existingInvoices: Array<{
    supplierId: string
    invoiceNumber: string
    total: number
  }>,
  newInvoice: {
    supplierId: string
    invoiceNumber: string
    total: number
  }
): boolean {
  return existingInvoices.some(
    (inv) =>
      inv.supplierId === newInvoice.supplierId &&
      inv.invoiceNumber === newInvoice.invoiceNumber &&
      Math.abs(inv.total - newInvoice.total) < 0.01
  )
}

/**
 * Budget Variance = Actual Spend - Budget Amount
 * Positive = over budget, Negative = under budget.
 */
export function calculatePurchaseBudgetVariance(
  actualSpend: number,
  budgetAmount: number
): { variance: number; variancePct: number; isOverBudget: boolean } {
  const variance = actualSpend - budgetAmount
  const variancePct = budgetAmount === 0 ? 0 : (variance / budgetAmount) * 100
  return {
    variance,
    variancePct,
    isOverBudget: variance > 0,
  }
}

/**
 * Spend Pareto: identify top suppliers by spend (80/20 rule).
 */
export function calculateSpendPareto(
  supplierSpends: Array<{ supplierId: string; name: string; totalSpend: number }>
): Array<{ supplierId: string; name: string; totalSpend: number; spendPct: number; cumulativePct: number }> {
  const totalSpend = supplierSpends.reduce((sum, s) => sum + s.totalSpend, 0)
  const sorted = [...supplierSpends].sort((a, b) => b.totalSpend - a.totalSpend)

  let cumulative = 0
  return sorted.map((s) => {
    const spendPct = totalSpend === 0 ? 0 : (s.totalSpend / totalSpend) * 100
    cumulative += spendPct
    return { ...s, spendPct, cumulativePct: cumulative }
  })
}
