/**
 * Recommendation Generation Rules
 * Rule-based system for generating actionable recommendations.
 * NOTE: These are rule-based calculations, NOT AI-generated numbers.
 */

import type { UserRole } from '@prisma/client'

export interface GeneratedRecommendation {
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  module: string
  estimatedImpact?: number
  impactUnit?: string
  confidence: number
  priority: number
  ownerRole: UserRole
  actionType: string
  entityType?: string
  entityId?: string
}

/**
 * Generate delivery platform recommendations based on margin thresholds.
 */
export function generateDeliveryRecommendations(data: {
  platformName: string
  platformId: string
  marginPct: number
  targetMarginPct: number
  promotionLoss: number
  branchName: string
  branchId: string
}): GeneratedRecommendation[] {
  const recommendations: GeneratedRecommendation[] = []

  if (data.marginPct < data.targetMarginPct) {
    const gap = data.targetMarginPct - data.marginPct
    recommendations.push({
      title: `Review delivery pricing for ${data.platformName}`,
      titleAr: `مراجعة تسعير التوصيل لـ ${data.platformName}`,
      description: `Platform margin is ${data.marginPct.toFixed(1)}% vs target ${data.targetMarginPct.toFixed(1)}%. Consider increasing prices by ${gap.toFixed(1)}% or renegotiating commission rate.`,
      descriptionAr: `هامش المنصة ${data.marginPct.toFixed(1)}% مقابل الهدف ${data.targetMarginPct.toFixed(1)}%. يُنصح برفع الأسعار بنسبة ${gap.toFixed(1)}% أو إعادة التفاوض على العمولة.`,
      module: 'delivery',
      estimatedImpact: gap,
      impactUnit: 'margin_pct_points',
      confidence: 0.85,
      priority: 8,
      ownerRole: 'OPERATIONS_MANAGER',
      actionType: 'review_pricing',
      entityType: 'delivery_platform',
      entityId: data.platformId,
    })
  }

  if (data.promotionLoss > 0) {
    recommendations.push({
      title: `Stop loss-making promotion on ${data.platformName}`,
      titleAr: `إيقاف العرض الخاسر على ${data.platformName}`,
      description: `Current promotion is generating a loss of ${data.promotionLoss.toFixed(2)} SAR. Stop or redesign the promotion immediately.`,
      descriptionAr: `العرض الحالي يولد خسارة ${data.promotionLoss.toFixed(2)} ر.س. يُنصح بإيقاف العرض فوراً أو إعادة تصميمه.`,
      module: 'delivery',
      estimatedImpact: data.promotionLoss,
      impactUnit: 'SAR',
      confidence: 0.9,
      priority: 9,
      ownerRole: 'OPERATIONS_MANAGER',
      actionType: 'stop_promotion',
      entityType: 'delivery_platform',
      entityId: data.platformId,
    })
  }

  return recommendations
}

/**
 * Generate procurement recommendations based on price variances.
 */
export function generateProcurementRecommendations(data: {
  supplierId: string
  supplierName: string
  priceVariancePct: number
  potentialSaving: number
  itemName: string
  alternativeSupplierName?: string
}): GeneratedRecommendation[] {
  const recommendations: GeneratedRecommendation[] = []

  if (data.priceVariancePct > 5) {
    recommendations.push({
      title: `Renegotiate price for ${data.itemName}`,
      titleAr: `إعادة التفاوض على سعر ${data.itemName}`,
      description: `${data.supplierName} is charging ${data.priceVariancePct.toFixed(1)}% above contract price. Potential saving: ${data.potentialSaving.toFixed(2)} SAR.`,
      descriptionAr: `مورد "${data.supplierName}" يتقاضى ${data.priceVariancePct.toFixed(1)}% فوق سعر العقد. الوفورات المحتملة: ${data.potentialSaving.toFixed(2)} ر.س.`,
      module: 'procurement',
      estimatedImpact: data.potentialSaving,
      impactUnit: 'SAR',
      confidence: 0.9,
      priority: 8,
      ownerRole: 'PROCUREMENT_MANAGER',
      actionType: 'renegotiate_price',
      entityType: 'supplier',
      entityId: data.supplierId,
    })
  }

  if (data.alternativeSupplierName && data.priceVariancePct > 10) {
    recommendations.push({
      title: `Switch ${data.itemName} to ${data.alternativeSupplierName}`,
      titleAr: `تحويل ${data.itemName} إلى ${data.alternativeSupplierName}`,
      description: `Consider switching to ${data.alternativeSupplierName} for better pricing on ${data.itemName}.`,
      descriptionAr: `فكِّر في التحول إلى ${data.alternativeSupplierName} للحصول على سعر أفضل لـ ${data.itemName}.`,
      module: 'procurement',
      estimatedImpact: data.potentialSaving * 0.8,
      impactUnit: 'SAR',
      confidence: 0.7,
      priority: 7,
      ownerRole: 'PROCUREMENT_MANAGER',
      actionType: 'switch_supplier',
      entityType: 'supplier',
      entityId: data.supplierId,
    })
  }

  return recommendations
}

