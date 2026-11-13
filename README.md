# DokanKhata — Digital Bookkeeping SaaS

DokanKhata is a multi-shop bookkeeping platform for small businesses in Bangladesh. Each shop owner can create multiple independent shops, record daily sales and expenses, manage products and keep a separate subscription for each shop.

## Commercial model
- 7-day free trial per shop
- Starter: ৳200 per shop / month
- Planned renewal workflow: manual bKash / Nagad payment request and admin verification
- Payment submit UI is currently held until official receiver details and a protected admin review flow are ready; do not send money to any unconfigured number
- Payment request remains pending until a trusted admin approves it

## Product ownership
DokanKhata is owned and operated by the platform founder / Managing Director. Shop owners are customers using the SaaS. JOY SHOES is the first legacy shop and dataset; it is not the product identity.

## Production / source
- Production: https://joy-shoes.vercel.app
- GitHub: https://github.com/ashiq3153/joy-shoes
- Current stack: Next.js 15, React 19, Supabase Auth/Postgres/Storage, Vercel

## Start locally
1. Install Node.js LTS.
2. Clone this repository.
3. Install dependencies with npm install.
4. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.
5. Run npm run dev and open http://localhost:3000.

Never place a Supabase service-role or secret key in a NEXT_PUBLIC environment variable or client-side source.

## Code map
- app/page.js — thin route adapter
- src/components/AppClient.jsx — session and active-shop orchestration
- src/components/auth/ — authentication
- src/components/onboarding/ — category selection and shop profile setup
- src/components/dashboard/ — dashboard home and responsive shell
- src/components/modules/ — sale, expense and product screens
- src/components/profile/ — shop and owner profile settings
- src/components/subscription/ — 7-day trial and manual payment request
- app/workspace/page.js — preserved legacy accounting application
- app/admin/page.js — placeholder only; Super Admin panel is not implemented
- supabase/migrations/ — database changes
- docs/ — product, business, technical, data and AI handoff documentation

## Current implementation boundary
The new customer-facing experience uses shop-scoped tables: shop_sales, shop_expenses, products, subscriptions and subscription_payments. The original JOY SHOES accounting tables and rows are preserved at /workspace. Those legacy suppliers, purchases, employees, cash closing, reporting views and RPC functions still require a planned shop_id migration. Until this migration is complete, do not assume the entire accounting suite is multi-tenant.

The new dashboard does not silently combine legacy owner-scoped totals with new shop-specific records. This avoids double-counting and accidental cross-shop totals.

## Core documents
- docs/product/BRD.md — business requirements and commercial model
- docs/product/PRD.md — user journeys and product requirements
- docs/technical/TRD.md — stack and engineering requirements
- docs/data/DRD.md — database design and legacy migration boundary
- docs/architecture/ARCHITECTURE.md — application and tenant architecture
- docs/roadmap/FEATURE_STATUS.md — live, partial and planned features
- docs/AI_HANDOFF.md — instructions for future AI/developer contributors

## Accounting principles
- Employee sales are attribution, not additional sales.
- Supplier payments reduce supplier balance; they are not operating expenses.
- Owner withdrawals are not business expenses.
- Missing product cost must not be represented as zero profit.
- Cash balance and accounting profit are different measures.

## Before shipping a change
Review docs/AI_HANDOFF.md, inspect current Supabase schema and RLS, make additive migrations, test with separate users, run Supabase advisors, and verify the Vercel production deployment.
