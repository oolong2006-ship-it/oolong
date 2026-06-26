import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  calculateRecipeFoodCost,
  calculatePackagingCost,
  calculateItemContributionMargin,
  calculateFoodCostPercentage,
  calculateRecommendedSellingPrice,
  calculatePriceImpactOfIngredientChange,
  analyzeItemProfitability,
} from '../../src/lib/calculations/recipe.ts'

describe('calculateRecipeFoodCost', () => {
  it('calculates cost adjusting for yield percentage', () => {
    const ingredients = [
      { quantity: 0.5, unit: 'kg', unitCost: 20, yieldPct: 0.8, wastePct: 0 },
    ]
    const cost = calculateRecipeFoodCost(ingredients)
    assert.ok(Math.abs(cost - 12.5) < 0.001, `Expected 12.5, got ${cost}`)
  })

  it('handles yieldPct of 1 (no waste)', () => {
    const ingredients = [
      { quantity: 0.5, unit: 'kg', unitCost: 20, yieldPct: 1, wastePct: 0 },
    ]
    assert.equal(calculateRecipeFoodCost(ingredients), 10)
  })

  it('sums multiple ingredients', () => {
    const ingredients = [
      { quantity: 0.3, unit: 'kg', unitCost: 10, yieldPct: 1, wastePct: 0 },
      { quantity: 0.2, unit: 'kg', unitCost: 15, yieldPct: 1, wastePct: 0 },
    ]
    assert.equal(calculateRecipeFoodCost(ingredients), 6)
  })
})

describe('calculatePackagingCost', () => {
  it('sums all packaging item costs', () => {
    const items = [{ unitCost: 2, quantity: 1 }, { unitCost: 0.5, quantity: 2 }]
    assert.equal(calculatePackagingCost(items), 3)
  })
})

describe('calculateItemContributionMargin', () => {
  it('subtracts all variable costs from price', () => {
    assert.equal(calculateItemContributionMargin(45, 12, 2, 4.5), 26.5)
  })
  it('defaults channel fee to 0', () => {
    assert.equal(calculateItemContributionMargin(45, 12, 2), 31)
  })
})

describe('calculateFoodCostPercentage', () => {
  it('calculates correct percentage', () => {
    assert.ok(Math.abs(calculateFoodCostPercentage(12, 45) - 26.667) < 0.001)
  })
  it('returns 0 when selling price is zero', () => {
    assert.equal(calculateFoodCostPercentage(12, 0), 0)
  })
})

describe('calculateRecommendedSellingPrice', () => {
  it('calculates price at target food cost percentage', () => {
    const price = calculateRecommendedSellingPrice(12, 2, 30)
    assert.ok(Math.abs(price - 46.667) < 0.001)
  })
  it('returns 0 when target percentage is zero', () => {
    assert.equal(calculateRecommendedSellingPrice(12, 2, 0), 0)
  })
})

describe('calculatePriceImpactOfIngredientChange', () => {
  it('calculates positive impact for price increase', () => {
    const impact = calculatePriceImpactOfIngredientChange(10, 12, 0.5, 1)
    assert.equal(impact, 1)
  })
  it('accounts for yield percentage', () => {
    const impact = calculatePriceImpactOfIngredientChange(10, 12, 0.5, 0.8)
    assert.ok(Math.abs(impact - 1.25) < 0.001)
  })
})

describe('analyzeItemProfitability', () => {
  it('returns full profitability breakdown', () => {
    const result = analyzeItemProfitability({
      sellingPrice: 45,
      ingredients: [
        { quantity: 0.3, unit: 'kg', unitCost: 20, yieldPct: 1, wastePct: 0 },
        { quantity: 0.1, unit: 'kg', unitCost: 30, yieldPct: 1, wastePct: 0 },
      ],
      packagingItems: [{ unitCost: 2, quantity: 1 }],
    })
    assert.equal(result.foodCost, 9)
    assert.equal(result.packagingCost, 2)
    assert.equal(result.totalVariableCost, 11)
    assert.equal(result.contributionMargin, 34)
    assert.equal(result.isProfitable, true)
  })
})
