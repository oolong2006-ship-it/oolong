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

---

## Security Requirements

### Tenant Isolation — CRITICAL
Every single database query MUST include the `organizationId` filter:

```typescript
// CORRECT
const branches = await prisma.branch.findMany({
  where: { organizationId: session.user.organizationId }
})

// WRONG - SECURITY VULNERABILITY
const branches = await prisma.branch.findMany({ where: { isActive: true } })
```

### RBAC
- Check permissions server-side in every route handler
- Use `hasPermission()` from `src/lib/permissions.ts`

---

## Calculation Rules
- All calculation functions in `src/lib/calculations/` must be pure functions
- No AI/LLM in calculations — rule-based only
- All monetary values in SAR (Float)
- Formulas documented in `docs/calculation-formulas.md`

---

## Arabic/English Notes
- Arabic is default UI language
- RTL layout (`dir="rtl"` on html element)
- English identifiers in code
- `nameAr` fields for Arabic text
- Use `formatCurrency()` from `lib/utils.ts` for money display