/**
 * Generate waste reduction recommendations.
 */
export function generateWasteRecommendations(data: {
  branchId: string
  branchName: string
  wastePct: number
  targetWastePct: number
  topWasteReason: string
  topWastedItem: string
  preventableWasteValue: number
}): GeneratedRecommendation[] {
  const recommendations: GeneratedRecommendation[] = []

  if (data.wastePct > data.targetWastePct) {
    recommendations.push({
      title: `Reduce waste at ${data.branchName}`,
      titleAr: `تقليل الهدر في فرع ${data.branchName}`,
      description: `Waste is ${data.wastePct.toFixed(1)}% vs target ${data.targetWastePct.toFixed(1)}%. Main reason: ${data.topWasteReason}. Focus on ${data.topWastedItem}.`,
      descriptionAr: `نسبة الهدر ${data.wastePct.toFixed(1)}% مقابل الهدف ${data.targetWastePct.toFixed(1)}%. السبب الرئيسي: ${data.topWasteReason}. ركِّز على ${data.topWastedItem}.`,
      module: 'waste',
      estimatedImpact: data.preventableWasteValue,
      impactUnit: 'SAR',
      confidence: 0.8,
      priority: 7,
      ownerRole: 'BRANCH_MANAGER',
      actionType: 'reduce_waste',
      entityType: 'branch',
      entityId: data.branchId,
    })
  }

  return recommendations
}

/**
 * Generate menu engineering recommendations.
 */
export function generateMenuRecommendations(data: {
  itemId: string
  itemName: string
  classification: 'STAR' | 'PLOWHORSE' | 'PUZZLE' | 'DOG'
  contributionMargin: number
  foodCostPct: number
  targetFoodCostPct: number
}): GeneratedRecommendation[] {
  const recommendations: GeneratedRecommendation[] = []

  if (data.classification === 'DOG') {
    recommendations.push({
      title: `Consider removing "${data.itemName}" from menu`,
      titleAr: `النظر في إزالة "${data.itemName}" من القائمة`,
      description: `"${data.itemName}" has low popularity and low profit margin. Consider removal or complete redesign.`,
      descriptionAr: `"${data.itemName}" ذو شعبية منخفضة وهامش ربح ضعيف. فكِّر في الحذف أو إعادة التصميم الكامل.`,
      module: 'menu',
      estimatedImpact: Math.abs(data.contributionMargin),
      impactUnit: 'SAR_per_sale',
      confidence: 0.75,
      priority: 6,
      ownerRole: 'OPERATIONS_MANAGER',
      actionType: 'remove_menu_item',
      entityType: 'menu_item',
      entityId: data.itemId,
    })
  }

  if (data.classification === 'PLOWHORSE' && data.foodCostPct > data.targetFoodCostPct + 5) {
    recommendations.push({
      title: `Reduce food cost for "${data.itemName}"`,
      titleAr: `خفض تكلفة الغذاء لـ "${data.itemName}"`,
      description: `"${data.itemName}" food cost is ${data.foodCostPct.toFixed(1)}% vs target ${data.targetFoodCostPct.toFixed(1)}%. Review recipe or sourcing.`,
      descriptionAr: `تكلفة غذاء "${data.itemName}" هي ${data.foodCostPct.toFixed(1)}% مقابل الهدف ${data.targetFoodCostPct.toFixed(1)}%. راجع الوصفة أو مصادر الشراء.`,
      module: 'menu',
      estimatedImpact: data.foodCostPct - data.targetFoodCostPct,
      impactUnit: 'food_cost_pct_points',
      confidence: 0.8,
      priority: 7,
      ownerRole: 'OPERATIONS_MANAGER',
      actionType: 'reduce_food_cost',
      entityType: 'menu_item',
      entityId: data.itemId,
    })
  }

  return recommendations
}
