# Data Requirements & Database Design (DRD)

**Version:** 1.1 · **Status:** SaaS core deployed; supplier and employee directories shop-scoped; accounting ledger migration pending

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

### suppliers (partially migrated)
Legacy supplier fields are preserved. A required shop_id has been added and existing suppliers are backfilled to their verified owner shop. Composite FK (shop_id, owner_id) references shops(id, owner_id). The supplier list and supplier ledger view are filtered by shop_id. Existing RLS remains owner_id-based; manager/staff access is not enabled.

### employees (partially migrated)
Legacy employee fields are preserved. A required shop_id has been added and existing employees are backfilled to their verified owner shop. Composite FK (shop_id, owner_id) references shops(id, owner_id). The new employee directory is shop-filtered. employee_sales attribution has not yet been shop-scoped.

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
- shops 1 → many suppliers (directory rows shop-scoped)
- shops 1 → many employees (directory rows shop-scoped)
- shops 1 → many products
- shops 1 → many shop_sales
- shops 1 → many shop_expenses
- shops 1 → 1 current subscription
- subscriptions 1 → many subscription_payments

## 4. RLS expectations
- owner_profiles: user can read/insert/update only their own row.
- shops: owner policies control shop creation, reading and updates.
- products: active shop members and shop owners can read/write according to current policies.
- suppliers and employees: new rows include shop_id and are queried by selected shop; current table RLS still checks owner_id = auth.uid(), so only the account owner has access (manager/staff access is not enabled).
- shop_sales and shop_expenses: shop owner or active membership; created_by must match auth.uid() on insert/update.
- subscriptions: owner reads; user may create only starter/trialing subscription within a seven-day window; no client-side activation/update policy.
- subscription_payments: owner reads and submits fixed ৳২০০ pending requests; no client-side approval.
- Storage: insert/delete scoped to first path segment matching shop UUID and owner/member authorization.

## 5. Legacy tables not yet migrated
Remaining legacy accounting tables such as daily_sales, purchases, purchase_items, supplier_payments, purchase_returns, return_items, cash_memos, employee_sales, expenses, cash_movements, daily_closings and audit_logs still primarily use owner_id. The suppliers and employees directory tables now have shop_id; supplier_ledger_view has shop_id appended and is SECURITY INVOKER.

Do not drop, rename, rewrite, or combine these tables blindly. Remaining tables need shop_id backfills, RPC changes, view redesign and shop-aware RLS. Supplier purchases/payments/returns, employee-sales attribution, cash flows and daily closing remain in the legacy workspace at /workspace and are available only from the primary/legacy shop entry in the new UI.

## 6. Migration rules
1. Add columns/tables before changing application reads.
2. Backfill each historical row to the correct shop using verified owner-to-shop mapping.
3. Verify counts and accounting totals before/after.
4. Add RLS and indexes and test with separate users.
5. Change RPCs and views only after reviewing their full definitions.
6. Keep legacy columns and rows until rollback window and parity checks are complete.
