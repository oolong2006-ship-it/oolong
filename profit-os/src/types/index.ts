/**
 * Shared TypeScript types for Restaurant Profit OS
 */

import type { UserRole, AlertSeverity, AlertType, RecommendationStatus } from '@prisma/client'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      organizationId: string
      organizationName: string
      role: string
      branchId?: string | null
      isSuperAdmin: boolean
    }
  }
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================
// Dashboard Types
// ============================================================

export interface DashboardKPIs {
  totalNetSales: number
  totalGrossSales: number
  totalDiscounts: number
  totalOrders: number
  averageOrderValue: number
  totalFoodCost: number
  foodCostPct: number
  totalWasteValue: number
  wastePct: number
  totalPurchases: number
  salesGrowthPct: number
  branchCount: number
  activeBranchCount: number
}

export interface BranchSummary {
  id: string
  name: string
  nameAr: string | null
  netSales: number
  foodCostPct: number
  wastePct: number
  contributionProfit: number
  margin: number
  orderCount: number
  rank: number
}

// ============================================================
// Alert Types
// ============================================================

export interface AlertItem {
  id: string
  alertType: AlertType
  severity: AlertSeverity
  title: string
  titleAr: string | null
  description: string | null
  descriptionAr: string | null
  isRead: boolean
  isResolved: boolean
  createdAt: Date
  entityType?: string | null
  entityId?: string | null
}

// ============================================================
// Recommendation Types
// ============================================================

export interface Recommendation {
  id: string
  title: string
  titleAr: string | null
  description: string
  descriptionAr: string | null
  module: string
  estimatedImpact: number | null
  impactUnit: string | null
  confidence: number | null
  priority: number
  ownerRole: UserRole | null
  status: RecommendationStatus
  actionType: string | null
  createdAt: Date
}

// ============================================================
// Date Range
// ============================================================

export interface DateRange {
  from: Date
  to: Date
}

// ============================================================
// Chart Data Types
// ============================================================

export interface TimeSeriesDataPoint {
  date: string
  value: number
  label?: string
}

export interface PieDataPoint {
  name: string
  nameAr?: string
  value: number
  color?: string
}

// ============================================================
// Filter Types
// ============================================================

export interface SalesFilters {
  branchId?: string
  channelId?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface ProcurementFilters {
  supplierId?: string
  categoryId?: string
  dateFrom?: Date
  dateTo?: Date
  branchId?: string
}

export interface DeliveryFilters {
  platformId?: string
  branchId?: string
  dateFrom?: Date
  dateTo?: Date
}

// ============================================================
// Table Column Type
// ============================================================

export interface TableColumn<T> {
  key: keyof T
  header: string
  headerAr?: string
  cell?: (value: T[keyof T], row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

// ============================================================
// Import Types
// ============================================================

export type UploadTypeKey =
  | 'POS_SALES'
  | 'DELIVERY_SETTLEMENT'
  | 'PURCHASE_INVOICE'
  | 'SUPPLIER_PRICE_LIST'
  | 'INVENTORY_COUNT'
  | 'STOCK_MOVEMENT'
  | 'WASTE_REPORT'

export interface ImportResult {
  uploadBatchId: string
  status: 'success' | 'partial' | 'failed'
  importedCount: number
  errorCount: number
  errors?: string[]
}
