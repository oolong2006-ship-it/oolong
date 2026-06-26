/**
 * RBAC Permission Matrix
 * All permissions are enforced server-side.
 * UI hiding is secondary - never rely on it for security.
 */

import type { UserRole } from '@prisma/client'

export type Permission =
  // Sales
  | 'sales:read'
  | 'sales:write'
  // Procurement
  | 'procurement:read'
  | 'procurement:write'
  // Suppliers
  | 'suppliers:read'
  | 'suppliers:write'
  // Inventory
  | 'inventory:read'
  | 'inventory:write'
  // Menu & Recipes
  | 'menu:read'
  | 'menu:write'
  // Delivery
  | 'delivery:read'
  | 'delivery:write'
  // Waste
  | 'waste:read'
  | 'waste:write'
  // Quality
  | 'quality:read'
  | 'quality:write'
  // Branches
  | 'branches:read'
  | 'branches:write'
  // Reports
  | 'reports:read'
  | 'reports:export'
  // AI Insights
  | 'insights:read'
  | 'insights:write'
  // Import
  | 'import:read'
  | 'import:write'
  // Users & Org Settings
  | 'users:read'
  | 'users:write'
  | 'settings:read'
  | 'settings:write'
  // Audit
  | 'audit:read'
  // Financial overview
  | 'financials:read'
  | 'financials:write'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'sales:read', 'sales:write',
    'procurement:read', 'procurement:write',
    'suppliers:read', 'suppliers:write',
    'inventory:read', 'inventory:write',
    'menu:read', 'menu:write',
    'delivery:read', 'delivery:write',
    'waste:read', 'waste:write',
    'quality:read', 'quality:write',
    'branches:read', 'branches:write',
    'reports:read', 'reports:export',
    'insights:read', 'insights:write',
    'import:read', 'import:write',
    'users:read', 'users:write',
    'settings:read', 'settings:write',
    'audit:read',
    'financials:read', 'financials:write',
  ],
  OWNER: [
    'sales:read', 'sales:write',
    'procurement:read', 'procurement:write',
    'suppliers:read', 'suppliers:write',
    'inventory:read', 'inventory:write',
    'menu:read', 'menu:write',
    'delivery:read', 'delivery:write',
    'waste:read', 'waste:write',
    'quality:read', 'quality:write',
    'branches:read', 'branches:write',
    'reports:read', 'reports:export',
    'insights:read', 'insights:write',
    'import:read', 'import:write',
    'users:read', 'users:write',
    'settings:read', 'settings:write',
    'audit:read',
    'financials:read', 'financials:write',
  ],
  CEO: [
    'sales:read',
    'procurement:read',
    'suppliers:read',
    'inventory:read',
    'menu:read',
    'delivery:read',
    'waste:read',
    'quality:read',
    'branches:read',
    'reports:read', 'reports:export',
    'insights:read', 'insights:write',
    'import:read',
    'users:read',
    'settings:read',
    'audit:read',
    'financials:read',
  ],
  CFO: [
    'sales:read',
    'procurement:read',
    'suppliers:read',
    'inventory:read',
    'menu:read',
    'delivery:read',
    'waste:read',
    'branches:read',
    'reports:read', 'reports:export',
    'insights:read',
    'import:read',
    'settings:read',
    'audit:read',
    'financials:read', 'financials:write',
  ],
  PROCUREMENT_MANAGER: [
    'procurement:read', 'procurement:write',
    'suppliers:read', 'suppliers:write',
    'inventory:read',
    'import:read', 'import:write',
    'reports:read', 'reports:export',
    'insights:read',
    'financials:read',
  ],
  OPERATIONS_MANAGER: [
    'sales:read', 'sales:write',
    'procurement:read',
    'suppliers:read',
    'inventory:read', 'inventory:write',
    'menu:read', 'menu:write',
    'delivery:read', 'delivery:write',
    'waste:read', 'waste:write',
    'quality:read', 'quality:write',
    'branches:read', 'branches:write',
    'reports:read', 'reports:export',
    'insights:read', 'insights:write',
    'import:read', 'import:write',
    'financials:read',
  ],
  WAREHOUSE_MANAGER: [
    'procurement:read',
    'inventory:read', 'inventory:write',
    'import:read', 'import:write',
    'reports:read',
    'waste:read', 'waste:write',
  ],
  BRANCH_MANAGER: [
    'sales:read',
    'inventory:read',
    'menu:read',
    'delivery:read',
    'waste:read', 'waste:write',
    'quality:read', 'quality:write',
    'branches:read',
    'reports:read', 'reports:export',
    'import:read', 'import:write',
    'financials:read',
    'insights:read',
  ],
  QUALITY_MANAGER: [
    'quality:read', 'quality:write',
    'waste:read', 'waste:write',
    'suppliers:read',
    'inventory:read',
    'reports:read', 'reports:export',
    'insights:read',
  ],
  ACCOUNTANT: [
    'sales:read',
    'procurement:read',
    'delivery:read',
    'reports:read', 'reports:export',
    'financials:read',
    'audit:read',
  ],
  AUDITOR: [
    'sales:read',
    'procurement:read',
    'suppliers:read',
    'inventory:read',
    'delivery:read',
    'waste:read',
    'reports:read',
    'audit:read',
    'financials:read',
  ],
  VIEWER: [
    'sales:read',
    'reports:read',
    'financials:read',
  ],
}

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Get all permissions for a role.
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

/**
 * Check if user can access a specific branch.
 * BRANCH_MANAGER is limited to their assigned branch.
 */
export function canAccessBranch(
  role: UserRole,
  userBranchId: string | null | undefined,
  targetBranchId: string
): boolean {
  if (role === 'BRANCH_MANAGER') {
    return userBranchId === targetBranchId
  }
  return true // Other roles can access all branches
}
