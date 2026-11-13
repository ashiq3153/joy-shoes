# Data Requirements & Database Design (DRD)

**Version:** 1.0 · **Status:** SaaS core tables deployed; legacy migration pending

## 1. Tenancy model
- Auth identity: auth.users.id.
- Owner/business profile: owner_profiles.user_id and existing owners.id.
- Shop: shops.id, with shops.owner_id referencing owners.id.
- Membership: shop_memberships(shop_id, user_id, role, status).
- Each shop has independent subscription and independent tenant transactions.
- A person may own more than one shop. The former shops_one_per_owner constraint has been removed.
- For new shop-specific transaction tables, (shop_id, owner_id) is constrained to an actual shop pair.

## 2. Current SaaS tables
### owner_profiles
user_id (PK, auth.users FK), display_name, phone, avatar_url, created_at, updated_at.

### shops
Existing fields include id, owner_id, name, category, phone, address, logo_url, cover_url, is_active and timestamps. Shop owner is not unique; composite unique (id, owner_id) supports tenant-safe references.

### shop_memberships
id, shop_id, user_id, role (owner/manager/staff), status (active/invited/suspended), created_at. Current UI creates the owner membership; invitation flow is future work.

### products
Existing shop-scoped catalog: shop_id, product_code, product_name, category, brand, barcode, unit, purchase_price, selling_price, stock_qty, low_stock_at, is_active, notes, created_by and timestamps.

### shop_sales
id, shop_id, owner_id, sale_date, sold_at, amount, cost_amount, payment_method, seller_name, notes, created_by, created_at. Supports multiple sale entries per day.

### shop_expenses
id, shop_id, owner_id, expense_date, category, description, amount, payment_method, notes, created_by, created_at. Categories: business, hand, employee_payment, owner_withdrawal, other.

### subscriptions
One row per shop: shop_id (unique), owner_id, plan_code, status, trial_started_at, trial_ends_at, current_period_started_at, current_period_ends_at and timestamps. New shops receive starter/trialing with database defaults of 7 days.

### subscription_payments
id, shop_id, owner_id, subscription_id, amount (exactly ৳২০০), payment_method (bkash/nagad), sender_phone, transaction_id, proof_url, status (pending/approved/rejected), submitted_at and review fields. Customer insertion is restricted to pending payment requests. Admin review is not yet exposed.

## 3. Key relationships
- owners 1 → many shops
- auth.users 1 → 1 owner_profiles
- shops 1 → many shop_memberships
- shops 1 → many products
- shops 1 → many shop_sales
- shops 1 → many shop_expenses
- shops 1 → 1 current subscription
- subscriptions 1 → many subscription_payments

## 4. RLS expectations
- owner_profiles: user can read/insert/update only their own row.
- shops: owner policies control shop creation, reading and updates.
- products: active shop members and shop owners can read/write according to current policies.
- shop_sales and shop_expenses: shop owner or active membership; created_by must match auth.uid() on insert/update.
- subscriptions: owner reads; user may create only starter/trialing subscription within a seven-day window; no client-side activation/update policy.
- subscription_payments: owner reads and submits fixed ৳২০০ pending requests; no client-side approval.
- Storage: insert/delete scoped to first path segment matching shop UUID and owner/member authorization.

## 5. Legacy tables not yet migrated
Existing tables such as daily_sales, suppliers, purchases, purchase_items, supplier_payments, purchase_returns, return_items, cash_memos, employees, employee_sales, expenses, cash_movements, daily_closings, audit_logs and supplier_ledger_view still primarily use owner_id.

Do not drop, rename, rewrite, or combine these tables blindly. Their full shop_id backfill, RPC changes, view redesign and RLS migration must be planned and tested separately. Until then, the legacy workspace is retained at /workspace and available only from the primary/legacy shop entry in the new UI.

## 6. Migration rules
1. Add columns/tables before changing application reads.
2. Backfill each historical row to the correct shop using verified owner-to-shop mapping.
3. Verify counts and accounting totals before/after.
4. Add RLS and indexes and test with separate users.
5. Change RPCs and views only after reviewing their full definitions.
6. Keep legacy columns and rows until rollback window and parity checks are complete.
