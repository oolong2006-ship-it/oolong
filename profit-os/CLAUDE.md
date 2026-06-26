# CLAUDE.md — Restaurant Profit OS

## Project Overview

Restaurant Profit OS is a multi-tenant SaaS platform for restaurant profitability management. Built with Next.js 14 App Router, TypeScript strict mode, Prisma ORM, and PostgreSQL.

---

## Project Rules

### TypeScript
- **Strict mode always**: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes` are all ON
- **No `any` type**: Use `unknown`, proper interfaces, or Prisma-generated types
- **All Prisma model types**: Import from `@prisma/client`, never redefine
- **Zod for all external inputs**: Every API route handler and server action must validate inputs with Zod

### Validation
```typescript
// CORRECT - always validate with Zod
import { z } from 'zod'
const schema = z.object({ organizationId: z.string().cuid(), ... })
const parsed = schema.safeParse(input)
if (!parsed.success) return { error: parsed.error.flatten() }

// WRONG - never trust raw input
const { organizationId } = req.body
```

### Error Handling
- Always return structured errors: `{ error: string, details?: unknown }`
- Never throw unhandled promises in route handlers
- Log errors server-side, never expose stack traces to client

---

## Coding Standards

### Server-Side First
- All data fetching in Server Components or route handlers
- Mutations via Server Actions or API route handlers
- Never expose Prisma client to browser
- Never put secrets in client components

### Reusable Components
- UI primitives in `src/components/ui/` (shadcn-based)
- Business components in `src/components/` with clear names
- No inline styles except for dynamic values
- Use `cn()` from `src/lib/utils.ts` for conditional class names

### Service Functions
- Pure business logic in `src/lib/calculations/`
- Database queries in route handlers or server actions (not in components)
- Calculation functions must be pure (no side effects, no DB calls)
- Each calculation module has a corresponding test file

### File Naming
- Pages: `page.tsx` (Next.js convention)
- Components: `PascalCase.tsx`
- Utilities/libs: `camelCase.ts`
- Types: `index.ts` in `src/types/`
- Tests: `*.test.ts` in `__tests__/`

---

## Security Requirements

### Tenant Isolation — CRITICAL
Every single database query MUST include the `organizationId` filter:

```typescript
// CORRECT - always scope by organizationId
const branches = await prisma.branch.findMany({
  where: {
    organizationId: session.user.organizationId, // REQUIRED
    isActive: true,
  }
})

