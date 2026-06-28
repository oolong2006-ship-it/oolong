import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "session_token"

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/onboarding", "/project", "/profile", "/payment"]

// Routes that redirect authenticated users away (auth pages)
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"]

// Admin-only routes
const ADMIN_ROUTES = ["/admin"]

/**
 * Decode JWT payload without verification — verification happens in API routes.
 * Middleware runs in Edge Runtime where jsonwebtoken is unavailable.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    // JWT uses base64url encoding — replace chars and pad
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=")
    const decoded = atob(padded)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get(COOKIE_NAME)?.value

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  )
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  )
  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  )

  // Check token presence + decode role (no verification — API routes verify)
  const payload = token ? decodeJwtPayload(token) : null
  const isAuthenticated = payload !== null
  const isAdmin = payload?.role === "ADMIN"

  // Admin routes: must be authenticated AND admin role
  if (isAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // Protected user routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|public/|api/).*)",
  ],
}
