# DokanKhata — Feature Status & Roadmap

Status meanings: LIVE FOUNDATION = code/database exists; PARTIAL = usable slice only; PLANNED = not implemented.

| Feature | Status | Notes |
|---|---|---|
| DokanKhata branding and root experience | LIVE FOUNDATION | Root route now loads modular app |
| Email/password login and registration | LIVE FOUNDATION | Email confirmation follows Supabase project configuration |
| Owner profile | LIVE FOUNDATION | Name and phone; phone verification pending |
| Shop category onboarding | LIVE FOUNDATION | Six category types |
| Multiple shop records per owner | LIVE FOUNDATION | Database uniqueness restriction removed |
| Shop switcher | LIVE FOUNDATION | UI uses selected shop ID |
| Shop profile and media | LIVE FOUNDATION | Name, category, phone, address, logo and cover |
| Product catalog and search | LIVE FOUNDATION | Per-shop product table |
| Multiple sale entries per day | LIVE FOUNDATION | shop_sales |
| Quick expense categories | LIVE FOUNDATION | shop_expenses |
| Seven-day trial | LIVE FOUNDATION | One subscription row per shop |
| ৳২০০ / shop / month plan | LIVE FOUNDATION | Plan and payment-request schema |
| Manual bKash / Nagad request | PARTIAL | Customer can submit; admin verification is not ready |
| Dashboard current-shop sales / expense stats | LIVE FOUNDATION | Uses new shop-scoped tables only |
| Suppliers / supplier ledger | PLANNED for tenancy migration | Existing screen preserved under /workspace |
| Purchases / purchase returns | PLANNED for tenancy migration | Old RPCs currently use owner_id |
| Employees / attribution | PLANNED for tenancy migration | Keep employee sale attribution from double-counting |
| Daily cash closing | PLANNED for tenancy migration | Existing owner-scoped rows preserved |
| Full monthly/profit report | PARTIAL | New shop entry summary only; full report later |
| Phone OTP verification | PLANNED | Requires SMS provider and Supabase Auth setup |
| Google OAuth | PLANNED | Requires provider credentials and redirect URLs |
| Super Admin dashboard | PLANNED | /admin is an informational placeholder only |
| Payment destination configuration | PLANNED | Must be managed in admin/settings |
| Automated payment gateway | PLANNED | After manual payment workflow is audited |
| Custom DokanKhata domain | PLANNED | Current joy-shoes.vercel.app retained temporarily |
| PWA / offline mode | PLANNED | Add after core transaction flow stabilizes |
| Full shop_id migration of legacy data | PLANNED | Preserve JOY SHOES, migrate and regression-test |
