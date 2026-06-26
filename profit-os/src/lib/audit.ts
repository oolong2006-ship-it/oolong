/**
 * Audit Logging Utility
 * Logs sensitive operations for compliance and security.
 */

import { prisma } from '@/lib/prisma'

export interface AuditEventData {
  organizationId?: string
  userId?: string
  action: string
  entityType?: string
  entityId?: string
  beforeValue?: Record<string, unknown>
  afterValue?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an audit event.
 * Non-blocking — errors are caught and logged to console only.
 */
export async function logAudit(data: AuditEventData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        beforeValue: data.beforeValue as never,
        afterValue: data.afterValue as never,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  } catch (error) {
    console.error('[AuditLog] Failed to write audit log:', error)
  }
}

/**
 * Standard audit actions — use these constants for consistency.
 */
export const AuditActions = {
  // Auth
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_LOGIN_FAILED: 'user.login_failed',

  // Users
  USER_INVITED: 'user.invited',
  USER_ROLE_CHANGED: 'user.role_changed',
  USER_DEACTIVATED: 'user.deactivated',
  USER_ACTIVATED: 'user.activated',

  // Procurement
  INVOICE_IMPORTED: 'invoice.imported',
  INVOICE_CREATED: 'invoice.created',
  INVOICE_UPDATED: 'invoice.updated',
  INVOICE_DELETED: 'invoice.deleted',

  // Suppliers
  SUPPLIER_CREATED: 'supplier.created',
  SUPPLIER_UPDATED: 'supplier.updated',
  SUPPLIER_APPROVED: 'supplier.approved',
  CONTRACT_CREATED: 'contract.created',

  // Import
  FILE_UPLOADED: 'file.uploaded',
  DATA_IMPORTED: 'data.imported',
  DATA_IMPORT_FAILED: 'data.import_failed',

  // Settings
  SETTINGS_CHANGED: 'settings.changed',
  ORGANIZATION_UPDATED: 'organization.updated',

  // Reports
  REPORT_GENERATED: 'report.generated',
  DATA_EXPORTED: 'data.exported',
} as const
