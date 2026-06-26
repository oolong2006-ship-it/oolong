/**
 * Waste Calculations
 * Pure functions for waste tracking and analysis.
 * Formula reference: docs/calculation-formulas.md
 */

export type WasteReason =
  | 'EXPIRED'
  | 'SPOILED'
  | 'OVERPRODUCTION'
  | 'WRONG_PREPARATION'
  | 'CUSTOMER_RETURN'
  | 'DELIVERY_DAMAGE'
  | 'RECEIVING_REJECTION'
  | 'STORAGE_ISSUE'
  | 'PORTIONING_ISSUE'
  | 'OTHER'

// Reasons that are preventable with better operations
export const PREVENTABLE_REASONS: WasteReason[] = [
  'OVERPRODUCTION',
  'WRONG_PREPARATION',
  'PORTIONING_ISSUE',
  'STORAGE_ISSUE',
]

/**
 * Waste Value = Quantity * Unit Cost
 */
export function calculateWasteValue(quantity: number, unitCost: number): number {
  return quantity * unitCost
}

/**
 * Waste % = Total Waste Value / Net Sales * 100
 * Returns 0 if totalSalesValue is 0. Alert if > 3%.
 */
export function calculateWastePercentage(wasteValue: number, totalSalesValue: number): number {
  if (totalSalesValue === 0) return 0
  return (wasteValue / totalSalesValue) * 100
}

/**
 * Preventable Waste = Sum of waste cost where isPreventable = true
 */
export function calculatePreventableWaste(
  wasteRecords: Array<{
    totalCost: number
    isPreventable: boolean
  }>
): number {
  return wasteRecords
    .filter((r) => r.isPreventable)
    .reduce((sum, r) => sum + r.totalCost, 0)
}

/**
 * Waste by Reason = group waste cost by reason code
 */
export function calculateWasteByReason(
  wasteRecords: Array<{
    wasteReason: string
    totalCost: number
  }>
): Record<string, number> {
  return wasteRecords.reduce(
    (acc, record) => {
      const current = acc[record.wasteReason] ?? 0
      return { ...acc, [record.wasteReason]: current + record.totalCost }
    },
    {} as Record<string, number>
  )
}

/**
 * Top wasted items by value
 */
export function getTopWastedItems(
  wasteRecords: Array<{
    itemName: string
    totalCost: number
  }>,
  topN = 10
): Array<{ itemName: string; totalCost: number; rank: number }> {
  const byItem: Record<string, number> = {}
  for (const r of wasteRecords) {
    byItem[r.itemName] = (byItem[r.itemName] ?? 0) + r.totalCost
  }

  return Object.entries(byItem)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([itemName, totalCost], i) => ({ itemName, totalCost, rank: i + 1 }))
}

/**
 * Waste trend: group by period (day/week/month)
 */
export function groupWasteByPeriod(
  wasteRecords: Array<{
    recordDate: Date
    totalCost: number
  }>,
  period: 'day' | 'week' | 'month' = 'day'
): Array<{ period: string; totalCost: number }> {
  const groups: Record<string, number> = {}

  for (const r of wasteRecords) {
    let key: string
    const d = new Date(r.recordDate)
    if (period === 'day') {
      key = d.toISOString().slice(0, 10)
    } else if (period === 'week') {
      const startOfWeek = new Date(d)
      startOfWeek.setDate(d.getDate() - d.getDay())
      key = startOfWeek.toISOString().slice(0, 10)
    } else {
      key = d.toISOString().slice(0, 7)
    }
    groups[key] = (groups[key] ?? 0) + r.totalCost
  }

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([p, totalCost]) => ({ period: p, totalCost }))
}
