# DokanKhata

A multi-shop bookkeeping platform for small businesses in Bangladesh.

## Product direction
- Platform brand: DokanKhata
- Initial deployment: Vercel-assigned subdomain
- Trial plan: 7 days
- Starter subscription: BDT 200 per shop per month
- Payments: manual bKash/Nagad verification first; automated gateway later
- Initial shop categories: footwear, cosmetics, grocery, clothing, electronics, other
- Existing JOY SHOES account and records must be preserved as the first shop during migration.

## Current production application
- Existing production URL: https://joy-shoes.vercel.app
- Repository: https://github.com/ashiq3153/joy-shoes
- Stack: Next.js, React, Tailwind CSS v4, Supabase PostgreSQL/Auth/Storage, Vercel

## Migration safety requirements
The current production schema is owner-scoped and contains live JOY SHOES records. Do not drop or rename existing tables during the multi-shop migration.
Introduce shop tenancy, backfill the current owner's existing records into the first shop, and only then update application queries to use shop membership.
All exposed tenant-owned tables must have RLS policies validating membership in the same shop. Authorization must not depend on user-editable user_metadata.
Never expose Supabase service-role or secret keys in browser code.

## Planned implementation phases
1. DokanKhata branding and shared design system.
2. Registration, shop category selection, and shop profile onboarding.
3. Multi-tenant schema and tested RLS policies, preserving existing JOY SHOES records.
4. Shop-specific dashboard, settings, banner and profile images.
5. Additive sales entries, expense quick-entry and unified recent transactions.
6. Subscription lifecycle: 7-day trial, BDT 200/month, manual payment review.
7. Super Admin dashboard, followed by automated payment integration.
8. Data isolation, regression, mobile/PWA and production deployment tests.

## Existing modules
- Owner email/password authentication
- Sales, suppliers, purchases, supplier payments and purchase returns
- Employees and employee sales allocation
- Expenses, cash movements, daily closings and reports

## Accounting rules
- Employee sales are currently a breakdown of daily sales; they must not be double-counted.
- Supplier payments reduce supplier outstanding; they are not operating expenses.
- A credit-adjustment return reduces supplier outstanding.
- A cash-refund return is cash received; it does not reduce supplier outstanding a second time.
- Household withdrawals are owner draws, not business operating expenses.
- Cash balance and accounting profit are different measures.
