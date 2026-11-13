# AI / Developer Handoff — Read Before Changing DokanKhata

This file is the handoff contract for ChatGPT, other AI agents and future developers.

## Product truth
- Product name is DokanKhata.
- The founder is the platform owner / MD.
- Shop owners are paying SaaS customers.
- Starter price is ৳২০০ per shop per month; each new shop has a 7-day trial.
- JOY SHOES is the founder's first legacy shop, not the whole product.
- Current public URL remains https://joy-shoes.vercel.app until domain migration.

## Read these files first
1. docs/product/BRD.md — business rules and roles.
2. docs/product/PRD.md — user journeys and feature acceptance.
3. docs/architecture/ARCHITECTURE.md — runtime and tenant context.
4. docs/data/DRD.md — real table model and legacy boundary.
5. docs/technical/TRD.md — stack, folders and engineering conventions.
6. docs/roadmap/FEATURE_STATUS.md — what is live vs planned.
7. supabase/migrations — database change history.
8. docs/architecture/ADR-001-SHOP-TENANCY.md — tenant design decision.
9. docs/testing/TEST_PLAN.md — repeatable functional and RLS tests.

## Non-negotiable safety rules
- Never delete or rename legacy tables or rows as a shortcut.
- Never claim every existing module is multi-tenant until every row, view, RPC and RLS policy has a shop_id-aware implementation and cross-tenant tests.
- Every new shop-owned row must use shop_id and owner_id; created_by is the actual authenticated actor.
- Always rely on RLS and foreign keys, not only client-side filters.
- Never use user_metadata for roles or authorization.
- Never put service_role / Supabase secret keys in NEXT_PUBLIC variables or client-side code.
- A submitted payment is Pending until a trusted admin approves it. Do not activate a subscription from the browser.
- Do not invent bKash/Nagad merchant numbers.
- Keep sales, expenses, supplier payments, owner withdrawals and employee-sales attribution semantically distinct.

## Working process
1. Inspect current code and live Supabase schema before changing anything.
2. Read the relevant product and data requirements.
3. Make one small feature change at a time; avoid reintroducing a giant page component.
4. Create an additive migration, verify it against Supabase, then commit the exact migration to GitHub.
5. Add or update feature documentation and this status table.
6. Run security/performance advisors and test with at least two different authenticated users for tenant changes.
7. Wait for Vercel deployment to be READY and verify the production URL before announcing.

## Suggested next phases
- Phase 2: Shop-aware suppliers, employees, purchases, returns, cash movements, closings, legacy sales/expenses, reporting views and RPCs.
- Phase 3: Secure Super Admin console, customer search, shop status, subscription review, audit trail and configurable payment instructions.
- Phase 4: Automated bKash/Nagad/payment gateway, receipt verification and webhooks.
- Phase 5: PWA/offline, employee invites, permissions, exports, backup and domain migration.

## Known current limitations
- New root dashboard uses shop_sales and shop_expenses. It does not yet import legacy daily_sales / expenses into these new tables.
- Legacy accounting UI stays available at /workspace for the primary legacy shop.
- The /admin path is only a placeholder; no admin privileges or actions are exposed there.
- Phone is stored as a profile field; it is not OTP-verified.
- Google OAuth is not enabled until credentials and redirect URLs are configured.
- Manual payment destination details are not configured. The customer-facing payment submit form is intentionally disabled; do not collect TxIDs or accept money until official receiver instructions and admin review are available.
- Shop creation uses the SECURITY INVOKER RPC `create_shop_with_trial`, which atomically writes the shop, owner membership and 7-day trial under RLS.
- The active-shop data loader uses a request sequence guard to prevent slow responses from a previously selected shop replacing the current shop's data.
- Focused smoke tests verified cross-user read isolation for shops, shop_sales, shop_expenses and products, and rejected a cross-owner shop_sales insert. This does not certify the legacy owner-scoped tables or manager/staff permission model.

## Repository
- Source: https://github.com/ashiq3153/joy-shoes
- Production: https://joy-shoes.vercel.app
- Root route: app/page.js → src/components/AppClient.jsx
