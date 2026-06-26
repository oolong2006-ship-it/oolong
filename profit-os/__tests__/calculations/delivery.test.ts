import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  calculateNetAfterPlatformFees,
  calculatePlatformContributionMargin,
  calculateProfitPerOrder,
  calculatePlatformMarginPercentage,
  calculateEffectiveCommissionRate,
  analyzeDeliveryProfitability,
} from '../../src/lib/calculations/delivery.ts'

describe('calculateNetAfterPlatformFees', () => {
  it('deducts all fee types from gross sales', () => {
    const result = calculateNetAfterPlatformFees({
      grossSales: 10000,
      discounts: 500,
      platformCommission: 1500,
      promotionCost: 200,
      bankFees: 100,
      deliveryFees: 0,
      marketingFees: 200,
      vatOnFees: 300,
    })
    assert.equal(result, 7200)
  })
})

describe('calculatePlatformContributionMargin', () => {
  it('subtracts food and packaging from net after fees', () => {
    assert.equal(calculatePlatformContributionMargin(7200, 3000, 200), 4000)
  })
})

describe('calculateProfitPerOrder', () => {
  it('divides contribution by order count', () => {
    assert.equal(calculateProfitPerOrder(4000, 100), 40)
  })
  it('returns 0 when order count is zero', () => {
    assert.equal(calculateProfitPerOrder(4000, 0), 0)
  })
})

describe('calculatePlatformMarginPercentage', () => {
  it('calculates correct margin percentage', () => {
    assert.equal(calculatePlatformMarginPercentage(4000, 10000), 40)
  })
  it('returns 0 when gross sales is zero', () => {
    assert.equal(calculatePlatformMarginPercentage(4000, 0), 0)
  })
})

describe('calculateEffectiveCommissionRate', () => {
  it('sums all fees and divides by gross sales', () => {
    const rate = calculateEffectiveCommissionRate(1500, 200, 100, 200, 10000)
    assert.equal(rate, 20)
  })
  it('returns 0 when gross sales is zero', () => {
    assert.equal(calculateEffectiveCommissionRate(1500, 200, 100, 200, 0), 0)
  })
})

describe('analyzeDeliveryProfitability', () => {
  it('correctly classifies a profitable settlement', () => {
    const result = analyzeDeliveryProfitability({
      grossSales: 10000,
      discounts: 500,
      platformCommission: 1500,
      promotionCost: 200,
      bankFees: 100,
      deliveryFees: 0,
      marketingFees: 200,
      vatOnFees: 300,
      orderCount: 100,
      estimatedFoodCost: 3000,
      packagingCost: 200,
    })
    assert.equal(result.isProfitable, true)
    assert.equal(result.isLossMaking, false)
    assert.equal(result.contributionMargin, 4000)
    assert.equal(result.profitPerOrder, 40)
  })

  it('correctly classifies a loss-making settlement', () => {
    const result = analyzeDeliveryProfitability({
      grossSales: 1000,
      discounts: 100,
      platformCommission: 300,
      promotionCost: 200,
      bankFees: 50,
      deliveryFees: 100,
      marketingFees: 100,
      vatOnFees: 100,
      orderCount: 10,
      estimatedFoodCost: 500,
      packagingCost: 100,
    })
    assert.equal(result.isLossMaking, true)
    assert.equal(result.isProfitable, false)
  })
})
