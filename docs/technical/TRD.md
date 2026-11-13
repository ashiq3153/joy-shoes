# Technical Requirements Document (TRD)

**Version:** 1.0 · **Status:** Current implementation baseline

## 1. Technology stack
- Next.js 15 App Router
- React 19
- Plain JavaScript / JSX
- Tailwind CSS v4 dependency plus scoped CSS design system
- Supabase Auth, PostgreSQL, PostgREST, RLS and Storage
- Vercel deployment from GitHub main branch

## 2. Code organization
| Path | Responsibility |
|---|---|
| app/ | Next.js routes and global CSS |
| app/page.js | Thin root route; renders the app controller |
| app/workspace/page.js | Preserved legacy accounting workspace |
| app/admin/page.js | Explicit placeholder until secure admin phase |
| src/components/AppClient.jsx | Auth/session orchestration and shop state; calls atomic shop onboarding RPC; guards async active-shop refresh races |
| src/components/auth/ | Login and registration UI |
| src/components/onboarding/ | Shop category and profile onboarding |
| src/components/dashboard/ | Dashboard home, shell and navigation |
| src/components/modules/ | Sales, expenses and product modules |
| src/components/profile/ | Shop and owner profile |
| src/components/subscription/ | Trial, plan and manual payment UI |
| src/lib/dokankhata/ | Product constants and reusable formatters |
| lib/supabase/ | Supabase browser client |
| supabase/migrations/ | Versioned database migrations |
| docs/ | BRD, PRD, TRD, DRD, ADR, QA test plan and AI handoff documentation |

## 3. Engineering conventions
- Keep app/page.js as a route adapter; do not rebuild the product in one giant page file.
- Keep each screen in a dedicated component; shared business constants live in src/lib/dokankhata.
- Prefer explicit component props over global mutable state.
- Put database operations in the app controller initially; extract feature services as the number of modules grows.
- Every new tenant-owned row must include shop_id and owner_id. created_by identifies the authenticated actor.
- Shop creation must use `public.create_shop_with_trial` so shop, owner membership and trial are inserted atomically under SECURITY INVOKER and RLS.
- Read the current shop_id from validated application state; RLS is the final authorization boundary.
- Keep money values numeric in PostgreSQL. Format only at the UI boundary.
- Store timestamps as timestamptz; use Asia/Dhaka for business-date presentation.
- Never use a browser-exposed Supabase secret/service-role key.
- Never use user_metadata for authorization.

## 4. Authentication and profile
- Email/password uses Supabase Auth.
- Display name and phone are stored in owner_profiles.
- Supabase user metadata may prefill profile fields only; it is not a trusted role source.
- Phone verification and Google OAuth require provider configuration and are not claimed active in this release.

## 5. Media
- Bucket: dokankhata-shop-media
- Public reads are used for shop logo and cover CDN URLs.
- Upload object path starts with the shop UUID.
- Storage INSERT and DELETE policies verify shop ownership or active membership.
- Allowed upload types: JPEG, PNG, WebP; maximum 5 MB.

## 6. Deployment / environment
Required public browser configuration:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

The secret/service-role key must remain server-side only. No new environment variable is required for the current frontend phase.

## 7. Quality gates
- Verify each migration on the connected Supabase project.
- Run Supabase security and performance advisors after DDL.
- Check Vercel production deployment state before announcing release.
- Use docs/testing/TEST_PLAN.md as the source of truth for repeatable functional and tenant-isolation checks.
- Validate registration/login, shop creation, shop switching, sale, expense, product CRUD, image upload and payment request.
- Test RLS with two distinct authenticated users and at least two shops before declaring tenant isolation complete. Current smoke test covered cross-user invisibility for shops, shop_sales, shop_expenses and products, plus a rejected cross-owner shop_sales insert. This is not a full security assessment; repeat the complete matrix after schema/policy changes.
