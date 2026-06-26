/**
 * Tenant Context Helpers
 * Utilities for extracting and validating organization context from sessions.
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export interface TenantContext {
  userId: string
  organizationId: string
  role: string
  branchId?: string | null
}

/**
 * Get tenant context in a Server Component or Route Handler.
 * Redirects to login if not authenticated.
 * Throws if no organization context.
 */
export async function requireTenantContext(): Promise<TenantContext> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.organizationId) {
    throw new Error('No organization context in session')
  }

  return {
    userId: session.user.id,
    organizationId: session.user.organizationId,
    role: session.user.role,
    branchId: session.user.branchId,
  }
}

/**
 * Get tenant context without redirecting (for API routes).
 * Returns null if not authenticated.
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.organizationId) {
      return null
    }

    return {
      userId: session.user.id,
      organizationId: session.user.organizationId,
      role: session.user.role,
      branchId: session.user.branchId,
    }
  } catch {
    return null
  }
}
