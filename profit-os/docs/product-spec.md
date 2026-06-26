# Product Specification — Restaurant Profit OS

## Vision

A single source of truth for restaurant group profitability — combining procurement data, sales data, delivery platform settlements, recipe costs, and operational expenses into actionable financial intelligence.

## Target Users

- Restaurant group owners and CEOs (strategic view)
- CFOs and accountants (financial accuracy)
- Operations managers (branch performance)
- Procurement managers (supplier cost control)
- Branch managers (daily operations)

## Core Problems Solved

1. **Invisible food cost**: Restaurants don't know their real food cost per dish
2. **Delivery platform opacity**: Net settlement ≠ real profit; hidden fees obscure true margin
3. **Procurement waste**: Price inflation, duplicate invoices, contract non-compliance go undetected
4. **Manual reconciliation**: Hours wasted matching POS exports, delivery reports, supplier invoices
5. **No branch comparison**: Can't rank branches by true profitability
6. **Reactive management**: Issues discovered weeks after they occur

## Key Metrics Tracked

### Sales KPIs
- Gross Sales, Net Sales (after discounts)
- Average Order Value (AOV)
- Sales Mix % per item/category
- Sales growth (WoW, MoM, YoY)

### Food Cost KPIs
- Actual Food Cost % (from purchases + inventory)
- Theoretical Food Cost % (from recipes x sales)
- Variance (actual vs theoretical)
- Cost per item sold

### Delivery Platform KPIs
- Net Settlement Amount
- Effective Commission Rate %
- Promotion Cost as % of Sales
- Contribution Margin per platform
- Profit per Order
- Loss-making order detection

### Procurement KPIs
- Purchase Spend by Supplier/Category
- Price Variance vs Contract
- Duplicate Invoice Detection
- Contract Compliance Rate
- Supplier Dependency Concentration

### Inventory KPIs
- Days of Stock per Item
- Stock Turnover Rate
- Consumption Variance (Actual vs Ideal)
- Slow-Moving Items Alert
- Reorder Point Breach

### Branch Profitability KPIs
- Contribution Profit (after variable costs)
- Operating Profit Estimate (after fixed costs)
- Branch Profitability Rank
- Food Cost % per branch
- Waste % per branch
- vs Target variance

### Waste KPIs
- Total Waste Value (SAR)
- Waste % of Sales
- Preventable vs Unavoidable Waste
- Waste by Reason breakdown
- Top Wasted Items

### Menu Engineering
- Contribution Margin per item
- Popularity Score
- BCG Classification (Star/Plowhorse/Puzzle/Dog)
- Recommended Price Adjustments

## Data Sources

| Source | Import Method | Frequency |
|--------|--------------|-----------|
| POS System (Foodics, POSRocket, etc.) | CSV/Excel Upload | Daily |
| HungerStation Settlement | Excel Upload | Weekly/Monthly |
| Jahez Settlement | Excel Upload | Weekly/Monthly |
| Keeta Settlement | Excel Upload | Weekly/Monthly |
| Mrsool Settlement | Excel Upload | Weekly/Monthly |
| Noon Food Settlement | Excel Upload | Weekly/Monthly |
| Supplier Invoices | Manual Entry / Excel | Per invoice |
| Inventory Count | Excel Upload | Weekly/Monthly |
| Waste Reports | Manual Entry / Excel | Daily/Weekly |

## System Architecture

### Multi-Tenancy
- Each restaurant group = one Organization
- All data strictly scoped by `organizationId`
- No cross-organization data leakage possible

### Data Pipeline
```
Raw Upload → Column Mapping → Validation → Import → Calculation → Snapshot → Dashboard
```

### Calculation Engine
- Pure TypeScript functions (no AI in calculations)
- All formulas documented in `docs/calculation-formulas.md`
- Unit tested
- Traceable: all intermediate values preserved

### Recommendation Engine
- Rule-based (not LLM-dependent for numbers)
- Triggers based on calculated KPI thresholds
- Prioritized by estimated financial impact
- Assigned to appropriate role

## Delivery Platform Profitability — Detailed Flow

```
Gross Sales (from platform)
- Platform Commission (%)
- Promotion Cost (discount funded by restaurant)
- Marketing Fees
- Bank/Payment Fees
- VAT on Fees
= Net Settlement

Net Settlement
- Estimated Food Cost (from recipe * sales mix)
- Packaging Cost
= Contribution Margin

Contribution Margin / Gross Sales = Platform Margin %
Contribution Margin / Order Count = Profit per Order
```

## Branch Profitability — Detailed Flow

```
Gross Sales
- Discounts
= Net Sales

Net Sales
- Food Cost (actual from purchases + inventory movement)
- Packaging Cost
- Delivery Platform Fees (net from settlements)
- Waste Value
= Contribution Profit

Contribution Profit
- Labor Cost (manual input or estimate)
- Rent Cost
- Utilities Estimate
- Fixed Cost Allocation
= Operating Profit Estimate

Operating Profit / Net Sales = Operating Margin %
```
