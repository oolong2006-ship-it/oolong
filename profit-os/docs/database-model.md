# Database Model Documentation

## Design Principles

1. **Multi-tenant first**: Every entity (except User, Account, Session) has `organizationId`
2. **Soft deletes**: `isActive` boolean flag, never hard delete business data
3. **Audit trail**: Separate `AuditLog` table for sensitive operations
4. **Performance snapshots**: Pre-computed tables (`*Snapshot`) for dashboard queries
5. **Bilingual**: `name` (English) + `nameAr` (Arabic) on all user-facing entities
6. **Weighted average cost**: `currentAverageCost` on `InventoryItem` updated on each receipt

## Entity Groups

### Tenancy Layer
- `Organization` — Top-level tenant (restaurant group)
- `User` — Platform user (can belong to multiple orgs)
- `Membership` — User-Organization relationship with Role
- `Account`, `Session`, `VerificationToken` — NextAuth tables

### Restaurant Structure
- `RestaurantBrand` — Brand under an org (e.g., "Zawq Kabsa", "Zawq Grills")
- `Branch` — Physical or virtual location (Dine-in, Delivery, Cloud Kitchen)
- `Warehouse` — Central warehouse or storage facility
- `CostCenter` — Accounting cost centers

### Suppliers & Procurement
- `Supplier` — Supplier company profile
- `SupplierContact` — Multiple contacts per supplier
- `SupplierContract` — Negotiated contracts with price agreements
- `ContractItem` — Line items in a contract (item + agreed price)
- `SupplierPriceList` — Current price lists (may not match contract)
- `SupplierPriceItem` — Items in a price list
- `PurchaseCategory` — Category for purchase classification
- `PurchaseInvoice` — Supplier invoice header
- `PurchaseInvoiceItem` — Invoice line items

### Inventory
- `UnitOfMeasure` — Units (kg, liter, piece, box)
- `UnitConversion` — Conversion factors between units
- `InventoryItem` — Raw material / ingredient master record
- `WarehouseStock` — Current stock level per warehouse per item
- `BranchStock` — Current stock level per branch per item
- `StockMovement` — Every stock in/out transaction
- `StockTransfer` — Transfer between warehouses/branches
- `StockCount` — Physical inventory count session
- `StockCountItem` — Count result per item (system vs counted)

### Menu & Recipes
- `MenuCategory` — Menu section (Mains, Sides, Beverages)
- `MenuItem` — Dish/product on the menu
- `MenuItemPrice` — Selling price (can vary by channel/branch)
- `Recipe` — Versioned recipe for a menu item
- `RecipeIngredient` — Ingredient + quantity + yield in a recipe

### Sales
- `SalesChannel` — Channel (Dine-in, HungerStation, Jahez, etc.)
- `SalesRecord` — Daily/session sales summary per branch per channel
- `SalesRecordItem` — Item-level sales detail

### Delivery Platforms
- `DeliveryPlatform` — Platform master (HungerStation, Jahez, Keeta, etc.)
- `DeliverySettlement` — Settlement report from platform
- `DeliverySettlementItem` — Line items in settlement
- `Promotion` — Promotion/discount campaigns on delivery platforms

### Waste & Quality
- `WasteRecord` — Individual waste event
- `SupplierReturn` — Returned goods to supplier
- `QualityIssue` — Quality problem report
- `CorrectiveAction` — Action taken to address quality issue

### Scorecards & Analytics
- `SupplierScorecard` — Monthly supplier evaluation scores
- `BranchProfitabilitySnapshot` — Monthly branch P&L snapshot
- `ItemProfitabilitySnapshot` — Monthly per-item profitability + menu engineering class
- `PlatformProfitabilitySnapshot` — Monthly delivery platform economics

### Data Import
- `UploadBatch` — File upload session with status tracking

### Alerts & Recommendations
- `Alert` — System-generated alert (low stock, price spike, etc.)
- `Recommendation` — Actionable recommendation with estimated impact

### Configuration
- `BudgetTarget` — Monthly targets per branch
- `AppSetting` — Key-value settings per organization
- `AuditLog` — Full audit trail
- `Report` — Generated report records

## Key Relationships

```
Organization
├── Membership (Users with Roles)
├── RestaurantBrand
│   └── Branch (many branches per brand)
├── Warehouse
├── Supplier
│   ├── SupplierContract
│   │   └── ContractItem → InventoryItem
│   └── PurchaseInvoice
│       └── PurchaseInvoiceItem → InventoryItem
├── InventoryItem
│   ├── WarehouseStock
│   ├── BranchStock
│   └── StockMovement
├── MenuItem
│   ├── Recipe
│   │   └── RecipeIngredient → InventoryItem
│   ├── MenuItemPrice (per channel)
│   └── SalesRecordItem
├── SalesRecord
│   ├── SalesRecordItem → MenuItem
│   └── SalesChannel / DeliveryPlatform
└── DeliverySettlement
    └── DeliveryPlatform
```

## Indexing Strategy

All tables have indexes on:
- `organizationId` (all tables)
- `branchId` (where applicable)
- `date`/`period` fields for time-series queries
- Foreign keys for JOIN performance
- `uploadBatchId` for import tracking

## Snapshot Refresh Strategy

Snapshots are recomputed:
- `BranchProfitabilitySnapshot`: After new sales/purchase/waste data imported
- `ItemProfitabilitySnapshot`: After new sales data imported
- `PlatformProfitabilitySnapshot`: After delivery settlement imported

Snapshots store pre-computed values to avoid expensive real-time calculations on dashboard load.
