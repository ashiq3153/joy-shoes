# DokanKhata — Tenant Isolation & Release Smoke Tests

**Verification date:** 13 November 2026  
**Environment:** Production Supabase project and Vercel deployment  
**Purpose:** Record verified behavior without overstating full multi-tenant readiness.

## Results

| Test | Result | Notes |
|---|---|---|
| Shop visibility for owner A | PASS | Owner A sees only their own shop. |
| Shop visibility for owner B | PASS | Owner B sees only their own shop. |
| Cross-user sales isolation | PASS | A temporary sale inserted as owner A was invisible to owner B; transaction rolled back. |
| Cross-user expense isolation | PASS | A temporary expense inserted as owner A was invisible to owner B; transaction rolled back. |
| Atomic shop + owner membership + trial RPC | PASS | RPC returned a shop ID for a temporary test shop; the surrounding transaction was rolled back. |
| RPC privilege boundary | PASS | Function is SECURITY INVOKER; EXECUTE granted to authenticated and not anon. |
| Payment shop binding | PASS (policy inspection) | Pending payment INSERT now requires subscription_id, shop_id and owner_id to match the same subscription/shop. Full payment acceptance test is deferred until payment instructions/admin review exist. |
| Duplicate tenant indexes | PASS | Duplicate index groups introduced during hardening were removed. No duplicate-index advisor warnings remain. |
| Product RLS | PARTIAL | An earlier transactional RLS smoke test verified a different user could not see a test product. Repeat together with all other tenant tables in the complete regression suite. |
| Production root UI | PASS | Public URL opens DokanKhata login/marketing screen, not the old JOY SHOES root screen. |
| /admin route | PLACEHOLDER | Route opens but displays an informational placeholder only; it is not a Super Admin console. |

## Data preservation snapshot

At the time of verification:
- Shops: 2
- Shop subscriptions: 2
- New shop_sales rows: 0
- New shop_expenses rows: 0
- Legacy daily_sales rows: 1
- Legacy suppliers: 1
- Legacy expenses: 1
- Legacy employees: 1

Temporary isolation and RPC test rows were rolled back. The legacy accounting rows were not modified.

## Known remaining security / readiness work

1. Supabase Security Advisor still reports **Leaked Password Protection Disabled**. Enable it in Supabase Auth password security settings: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
2. Complete two-user RLS tests for products, subscriptions, subscription_payments and shop memberships, including malicious cross-shop references.
3. Add server-side Super Admin allowlist and protected admin APIs before exposing payment approval actions.
4. Configure real official bKash/Nagad receiver details and payment evidence collection; payment submission UI remains disabled until then.
5. Migrate legacy suppliers, purchases, employees, cash movements, daily closings, reports, views and RPC functions to shop_id with count/total parity tests.
6. Enforce trial expiry and paid subscription status on server/database operations; the current UI shows remaining trial days but does not yet block expired shops.

## Re-run checklist

- [ ] Login as two unrelated authenticated users.
- [ ] Each user sees only their own shop(s).
- [ ] A user cannot read another user's sales, expenses, products, employees, suppliers or billing rows.
- [ ] Cross-shop subscription references are rejected.
- [ ] Shop switcher never shows data from the previously selected shop after changing selection.
- [ ] New shop creation either creates shop + membership + trial together or creates none.
- [ ] Existing JOY SHOES record counts and balances remain unchanged.
- [ ] Supabase security/performance advisors reviewed.
- [ ] Vercel production deployment is READY and root + /admin + /workspace routes open.
