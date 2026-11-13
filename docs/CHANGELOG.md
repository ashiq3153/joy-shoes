# Changelog

## 2026-11-13 — DokanKhata SaaS foundation
- Reframed the application as a founder-owned, multi-shop bookkeeping SaaS.
- Preserved the original accounting application at /workspace.
- Added modular root experience: authentication, category onboarding, shop profile, dashboard, sale, expense, product, subscription and owner profile components.
- Added multiple-shop support to the shops table by removing the one-shop-per-owner constraint.
- Added owner_profiles, shop_sales, shop_expenses, subscriptions and subscription_payments.
- Added RLS policies and shop-specific indexes for the new SaaS tables.
- Added a public shop-media bucket with owner/member upload policies.
- Added /admin informational placeholder; Super Admin operations remain deferred.
- Added BRD, PRD, TRD, DRD, architecture, feature status and AI handoff documents.
- Existing legacy accounting tables and rows were not dropped or renamed.
