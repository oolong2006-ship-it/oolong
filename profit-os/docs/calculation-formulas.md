# Calculation Formulas Reference

All formulas are implemented as pure TypeScript functions in `src/lib/calculations/`.

---

## Sales Calculations (`sales.ts`)

### Net Sales
```
Net Sales = Gross Sales - Discounts
```

### Average Order Value (AOV)
```
AOV = Net Sales / Order Count
```
Returns 0 if Order Count = 0.

### Sales Growth %
```
Growth % = ((Current Period Sales - Previous Period Sales) / Previous Period Sales) × 100
```
Returns 0 if Previous Period Sales = 0.

### Sales Mix %
```
Sales Mix % = (Item Sales / Total Category Sales) × 100
```

### Sales Contribution (before fixed costs)
```
Sales Contribution = Net Sales - Food Cost - Packaging Cost
```

---

## Delivery Platform Calculations (`delivery.ts`)

### Net After Platform Fees
```
Net After Fees = Gross Sales
               - Discounts (funded by restaurant)
               - Platform Commission
               - Promotion Cost
               - Bank/Payment Fees
               - Delivery Fees (if restaurant-funded)
               - Marketing Fees
               - VAT on Fees
```

### Platform Contribution Margin
```
Platform Contribution Margin = Net After Fees - Estimated Food Cost - Packaging Cost
```

### Platform Margin %
```
Platform Margin % = (Platform Contribution Margin / Gross Sales) × 100
```
Returns 0 if Gross Sales = 0.

### Profit per Order
```
Profit per Order = Platform Contribution Margin / Order Count
```
Returns 0 if Order Count = 0.

### Effective Commission Rate %
```
Effective Commission Rate % = (Commission + Promotion Cost + Bank Fees + Marketing Fees) / Gross Sales × 100
```
This is the true cost of the platform vs the nominal commission %.

---

## Procurement Calculations (`procurement.ts`)

### Price Variance
```
Price Variance = Actual Unit Price - Contract Unit Price
```
Positive = restaurant overpaid. Negative = better than contract.

### Price Variance %
```
Price Variance % = (Actual Price - Contract Price) / Contract Price × 100
```

### Potential Saving
```
Potential Saving = Quantity × (Actual Unit Price - Best Available Unit Price)
```

### Supplier Dependency %
```
Supplier Dependency % = (Supplier Purchase Value / Total Purchase Value) × 100
```
Alert threshold: > 40% dependency on single supplier.

### Contract Compliance Rate %
```
Compliance Rate % = (Compliant Invoices / Total Invoices) × 100
```
An invoice is compliant if item prices match contract prices within ±2%.

### Purchase Budget Variance
```
Budget Variance = Actual Spend - Budget Amount
Budget Variance % = Budget Variance / Budget Amount × 100
```
Positive = over budget. Alert if > 5%.

---

## Inventory Calculations (`inventory.ts`)

### Actual Consumption
```
Actual Consumption = Opening Stock + Purchases + Transfers In - Transfers Out - Waste - Closing Stock
```

### Ideal Consumption (Theoretical)
```
Ideal Consumption = Σ (Sold Quantity × Recipe Ingredient Quantity per portion)
```

### Consumption Variance
```
Variance = Actual Consumption - Ideal Consumption
Variance % = Variance / Ideal Consumption × 100
```
Positive variance = more consumed than recipe suggests (waste, theft, portioning error).
Alert if Variance % > 5%.

### Days of Stock
```
Days of Stock = Current Stock Quantity / Average Daily Usage
```
Returns 0 if Average Daily Usage = 0.
Alert if Days of Stock < Reorder Point Days.

### Stock Turnover Rate
```
Turnover Rate = Cost of Goods Sold / Average Inventory Value
```

### Weighted Average Cost (WAC)
```
New WAC = (Existing Quantity × Existing Cost + New Quantity × New Unit Cost) / (Existing + New Quantity)
```
Updated on every purchase receipt.

---

## Recipe & Food Cost Calculations (`recipe.ts`)

### Recipe Food Cost per Portion
```
Food Cost = Σ (Ingredient Quantity / Yield % × Unit Cost)
```
Note: `Yield %` accounts for trim loss (e.g., chicken at 85% yield means 100g net = 117.6g gross needed).

### Food Cost %
```
Food Cost % = Food Cost / Selling Price × 100
```
Target: typically 25-35% for Saudi casual dining.

### Gross Margin %
```
Gross Margin % = (Selling Price - Food Cost - Packaging Cost) / Selling Price × 100
```