// WRONG - SECURITY VULNERABILITY - never query without organizationId
const branches = await prisma.branch.findMany({
  where: { isActive: true }
})
```

### RBAC Enforcement
- Check permissions server-side in every route handler and server action
- Never rely on UI hiding to enforce access control
- Use `hasPermission()` from `src/lib/permissions.ts`

```typescript
// In route handlers
const session = await getServerSession(authOptions)
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
if (!hasPermission(session.user.role, 'procurement:write')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Audit Logging
Audit all sensitive operations using `logAudit()` from `src/lib/audit.ts`:
- User login/logout
- Role changes
- Supplier creation/modification
- Purchase invoice import
- Price changes
- User invitations
- Settings changes

### Input Sanitization
- Always validate file uploads (type, size, content)
- Max upload size: 10MB for Excel/CSV, 20MB for PDF
- Reject unexpected MIME types

---

## Calculation Accuracy Rules

### Pure Functions Only
All calculation functions in `src/lib/calculations/` must be:
- **Pure**: same inputs always produce same outputs
- **Traceable**: return intermediate values, not just final result
- **Documented**: JSDoc with formula explanation
- **Tested**: corresponding test in `__tests__/calculations/`

```typescript
// CORRECT - pure function, returns trace
export function calculateDeliveryMargin(data: DeliveryData): DeliveryMarginResult {
  const netAfterFees = data.grossSales - data.platformCommission - data.promotionCost
  const contributionMargin = netAfterFees - data.foodCost - data.packagingCost
  const marginPct = data.grossSales === 0 ? 0 : (contributionMargin / data.grossSales) * 100
  return { netAfterFees, contributionMargin, marginPct } // Return all intermediate values
}

// WRONG - opaque black box
export function getMargin(data: unknown): number { ... }
```

### No AI Hallucination in Calculations
- NEVER generate financial numbers with AI/LLM
- All numbers must be calculated from real data
- AI/rule engine only generates text recommendations, never numbers
- Every displayed number must be traceable to a formula

### Monetary Precision
- Store all monetary values as `Float` (SAR)
- Round only for display, not for storage or intermediate calculations
- Use `toFixed(2)` only when formatting for display

---

## Tenant Isolation Rules

The golden rule: **Every DB query must include `where: { organizationId }`**

```typescript
// Pattern for getting organizationId in server context
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
if (!session?.user?.organizationId) {
  return NextResponse.json({ error: 'No organization context' }, { status: 403 })
}
const orgId = session.user.organizationId
```

Exception: SuperAdmin queries may omit `organizationId` but must be explicitly marked.

---

## Arabic/English UI Notes

### Language Priority
- Arabic is the **default business language** for UI text, labels, notifications
- English identifiers in code (variable names, function names, enum values, database columns)
- Arabic text in `nameAr` fields, component labels, error messages

### RTL Support
- All layouts use `dir="rtl"` by default (set on `<html>` element)
- Tailwind RTL utilities: use `rtl:` prefix when direction-aware
- Numbers: use Arabic-Indic numerals for Arabic users (`ar-SA` locale)
- Dates: show Hijri alongside Gregorian when appropriate

### Bilingual Pattern
```typescript
// For display names, prefer Arabic with English fallback
const displayName = item.nameAr || item.name

// For API responses, include both
return { name: item.name, nameAr: item.nameAr }
```

### Currency Display
```typescript
// Always use formatCurrency() from lib/utils.ts
import { formatCurrency } from '@/lib/utils'
formatCurrency(amount) // "٤٥٫٠٠ ر.س" (Arabic locale)
```

---

## File Structure Explanation

```
profit-os/
├── src/
│   ├── app/                           # Next.js 14 App Router
│   │   ├── (auth)/                    # Auth route group (unauthenticated)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/               # Protected route group
│   │   │   ├── layout.tsx             # AppShell with Sidebar + Topbar
│   │   │   ├── dashboard/page.tsx     # Executive dashboard
│   │   │   ├── sales/page.tsx         # Sales analytics
│   │   │   ├── delivery/page.tsx      # Delivery platform P&L
│   │   │   ├── procurement/page.tsx   # Purchase management
│   │   │   ├── suppliers/             # Supplier management
│   │   │   ├── inventory/             # Stock control
│   │   │   ├── recipes/page.tsx       # Recipe costing
│   │   │   ├── menu/                  # Menu + engineering
│   │   │   ├── branches/              # Branch profitability
│   │   │   ├── waste/page.tsx         # Waste tracking
│   │   │   ├── quality/page.tsx       # Quality issues
│   │   │   ├── reports/page.tsx       # Reports
│   │   │   ├── ai-insights/page.tsx   # Recommendations
│   │   │   ├── import/page.tsx        # Data import
│   │   │   ├── settings/page.tsx      # Settings
│   │   │   └── audit-logs/page.tsx    # Audit trail
│   │   ├── api/                       # API route handlers
│   │   │   ├── auth/[...nextauth]/    # NextAuth
│   │   │   └── [module]/             # Module-specific APIs
│   │   ├── layout.tsx                 # Root layout (sets dir="rtl")
│   │   ├── page.tsx                   # Landing page
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui base components
│   │   ├── layout/
│   │   │   ├── AppShell.tsx           # Main layout wrapper
│   │   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   │   ├── Topbar.tsx             # Header with org switcher
│   │   │   └── BranchSelector.tsx     # Branch context selector
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx         # KPI card widget
│   │   │   ├── AlertCard.tsx          # Alert notification card
│   │   │   ├── RecommendationCard.tsx # AI recommendation card
│   │   │   └── charts/               # Chart components
│   │   ├── data-table/
│   │   │   └── DataTable.tsx          # Generic TanStack Table
│   │   └── common/
│   │       ├── PageHeader.tsx         # Page title + breadcrumb
│   │       ├── DateRangePicker.tsx    # Date range selector
│   │       ├── BranchFilter.tsx       # Branch filter dropdown
│   │       └── ExportButton.tsx       # Export to Excel/CSV
│   │
│   ├── lib/
│   │   ├── prisma.ts                  # Prisma singleton
│   │   ├── auth.ts                    # NextAuth config
│   │   ├── permissions.ts             # RBAC permission matrix
│   │   ├── audit.ts                   # Audit log helper
│   │   ├── tenant.ts                  # Tenant context helpers
│   │   ├── utils.ts                   # cn(), formatCurrency(), etc.
│   │   └── calculations/              # Pure calculation functions
│   │       ├── sales.ts
│   │       ├── delivery.ts
│   │       ├── procurement.ts
│   │       ├── inventory.ts
│   │       ├── recipe.ts
│   │       ├── menuEngineering.ts
│   │       ├── branchProfitability.ts
│   │       ├── supplierScorecard.ts
│   │       ├── waste.ts
│   │       └── recommendations.ts
│   │
│   ├── types/
│   │   └── index.ts                   # Shared TypeScript types
│   │
│   └── hooks/
│       └── useOrganization.ts         # Organization context hook
│
├── prisma/
│   ├── schema.prisma                  # Database schema (50+ models)
│   └── seed.ts                        # Seed data (90 days realistic)
│
├── __tests__/
│   └── calculations/                  # Unit tests for all calc functions
│
├── .env.local                         # Local environment (gitignored)
├── .env.example                       # Environment template
├── docs/
│   ├── product-spec.md
│   ├── database-model.md
│   ├── calculation-formulas.md
│   └── implementation-plan.md
└── CLAUDE.md                          # This file
```

---

## Common Patterns

### Route Handler Pattern
```typescript
// src/app/api/[module]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const data = await prisma.someModel.findMany({
    where: { organizationId: session.user.organizationId } // Always!
  })
  
  return NextResponse.json(data)
}
```

### Server Component Data Fetch Pattern
```typescript
// In a Server Component page
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function SomePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  
  const data = await prisma.someModel.findMany({
    where: { organizationId: session.user.organizationId }
  })
  
  return <SomeClientComponent data={data} />
}
```
