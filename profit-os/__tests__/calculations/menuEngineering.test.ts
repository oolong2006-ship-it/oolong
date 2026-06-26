import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  calculateSalesMixPct,
  calculatePopularityScore,
  calculateProfitabilityScore,
  classifyMenuItem,
  engineerMenu,
} from '../../src/lib/calculations/menuEngineering.ts'

describe('calculateSalesMixPct', () => {
  it('calculates correct percentage', () => {
    assert.equal(calculateSalesMixPct(30, 100), 30)
  })
  it('returns 0 when total is zero', () => {
    assert.equal(calculateSalesMixPct(30, 0), 0)
  })
})

describe('calculatePopularityScore', () => {
  it('returns >= 1 for a popular item in a 4-item menu', () => {
    // With 4 items, expected = (1/4)*100*0.7 = 17.5%
    // If item has 25% of sales: score = 25/17.5 = 1.43
    const score = calculatePopularityScore(25, 100, 4)
    assert.ok(score >= 1, `Expected score >= 1, got ${score}`)
  })
  it('returns 0 when total sales quantity is zero', () => {
    assert.equal(calculatePopularityScore(10, 0, 4), 0)
  })
  it('returns < 1 for unpopular item', () => {
    // With 4 items, expected = 17.5%. If item has 5% of sales: score = 5/17.5 = 0.28
    const score = calculatePopularityScore(5, 100, 4)
    assert.ok(score < 1, `Expected score < 1, got ${score}`)
  })
})

describe('calculateProfitabilityScore', () => {
  it('returns 1 when item CM equals average CM', () => {
    assert.equal(calculateProfitabilityScore(10, 10), 1)
  })
  it('returns 0 when average CM is zero', () => {
    assert.equal(calculateProfitabilityScore(10, 0), 0)
  })
  it('returns > 1 for high profit item', () => {
    assert.ok(calculateProfitabilityScore(15, 10) > 1)
  })
})

describe('classifyMenuItem', () => {
  it('classifies STAR (popular + profitable)', () => {
    assert.equal(classifyMenuItem(1.5, 1.5), 'STAR')
  })
  it('classifies PLOWHORSE (popular + low profit)', () => {
    assert.equal(classifyMenuItem(1.5, 0.5), 'PLOWHORSE')
  })
  it('classifies PUZZLE (unpopular + profitable)', () => {
    assert.equal(classifyMenuItem(0.5, 1.5), 'PUZZLE')
  })
  it('classifies DOG (unpopular + low profit)', () => {
    assert.equal(classifyMenuItem(0.5, 0.5), 'DOG')
  })
  it('classifies as STAR at boundary (score == 1)', () => {
    assert.equal(classifyMenuItem(1, 1), 'STAR')
  })
})

describe('engineerMenu', () => {
  it('returns empty array for empty input', () => {
    assert.deepEqual(engineerMenu([]), [])
  })

  it('classifies menu items correctly', () => {
    const items = [
      { id: '1', name: 'Burger', salesQuantity: 100, contributionMargin: 20 },
      { id: '2', name: 'Pizza', salesQuantity: 50, contributionMargin: 25 },
      { id: '3', name: 'Salad', salesQuantity: 10, contributionMargin: 15 },
      { id: '4', name: 'Fries', salesQuantity: 40, contributionMargin: 8 },
    ]
    const result = engineerMenu(items)

    assert.equal(result.length, 4)
    result.forEach((item) => {
      assert.ok(['STAR', 'PLOWHORSE', 'PUZZLE', 'DOG'].includes(item.classification))
      assert.ok(typeof item.salesMixPct === 'number')
      assert.ok(typeof item.popularityScore === 'number')
    })
  })

  it('sets correct totalQuantity and avgContributionMargin on all items', () => {
    const items = [
      { id: '1', name: 'A', salesQuantity: 60, contributionMargin: 10 },
      { id: '2', name: 'B', salesQuantity: 40, contributionMargin: 20 },
    ]
    const result = engineerMenu(items)
    result.forEach((item) => {
      assert.equal(item.totalQuantity, 100)
      assert.equal(item.avgContributionMargin, 15)
    })
  })
})
