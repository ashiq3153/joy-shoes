# DokanKhata — Feature Status & Roadmap

Status meanings: LIVE FOUNDATION = code/database exists; PARTIAL = usable slice only; PLANNED = not implemented.

**Verification note — 13 November 2026:** Production homepage and `/admin` placeholder were browser-checked. The shop creation RPC was exercised with a test account and created the shop, owner membership and trial together; the test shop was deleted afterwards. Cross-user RLS read checks for `shop_sales`, `shop_expenses`, `products`, `shops`, `suppliers`, `employees` and `supplier_ledger_view` returned zero rows for the unrelated account. Supplier/employee shop_id columns and the SECURITY INVOKER ledger view were also verified; legacy supplier and employee row counts remained unchanged. This is a focused smoke test, not a complete penetration test or a complete multi-tenant certification.

| Feature | Status | Notes |
|---|---|---|
| DokanKhata branding and root experience | LIVE FOUNDATION | Root route now loads modular app |
| Email/password login and registration | LIVE FOUNDATION | Email confirmation follows Supabase project configuration |
| Owner profile | LIVE FOUNDATION | Name and phone; phone verification pending |
| Shop category onboarding | LIVE FOUNDATION | Six category types |
| Multiple shop records per owner | LIVE FOUNDATION | Database uniqueness restriction removed |
| Shop switcher | LIVE FOUNDATION | UI uses selected shop ID |
| Shop profile and media | PARTIAL | Name/category/contact/address and UI are live. Owner-first media path and RLS policy were corrected; actual browser upload verification is still pending |
| Product catalog and search | LIVE FOUNDATION | Per-shop product table |
| Multiple sale entries per day | LIVE FOUNDATION | shop_sales; quick-sale form records cash by default and no longer asks for a payment method |
| Quick expense categories | LIVE FOUNDATION | shop_expenses; quick-expense form records cash by default and no longer asks for a payment method |
| Seven-day trial | LIVE FOUNDATION | One trial row per shop created atomically with shop; automatic expiry enforcement still pending |
| ৳২০০ / shop / month plan | LIVE FOUNDATION | Price and per-shop billing schema; renewal and paid access enforcement pending |
| Manual bKash / Nagad request | PARTIAL / HELD | Payment schema and ownership policy exist; submit UI is disabled until official receiver details and admin verification are available |
| Dashboard current-shop sales / expense stats | LIVE FOUNDATION | Uses new shop-scoped tables only; larger mobile shop banner/date and in-place menu drawer deployed |
| Supplier directory / supplier ledger | LIVE FOUNDATION | suppliers.shop_id backfilled; new shop-scoped list/create screen and SECURITY INVOKER ledger view; purchase/payment/return entry remains legacy-only |
| Purchases / supplier payments / purchase returns | PLANNED for tenancy migration | Old RPCs still use owner_id and must be scoped before enabling in new shops |
| Employee directory | LIVE FOUNDATION | employees.shop_id backfilled; new shop-scoped list/create screen; employee_sales attribution remains legacy-only |
| Daily cash closing | PLANNED for tenancy migration | Existing owner-scoped rows preserved |
| Full monthly/profit report | PARTIAL | New shop entry summary only; full report later |
| Phone OTP verification | PLANNED | Requires SMS provider and Supabase Auth setup |
| Google OAuth | PLANNED | Requires provider credentials and redirect URLs |
| Super Admin dashboard | PLANNED | /admin is an informational placeholder only |
| Payment destination configuration | PLANNED | Must be managed in admin/settings |
| Automated payment gateway | PLANNED | After manual payment workflow is audited |
| Custom DokanKhata domain | PLANNED | Current joy-shoes.vercel.app retained temporarily |
| PWA / offline mode | PLANNED | Add after core transaction flow stabilizes |
| JOY SHOES demo data cleanup | DONE | Demo sales, expenses, supplier, supplier payment, employee, employee sales, cash closing and audit rows cleared; shop/account/membership/trial retained |
| Full shop_id migration of legacy data | PLANNED | Preserve the JOY SHOES shop/account; the old demo ledger was intentionally cleared |
