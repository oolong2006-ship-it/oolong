/**
 * Supplier Scorecard Calculations
 * Pure functions for evaluating supplier performance.
 * Formula reference: docs/calculation-formulas.md
 */

export interface SupplierScoreWeights {
  price: number
  quality: number
  delivery: number
  contractCompliance: number
  invoiceAccuracy: number
  responsiveness: number
}

export const DEFAULT_WEIGHTS: SupplierScoreWeights = {
  price: 0.25,
  quality: 0.25,
  delivery: 0.20,
  contractCompliance: 0.15,
  invoiceAccuracy: 0.10,
  responsiveness: 0.05,
}

export interface SupplierScoreComponents {
  priceScore: number
  qualityScore: number
  deliveryScore: number
  contractComplianceScore: number
  invoiceAccuracyScore: number
  responsivenessScore: number
}

/**
 * Overall Score = Weighted sum of component scores (all 0-100).
 */
export function calculateSupplierScore(
  scores: SupplierScoreComponents,
  weights: SupplierScoreWeights = DEFAULT_WEIGHTS
): number {
  return (
    scores.priceScore * weights.price +
    scores.qualityScore * weights.quality +
    scores.deliveryScore * weights.delivery +
    scores.contractComplianceScore * weights.contractCompliance +
    scores.invoiceAccuracyScore * weights.invoiceAccuracy +
    scores.responsivenessScore * weights.responsiveness
  )
}

/**
 * Price Score = max(0, 100 - (Avg Price Variance % / Max Variance %) * 100)
 * Perfect = 100, increases penalty as price exceeds contract.
 * maxVariancePct default = 20 (20% over contract = 0 score).
 */
export function calculatePriceScore(
  avgPriceVariancePct: number,
  maxVariancePct = 20
): number {
  if (avgPriceVariancePct <= 0) return 100
  return Math.max(0, 100 - (avgPriceVariancePct / maxVariancePct) * 100)
}

/**
 * Quality Score = Accepted Deliveries / Total Deliveries * 100
 * Returns 100 if no deliveries.
 */
export function calculateQualityScore(
  acceptedDeliveries: number,
  totalDeliveries: number
): number {
  if (totalDeliveries === 0) return 100
  return (acceptedDeliveries / totalDeliveries) * 100
}

/**
 * Delivery Score = On-Time Deliveries / Total Deliveries * 100
 * Returns 100 if no deliveries.
 */
export function calculateDeliveryScore(
  onTimeDeliveries: number,
  totalDeliveries: number
): number {
  if (totalDeliveries === 0) return 100
  return (onTimeDeliveries / totalDeliveries) * 100
}

/**
 * Invoice Accuracy Score = Accurate Invoices / Total Invoices * 100
 * Returns 100 if no invoices.
 */
export function calculateInvoiceAccuracyScore(
  accurateInvoices: number,
  totalInvoices: number
): number {
  if (totalInvoices === 0) return 100
  return (accurateInvoices / totalInvoices) * 100
}

/**
 * Contract Compliance Score = Compliant Line Items / Total Line Items * 100
 */
export function calculateContractComplianceScore(
  compliantItems: number,
  totalItems: number
): number {
  if (totalItems === 0) return 100
  return (compliantItems / totalItems) * 100
}

/**
 * Determine supplier rating label from overall score.
 */
export function getSupplierRating(score: number): {
  rating: string
  ratingAr: string
  color: string
} {
  if (score >= 90) return { rating: 'Excellent', ratingAr: 'ممتاز', color: '#22c55e' }
  if (score >= 75) return { rating: 'Good', ratingAr: 'جيد', color: '#84cc16' }
  if (score >= 60) return { rating: 'Average', ratingAr: 'متوسط', color: '#f59e0b' }
  if (score >= 40) return { rating: 'Below Average', ratingAr: 'دون المتوسط', color: '#f97316' }
  return { rating: 'Poor', ratingAr: 'ضعيف', color: '#ef4444' }
}
