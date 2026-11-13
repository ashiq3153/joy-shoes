# JOY SHOES

Mobile-first, owner-only bookkeeping app for a footwear shop.

## Live application

- Production: https://joy-shoes.vercel.app
- GitHub: https://github.com/ashiq3153/joy-shoes
- Stack: Next.js, React, Tailwind CSS v4, Supabase PostgreSQL/Auth/Storage, Vercel

## Implemented modules

- Owner email/password signup and login
- Daily sales: total-only or sales plus cost of goods sold
- Update a daily sales record by date instead of creating a duplicate
- Supplier profiles and supplier-specific outstanding ledger
- Multi-line purchase invoices with paid amount and optional cash memo upload
- Supplier payments with cash movement records
- Purchase returns with separate credit-adjustment and cash-refund treatment
- Employee profiles, employee sales allocation and daily/weekly/monthly leaderboard
- Expenses with business, household withdrawal and other categories
- Daily cash reconciliation: expected vs actual cash
- Monthly sales, known gross profit, expenses and net-result summary
- Owner-scoped RLS and private storage bucket
- Audit entries for key inserts and changes

## Accounting rules

- Employee sales are a breakdown of total daily sales; never add them to daily sales again.
- Supplier payments reduce supplier outstanding; they are not operating expenses.
- A credit-adjustment return reduces supplier outstanding.
- A cash-refund return is recorded as cash received; it does not reduce supplier outstanding a second time.
- Total-only sales have unknown product profit, not zero profit.
- Household withdrawals are owner draws, not business operating expenses.
- Cash balance and accounting profit are different measures.

## Environment variables

Set these in Vercel and local `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Never expose a Supabase service-role or secret key in browser code or any `NEXT_PUBLIC_` variable.

## Run locally

```bash
npm install
npm run dev
```

## Remaining launch phases

1. Add safe edit/cancel/reversal workflows for financial records with complete before/after audit history.
2. Automate daily cash reconciliation from cash sales, receipts, supplier payments and expenses without double-counting.
3. Add date-range reports, PDF/CSV export and print layouts.
4. Add secure memo/photo preview and download.
5. Add installable PWA behavior and reliable offline/connection recovery.
6. Complete owner-device acceptance tests, backup and recovery checks, and Auth leaked-password protection.

## Security status

The public business tables have RLS enabled. The supplier ledger view uses `security_invoker=true`. Transaction RPCs are restricted to authenticated users. Enable leaked-password protection in Supabase Dashboard → Authentication → Settings before using real business data.
