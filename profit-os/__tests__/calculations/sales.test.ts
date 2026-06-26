import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  calculateNetSales,
  calculateAverageOrderValue,
  calculateSalesGrowth,
  calculateGrossSales,
  calculateSalesMix,
  calculateSalesContribution,
  aggregateSalesRecords,
} from '../../src/lib/calculations/sales.ts'

describe('calculateNetSales', () => {
  it('subtracts discounts from gross sales', () => {
    assert.equal(calculateNetSales(1000, 100), 900)
  })
  it('returns gross when discounts are zero', () => {
    assert.equal(calculateNetSales(500, 0), 500)
  })
})

describe('calculateAverageOrderValue', () => {
  it('divides net sales by order count', () => {
    assert.equal(calculateAverageOrderValue(900, 9), 100)
  })
  it('returns 0 when order count is zero', () => {
    assert.equal(calculateAverageOrderValue(900, 0), 0)
  })
})

describe('calculateSalesGrowth', () => {
  it('calculates positive growth', () => {
    assert.equal(calculateSalesGrowth(1100, 1000), 10)
  })
  it('calculates negative growth', () => {
    assert.equal(calculateSalesGrowth(900, 1000), -10)
  })
  it('returns 0 when previous period is zero', () => {
    assert.equal(calculateSalesGrowth(500, 0), 0)
  })
})

describe('calculateGrossSales', () => {
  it('sums quantity * unitPrice for all items', () => {
    const items = [
      { quantity: 2, unitPrice: 50 },
      { quantity: 3, unitPrice: 100 },
    ]
    assert.equal(calculateGrossSales(items), 400)
  })
  it('returns 0 for empty array', () => {
    assert.equal(calculateGrossSales([]), 0)
  })
})

describe('calculateSalesMix', () => {
  it('calculates correct mix percentage', () => {
    assert.equal(calculateSalesMix(200, 1000), 20)
  })
  it('returns 0 when total sales is zero', () => {
    assert.equal(calculateSalesMix(200, 0), 0)
  })
})

describe('calculateSalesContribution', () => {
  it('subtracts food and packaging cost from net sales', () => {
    assert.equal(calculateSalesContribution(1000, 300, 50), 650)
  })
})

describe('aggregateSalesRecords', () => {
  it('aggregates multiple records correctly', () => {
    const records = [
      { grossSales: 1000, discounts: 100, netSales: 900, orderCount: 10, vatAmount: 135 },
      { grossSales: 2000, discounts: 200, netSales: 1800, orderCount: 20, vatAmount: 270 },
    ]
    const result = aggregateSalesRecords(records)
    assert.equal(result.totalGrossSales, 3000)
    assert.equal(result.totalDiscounts, 300)
    assert.equal(result.totalNetSales, 2700)
    assert.equal(result.totalOrders, 30)
    assert.equal(result.totalVat, 405)
    assert.equal(result.averageOrderValue, 90)
  })
  it('returns zeros for empty records', () => {
    const result = aggregateSalesRecords([])
    assert.equal(result.totalGrossSales, 0)
    assert.equal(result.averageOrderValue, 0)
  })
})