### Item Contribution Margin
```
Contribution Margin = Selling Price - Food Cost - Packaging Cost - Channel Fee Estimate
```

### Recommended Selling Price
```
Recommended Price = (Food Cost + Packaging Cost) / Target Food Cost %
```

### Price Impact of Ingredient Change
```
Price Impact = (New Ingredient Cost - Old Ingredient Cost) × (Recipe Quantity / Yield %)
```

---

## Menu Engineering (`menuEngineering.ts`)

Menu Engineering uses the Miller Matrix (BCG-style quadrant).

### Expected Popularity Threshold
```
Expected Popularity = (1 / Total Menu Items) × 70%
```
An item is "popular" if its sales mix % exceeds this threshold (Miller's 70% rule).

### Popularity Score
```
Popularity Score = Item Sales Mix % / Expected Popularity %
```
Score ≥ 1 = Popular. Score < 1 = Unpopular.

### Profitability Score
```
Profitability Score = Item Contribution Margin / Average Contribution Margin (all items)
```
Score ≥ 1 = High Profit. Score < 1 = Low Profit.

### Classification (BCG Matrix)
```
Popular + High Profit = STAR    ⭐ (keep, promote)
Popular + Low Profit  = PLOWHORSE 🐴 (reprice or reduce cost)
Unpopular + High Profit = PUZZLE 🧩 (reposition, feature)
Unpopular + Low Profit  = DOG  🐕 (remove or redesign)
```

---

## Branch Profitability (`branchProfitability.ts`)

### Contribution Profit
```
Contribution Profit = Net Sales
                    - Food Cost (actual)
                    - Packaging Cost
                    - Platform Fees (net)
                    - Waste Value
```
This is the branch profitability before fixed costs.

### Operating Profit Estimate
```
Operating Profit = Contribution Profit
                 - Labor Cost
                 - Rent Cost
                 - Utilities Estimate
                 - Fixed Cost Allocations
```

### Branch Margin %
```
Branch Margin % = Profit / Net Sales × 100
```

### Food Cost % (branch level)
```
Food Cost % = Food Cost / Net Sales × 100
```
Alert threshold: > 35% or > target + 3%.

### Waste % (branch level)
```
Waste % = Waste Value / Net Sales × 100
```
Alert threshold: > 3%.

---

## Supplier Scorecard (`supplierScorecard.ts`)

### Overall Score (Weighted)
```
Overall Score = (Price Score × 0.25)
              + (Quality Score × 0.25)
              + (Delivery Score × 0.20)
              + (Contract Compliance Score × 0.15)
              + (Invoice Accuracy Score × 0.10)
              + (Responsiveness Score × 0.05)
```
All scores are on a 0-100 scale.

### Price Score
```
Price Score = max(0, 100 - (Avg Price Variance % / Max Variance %) × 100)
```
Max Variance is typically 20%. Perfect score if prices = contract.

### Quality Score
```
Quality Score = (Accepted Deliveries / Total Deliveries) × 100
```

### Delivery Score
```
Delivery Score = (On-Time Deliveries / Total Deliveries) × 100
```

### Invoice Accuracy Score
```
Invoice Accuracy Score = (Accurate Invoices / Total Invoices) × 100
```

---

## Waste Calculations (`waste.ts`)

### Waste Value
```
Waste Value = Quantity × Unit Cost
```

### Waste %
```
Waste % = Total Waste Value / Net Sales × 100
```

### Preventable Waste
```
Preventable Waste = Σ Waste Value where isPreventable = true
```

Preventable reasons: OVERPRODUCTION, WRONG_PREPARATION, PORTIONING_ISSUE, STORAGE_ISSUE
Non-preventable reasons: CUSTOMER_RETURN, DELIVERY_DAMAGE

---

## Recommendation Priority Scoring

```
Priority Score = Base Priority × Impact Factor × Confidence Level

Where:
- Base Priority: 1-10 (rule-defined)
- Impact Factor: Estimated Financial Impact / Threshold Amount
- Confidence Level: 0.5 to 1.0 (rule-defined)
```

Recommendations sorted by Priority Score descending.

---

## Important Notes

1. **Division by zero**: All formulas return 0 when denominator is 0 (never throw)
2. **Currency**: All monetary values in SAR
3. **Percentages**: Stored as decimals internally (0.15 = 15%), displayed as % in UI
4. **Rounding**: Only at display layer, never in intermediate calculations
5. **Negative values**: Contribution margins can be negative (loss-making items/branches)
