# Implementation Plan — Restaurant Profit OS

## Phase 1: Foundation (Week 1-2)
**Goal**: Working Next.js app with auth and database

Tasks:
- [x] Bootstrap Next.js 14 app with TypeScript, Tailwind, ESLint
- [x] Configure Prisma with full schema (50+ models)
- [x] Set up NextAuth.js with credentials provider
- [x] Implement multi-tenant session (organizationId in JWT)
- [x] Create RBAC permission matrix
- [x] Set up shadcn/ui component library
- [x] Create AppShell layout (Sidebar + Topbar)
- [x] Implement audit logging utility
- [x] Create seed data with realistic 90-day history

Deliverables:
- Functional login/register flow
- Protected dashboard with sidebar navigation
- Database seeded with demo restaurant group

---

## Phase 2: Calculation Engine (Week 2-3)
**Goal**: All financial formulas implemented and tested

Tasks:
- [x] Sales calculations (net sales, AOV, growth)
- [x] Delivery platform calculations (net settlement, margin, profit/order)
- [x] Procurement calculations (price variance, budget variance)
- [x] Inventory calculations (consumption, WAC, days of stock)
- [x] Recipe/food cost calculations
- [x] Menu engineering (BCG matrix classification)
- [x] Branch profitability calculations
- [x] Supplier scorecard algorithm
- [x] Waste calculations
- [x] Recommendation generation rules
- [x] Unit tests for all calculation functions

Deliverables:
- 100% test coverage on calculation functions
- Documented formulas (calculation-formulas.md)

---

## Phase 3: Executive Dashboard (Week 3-4)
**Goal**: Real-time KPI dashboard

Tasks:
- [ ] Summary KPI cards (Sales, Food Cost %, Waste %)
- [ ] Branch performance ranking table
- [ ] Alert panel (unread alerts with severity)
- [ ] Recommendation panel (top 5 by priority)
- [ ] Sales trend chart (7-day / 30-day)
- [ ] Branch comparison chart
- [ ] Date range selector
- [ ] Branch filter selector

Deliverables:
- Executive dashboard with live data
- Mobile-responsive layout

---

## Phase 4: Sales Analytics (Week 4-5)
**Goal**: Comprehensive sales analysis

Tasks:
- [ ] Sales by channel breakdown (Dine-in, Delivery platforms)
- [ ] Daily/weekly/monthly trend charts
- [ ] Top performing items by revenue and quantity
- [ ] Branch comparison table with sorting
- [ ] Sales by day of week heatmap
- [ ] Discount analysis
- [ ] AOV trend chart
- [ ] POS data import (CSV/Excel)

Deliverables:
- Sales dashboard with channel breakdown
- Working POS CSV import

---

## Phase 5: Delivery Platform Profitability (Week 5-6)
**Goal**: True delivery P&L per platform

Tasks:
- [ ] Platform comparison table (Gross vs Net vs Margin)
- [ ] Net settlement breakdown (fees, commissions, promotions)
- [ ] Platform margin trend chart
- [ ] Loss-making orders detection and alert
- [ ] Promotion ROI analysis
- [ ] Platform settlement import (HungerStation, Jahez, Keeta)
- [ ] Commission rate comparison

Deliverables:
- Delivery profitability dashboard
- Settlement import for major Saudi platforms

---

## Phase 6: Procurement Management (Week 6-7)
**Goal**: Purchase cost control

Tasks:
- [ ] Purchase invoice list with filters
- [ ] Supplier spend breakdown (Pareto chart)
- [ ] Price variance vs contract alerts
- [ ] Duplicate invoice detection
- [ ] Category spend analysis
- [ ] Budget vs actual variance
- [ ] Supplier comparison for same item
- [ ] Purchase invoice import (Excel)

Deliverables:
- Procurement dashboard with alerts
- Purchase invoice import

---

## Phase 7: Supplier Management (Week 7-8)
**Goal**: Supplier relationship and scoring

Tasks:
- [ ] Supplier list with scorecard
- [ ] Supplier detail page (history, contracts, price list)
- [ ] Supplier scorecard generation (monthly)
- [ ] Price list management
- [ ] Contract management
- [ ] Quality issues linked to suppliers
- [ ] Supplier returns tracking

Deliverables:
- Supplier management module
- Automated monthly scorecard calculation

---

## Phase 8: Inventory & Recipes (Week 8-9)
**Goal**: Stock control and recipe costing

Tasks:
- [ ] Inventory item list with current levels
- [ ] Stock movement history
- [ ] Physical count entry and variance report
- [ ] Recipe builder (ingredients + quantities + yield)
- [ ] Automatic food cost calculation from recipe
- [ ] Price change impact simulation
- [ ] Reorder alerts (below minimum stock)
- [ ] Inventory count import (Excel)

Deliverables:
- Inventory control module
- Recipe costing tool

---

## Phase 9: Branch Profitability & Menu Engineering (Week 9-10)
**Goal**: Branch ranking and menu optimization

Tasks:
- [ ] Branch profitability ranking dashboard
- [ ] Branch detail page (full P&L breakdown)
- [ ] Menu engineering matrix (BCG quadrant visualization)
- [ ] Item-level profitability table
- [ ] Recommended price adjustments
- [ ] Waste tracking module
- [ ] Quality issue management
- [ ] Branch vs target comparison

Deliverables:
- Branch profitability module
- Menu engineering tool
- Waste management module

---

## Phase 10: Reports, Export & Production Readiness (Week 10-12)
**Goal**: Complete product ready for production

Tasks:
- [ ] Custom report builder (date range, branches, metrics)
- [ ] Excel export for all tables
- [ ] PDF report generation
- [ ] Audit log viewer
- [ ] Organization settings page
- [ ] User management (invite, roles, deactivate)
- [ ] Alert configuration
- [ ] Budget target entry
- [ ] Data retention policy
- [ ] Performance optimization (query caching, pagination)
- [ ] Error monitoring setup
- [ ] Production deployment checklist

Deliverables:
- Complete production-ready application
- Documentation for onboarding

---

## Technical Debt & Stretch Goals

### Performance
- Redis caching for snapshot queries
- Database query optimization with `EXPLAIN ANALYZE`
- CDN for static assets

### Advanced Analytics
- Forecasting (sales trend extrapolation)
- Seasonal adjustment factors
- What-if scenarios (price change impact)

### Integrations
- Foodics POS API direct integration
- Accounting system export (QuickBooks, Zoho Books)
- WhatsApp alerts via Twilio

### Mobile
- PWA (Progressive Web App) for branch managers
- Mobile-optimized views
- Offline data entry for waste/counts
