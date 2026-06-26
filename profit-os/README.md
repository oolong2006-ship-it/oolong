# Restaurant Profit OS — نظام تشغيل الربحية للمطاعم

A production-grade SaaS platform for restaurant profitability management, built for the Saudi Arabian and Gulf restaurant market.

---

## What is Restaurant Profit OS?

Restaurant Profit OS is a comprehensive financial and operational intelligence platform that helps restaurant groups:

- Track real profitability per branch, per channel, and per menu item
- Manage procurement costs and supplier performance
- Control inventory with recipe-level food cost accuracy
- Analyze delivery platform economics (HungerStation, Jahez, Keeta, etc.)
- Reduce waste through data-driven insights
- Get actionable AI-generated recommendations

---

## ما هو نظام تشغيل الربحية؟

نظام تشغيل الربحية للمطاعم هو منصة ذكاء مالي وتشغيلي شاملة تساعد مجموعات المطاعم على:

- تتبع الربحية الفعلية لكل فرع وقناة ومنتج
- إدارة تكاليف المشتريات وأداء الموردين
- ضبط المخزون بدقة على مستوى الوصفات
- تحليل اقتصاديات منصات التوصيل
- تقليل الهدر من خلال رؤى مبنية على البيانات
- الحصول على توصيات قابلة للتنفيذ

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL via Prisma ORM |
| Authentication | NextAuth.js v5 (Credentials + future OAuth) |
| UI Components | shadcn/ui + Radix UI primitives |
| Styling | Tailwind CSS (RTL support) |
| Charts | Recharts |
| Validation | Zod |
| Forms | React Hook Form |
| Tables | TanStack Table v8 |
| Excel/CSV | xlsx + PapaParse |
| File Upload | UploadThing |

---

## Modules

| Module | Description (EN) | الوصف |
|--------|-----------------|-------|
| Dashboard | Executive KPI overview | لوحة المؤشرات التنفيذية |
| Sales | Multi-channel sales analytics | تحليل المبيعات متعدد القنوات |
| Delivery | Platform profitability (HungerStation, Jahez, etc.) | ربحية منصات التوصيل |
| Procurement | Purchase invoices, supplier management | المشتريات وإدارة الموردين |
| Suppliers | Scorecards, contracts, price lists | تقييم الموردين والعقود |
| Inventory | Stock levels, movements, counts | المخزون والحركات |
| Recipes | Recipe costing, food cost % | وصفات وتكلفة الغذاء |
| Menu Engineering | BCG matrix for menu items | هندسة القائمة (مصفوفة BCG) |
| Branches | Branch profitability ranking | تصنيف ربحية الفروع |
| Waste | Waste tracking and reduction | تتبع الهدر وخفضه |
| Quality | Quality issues and corrective actions | مشكلات الجودة والإجراءات التصحيحية |
| Reports | Custom reports and exports | التقارير والتصدير |
| AI Insights | Rule-based recommendations | التوصيات الذكية |
| Import | Excel/CSV data import | استيراد البيانات |
| Settings | Organization and system settings | الإعدادات |
| Audit Logs | Full audit trail | سجل التدقيق الكامل |

---

## User Roles

| Role | Arabic | Access Level |
|------|--------|-------------|
| SUPER_ADMIN | مشرف عام | Full system access |
| OWNER | مالك | Full organization access |
| CEO | مدير تنفيذي | Full read + strategic actions |
| CFO | مدير مالي | Full financial access |
| PROCUREMENT_MANAGER | مدير المشتريات | Procurement + suppliers |
| OPERATIONS_MANAGER | مدير العمليات | Branch ops + sales |
| WAREHOUSE_MANAGER | مدير المستودع | Inventory + stock |
| BRANCH_MANAGER | مدير الفرع | Own branch only |
| QUALITY_MANAGER | مدير الجودة | Quality + waste |
| ACCOUNTANT | محاسب | Financial read |
| AUDITOR | مدقق | Read-only audit |
| VIEWER | مشاهد | Read-only |

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

### Setup

```bash
# 1. Clone and enter directory
cd profit-os

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and NEXTAUTH_SECRET

# 4. Set up database
npx prisma migrate dev --name init
npx prisma db seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Default login after seeding:
- Email: `admin@zawq.com`
- Password: `Admin@123`

---

## Database

This project uses PostgreSQL with Prisma ORM. The schema includes 50+ models covering all aspects of restaurant operations.

Key design decisions:
- **Multi-tenant**: Every table scoped by `organizationId`
- **Soft deletes**: `isActive` flag, never hard delete
- **Weighted average cost**: Inventory valued at moving average
- **Snapshot tables**: Pre-computed profitability snapshots for performance
- **Audit trail**: `AuditLog` table for all sensitive operations

---

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API route handlers
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # AppShell, Sidebar, Topbar
│   ├── dashboard/         # Dashboard widgets
│   └── common/            # Shared components
├── lib/
│   ├── calculations/      # Pure calculation functions (tested)
│   ├── prisma.ts          # Prisma client singleton
│   ├── auth.ts            # NextAuth configuration
│   ├── permissions.ts     # RBAC logic
│   ├── audit.ts           # Audit logging
│   └── utils.ts           # Utilities
├── types/                 # TypeScript type definitions
└── hooks/                 # React hooks
```

---

## Security

- All database queries scoped by `organizationId` (tenant isolation)
- RBAC enforced server-side on every route and action
- Passwords hashed with bcryptjs (12 rounds)
- Session tokens via NextAuth JWT
- Audit logging for all sensitive operations
- Input validation with Zod on all API endpoints

---

## License

Proprietary. All rights reserved.
