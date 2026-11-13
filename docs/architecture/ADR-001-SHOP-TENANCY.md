# ADR-001 — Shop as the tenant boundary

- **Status:** Accepted
- **Date:** 13 November 2026
- **Decision owners:** DokanKhata platform owner / engineering

## Context
DokanKhata is a SaaS product owned by the platform founder. Independent business owners subscribe to manage their own shops. A single account may own more than one shop. JOY SHOES is a legacy shop and data set, not the platform identity.

The previous accounting schema is primarily owner-scoped. Rewriting it in place would increase migration and data-loss risk.

## Decision
1. A shop is the accounting and subscription tenant.
2. Every new shop-owned transaction includes both `shop_id` and `owner_id`.
3. A composite foreign key `(shop_id, owner_id)` points to a valid shop-owner pair.
4. RLS checks shop ownership or active membership at the database layer.
5. `created_by` identifies the authenticated actor; it does not grant authorization.
6. New customer-facing transactions use new shop-scoped tables while legacy rows remain untouched.
7. Shop creation is executed by the SECURITY INVOKER function `create_shop_with_trial`, which inserts the shop, owner membership and 7-day trial in one transaction.
8. No browser client may promote a subscription to active or approve a payment.
9. Platform admin authorization must be separate from shop-owner permissions and must never rely on editable user_metadata.

## Consequences
- One owner can create multiple shops.
- Data filtering in the UI improves UX but RLS remains the security boundary.
- Legacy accounting modules must be migrated table by table, including child rows, views and RPC functions.
- The new dashboard must not combine legacy owner-scoped totals with shop-scoped totals until a verified reconciliation migration is complete.
- A separate subscription exists for each shop.

## Alternatives rejected
- **Use owner_id as the only tenant key:** rejected because one user may own multiple shops and the data would be shared across their shops.
- **Rename existing owner_id columns in place:** rejected because legacy UI, RPCs and views depend on them.
- **Trust activeShopId from the browser:** rejected because client state is user-controlled and not an authorization boundary.
- **Use user_metadata for role/admin flags:** rejected because users can edit user_metadata.

## Required follow-up
- Migrate suppliers, purchases, purchase_items, supplier_payments, returns, employees, employee_sales, cash movements, cash closings, audit logs, legacy sales/expenses, views and RPCs.
- Test owner, manager, staff, suspended membership and cross-shop access paths.
- Introduce a server-managed platform-admin allowlist and audited payment approval workflow.
