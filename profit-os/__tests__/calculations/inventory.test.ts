import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  calculateActualConsumption,
  calculateIdealConsumption,
  calculateConsumptionVariance,
  calculateConsumptionVariancePct,
  calculateDaysOfStock,
  calculateStockTurnover,
  calculateWeightedAverageCost,
  identifySlowMovingItems,
  identifyReorderItems,
} from '../../src/lib/calculations/inventory.ts'

describe('calculateActualConsumption', () => {
  it('calculates using standard formula', () => {
    // opening(100) + purchases(200) + transfersIn(50) - transfersOut(20) - waste(10) - closing(80)
    assert.equal(calculateActualConsumption(100, 200, 50, 20, 10, 80), 240)
  })
})

describe('calculateIdealConsumption', () => {
  it('sums sold qty * recipe qty for each item', () => {
    const items = [
      { quantity: 50, recipeIngredientQuantity: 0.2 },
      { quantity: 30, recipeIngredientQuantity: 0.1 },
    ]
    assert.equal(calculateIdealConsumption(items), 13)
  })
})

describe('calculateConsumptionVariance', () => {
  it('returns positive variance when actual > ideal', () => {
    assert.equal(calculateConsumptionVariance(15, 13), 2)
  })
  it('returns negative variance when actual < ideal', () => {
    assert.equal(calculateConsumptionVariance(10, 13), -3)
  })
})

describe('calculateConsumptionVariancePct', () => {
  it('calculates correct percentage', () => {
    const pct = calculateConsumptionVariancePct(15, 13)
    assert.ok(Math.abs(pct - 15.385) < 0.001)
  })
  it('returns 0 when ideal consumption is zero', () => {
    assert.equal(calculateConsumptionVariancePct(15, 0), 0)
  })
})

describe('calculateDaysOfStock', () => {
  it('divides current stock by daily usage', () => {
    assert.equal(calculateDaysOfStock(100, 5), 20)
  })
  it('returns 0 when daily usage is zero', () => {
    assert.equal(calculateDaysOfStock(100, 0), 0)
  })
})

describe('calculateStockTurnover', () => {
  it('divides COGS by average inventory value', () => {
    assert.equal(calculateStockTurnover(50000, 10000), 5)
  })
  it('returns 0 when average inventory is zero', () => {
    assert.equal(calculateStockTurnover(50000, 0), 0)
  })
})

describe('calculateWeightedAverageCost', () => {
  it('calculates weighted average correctly', () => {
    // (100 * 10 + 50 * 14) / 150 = (1000 + 700) / 150 = 1700/150 = 11.33
    const wac = calculateWeightedAverageCost(100, 10, 50, 14)
    assert.ok(Math.abs(wac - 11.333) < 0.001)
  })
  it('returns 0 when total quantity is zero', () => {
    assert.equal(calculateWeightedAverageCost(0, 10, 0, 14), 0)
  })
})

describe('identifySlowMovingItems', () => {
  it('returns items where days of stock exceed threshold', () => {
    const items = [
      { id: '1', name: 'Rice', daysOfStock: 30, threshold: 14 },
      { id: '2', name: 'Oil', daysOfStock: 10, threshold: 14 },
      { id: '3', name: 'Flour', daysOfStock: 20, threshold: 14 },
    ]
    const result = identifySlowMovingItems(items)
    assert.equal(result.length, 2)
    assert.equal(result[0].id, '1')
    assert.equal(result[1].id, '3')
  })
})

describe('identifyReorderItems', () => {
  it('returns items at or below reorder point', () => {
    const items = [
      { id: '1', name: 'Tomatoes', currentStock: 5, reorderPoint: 10 },
      { id: '2', name: 'Onions', currentStock: 10, reorderPoint: 10 },
      { id: '3', name: 'Garlic', currentStock: 15, reorderPoint: 10 },
    ]
    const result = identifyReorderItems(items)
    assert.equal(result.length, 2)
    assert.equal(result[0].id, '1')
    assert.equal(result[1].id, '2')
  })
})
