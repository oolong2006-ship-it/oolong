'use client'

import { useSession } from 'next-auth/react'

/**
 * Hook for accessing current organization context in client components.
 * Returns organization data from the authenticated session.
 */
export function useOrganization() {
  const { data: session, status } = useSession()

  return {
    organizationId: session?.user?.organizationId,
    organizationName: session?.user?.organizationName,
    role: session?.user?.role,
    branchId: session?.user?.branchId,
    isSuperAdmin: session?.user?.isSuperAdmin,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  }
}
