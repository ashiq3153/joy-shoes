# DokanKhata — System Architecture

## 1. Runtime topology
Shop owner browser / mobile browser → Vercel Next.js App Router → Supabase Auth + PostgREST → PostgreSQL with RLS. Shop images are stored in Supabase Storage and served through the public shop-media URL. GitHub main is the source of Vercel deployments.

## 2. Application layers
1. Route layer (app/): small route adapters and global layout.
2. Experience layer (src/components/): authentication, onboarding, dashboard shell and feature screens.
3. Application orchestration (AppClient.jsx): user session, active shop, feature writes and refresh.
4. Shared domain layer (src/lib/dokankhata/): categories, plan rules and formatting.
5. Data / security layer (Supabase): constraints, RLS policies, Storage policies and indexes.

## 3. Tenant context
An authenticated user loads shops where shops.owner_id = auth.uid(). The UI keeps one selected shop ID. Every new sales, expense, product and subscription request is filtered or written with that shop ID. PostgreSQL RLS and foreign keys validate the relationship; UI filtering alone is not security.

## 4. Platform owner / Super Admin
The MD is the platform owner, not a shop customer role. The Super Admin console is a separate trust boundary and will be built later. Admin roles must live in a server-managed allowlist / protected table or trusted app_metadata claim set by a server-side admin process. Never allow a browser user to self-assign admin via user_metadata. Service-role operations stay behind a server endpoint or Edge Function and must be audited.

## 5. Current migration boundary
The new root experience writes to shop_sales and shop_expenses. The older owner-scoped bookkeeping experience is preserved under /workspace. The old modules are exposed only for the primary/legacy shop from the new navigation; they are not yet suitable for multiple independent shops under one owner. Do not claim the full accounting suite is multi-tenant until legacy data and RPCs are migrated and RLS tests pass.

## 6. Future module boundaries
Recommended feature structure:
- features/auth/
- features/shops/
- features/sales/
- features/expenses/
- features/inventory/
- features/suppliers/
- features/employees/
- features/reports/
- features/billing/
- features/admin/
Each feature should own UI components, validation, data-access functions, tests and documentation.
