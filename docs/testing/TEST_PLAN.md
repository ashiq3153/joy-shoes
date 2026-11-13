# DokanKhata — Quality Assurance Test Plan

**Baseline:** 13 November 2026  
**Scope:** Customer-facing multi-shop foundation; full legacy accounting migration is not included.

## 1. Test environments
- Production app: `https://joy-shoes.vercel.app`
- Source branch: `main`
- Supabase project: the connected production project
- Test identities: at least two different authenticated owner accounts (A and B)
- Test shops: one shop owned by A and one shop owned by B; additional shop under A for multi-shop checks

Never use real customer money, genuine bKash/Nagad transaction IDs, or real customer records for test cases.

## 2. Functional smoke tests
| ID | Test | Expected result | Current status |
|---|---|---|---|
| AUTH-01 | Open homepage without a session | DokanKhata login/register screen renders | PASS — browser checked |
| AUTH-02 | Sign up with valid email/password | Auth account created; email confirmation follows Supabase settings | Not run with a real registration |
| SHOP-01 | Select business category | Six categories available | Code present; authenticated UI test pending |
| SHOP-02 | Create new shop | Shop + owner membership + seven-day Starter trial created atomically | PASS — RPC exercised; temporary test shop removed |
| SHOP-03 | Owner creates second shop | Both shops appear in the shop switcher | Database supports multiple; authenticated UI test pending |
| PROF-01 | Upload logo / cover | JPEG/PNG/WebP up to 5 MB stored under the shop UUID path | Policies and UI present; upload test pending |
| SALE-01 | Add multiple sales on one date | Each sale is a separate timestamped shop_sales row | Schema/UI present; full UI test pending |
| EXP-01 | Add expense | Shop-scoped expense row saved with one of the defined categories | Schema/UI present; full UI test pending |
| INV-01 | Add/search product | Product belongs only to selected shop | Schema/UI present; full UI test pending |
| BILL-01 | New shop trial | Separate trial row, seven days | PASS — RPC test |
| BILL-02 | Submit paid renewal | Customer payment form stays disabled until official receiver instructions and secure admin review exist | PASS — payment UI is held |
| ADMIN-01 | Open /admin | Clearly marked placeholder, not an admin control surface | PASS — browser checked |

## 3. Tenant-isolation tests
| ID | Scenario | Expected result | Current status |
|---|---|---|---|
| RLS-01 | User B reads User A's shops | Zero rows | PASS — SQL smoke test |
| RLS-02 | User B reads User A's shop_sales | Zero rows | PASS — SQL smoke test |
| RLS-03 | User B reads User A's shop_expenses | Zero rows | PASS — SQL smoke test |
| RLS-04 | User B reads User A's products | Zero rows | PASS — SQL smoke test |
| RLS-05 | User A creates own shop, membership and trial | All three created together | PASS — SQL smoke test |
| RLS-06 | User B attempts to insert a sale into User A's shop | RLS rejects the insert | PASS — SQL negative test returned 42501 row-level security violation |
| RLS-07 | Manager/staff permissions | Only active membership with permitted role can access shop | Pending; invitation/role UI not implemented |

The current tests are focused SQL smoke checks. Run the full matrix again after any policy, schema, RPC, or membership change. Do not claim the entire app is penetration-tested.

## 4. Regression tests for legacy JOY SHOES
- Confirm legacy daily_sales, suppliers, expenses and employees counts before and after a migration.
- Confirm legacy sales totals, supplier balances, purchase returns, employee attribution and daily closings match before/after.
- Confirm a second shop cannot read or mutate any legacy owner-scoped record until the full legacy shop_id migration is complete.
- Keep /workspace available to the primary legacy shop during the migration.

## 5. Release gates
1. Read docs/AI_HANDOFF.md, PRD.md, TRD.md and DRD.md.
2. Inspect live table definitions, policies, views, RPCs and storage rules.
3. Commit an additive migration and the corresponding migration file.
4. Run Supabase security/performance advisors.
5. Run two-account tenant isolation and negative-write tests.
6. Validate mobile viewport and keyboard/form behavior.
7. Confirm Vercel production deployment state is READY.
8. Check the public production homepage and /admin route.
9. Update docs/roadmap/FEATURE_STATUS.md with exact pass/fail status.

## 6. Known release blockers
- Full legacy accounting module tenancy migration.
- Authorized Super Admin login/allowlist, customer listing and payment review.
- Official bKash/Nagad receiver instructions.
- Subscription renewal approval and paid-access enforcement.
- Complete browser QA of registration, shop switching, media upload and all transaction screens.
- Supabase Auth leaked-password protection warning must be reviewed and enabled.
