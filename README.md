# JOY SHOES

Mobile-first bookkeeping app for a footwear shop.

## Current status
Initial Next.js dashboard prototype. The sales input is currently a visual demo and is not yet connected to Supabase.

## Planned modules
- Daily sales: total-only or cost-and-sale detail
- Supplier profiles and supplier purchase ledger
- Multi-line purchase invoices and cash memo attachments
- Supplier payments and purchase returns
- Employee sales allocation and reports
- Business expenses and owner withdrawals
- Cash closing and reconciliation
- Owner-only authentication, audit trail, and reports

## Stack
Next.js, React, Tailwind CSS v4, Supabase PostgreSQL/Auth/Storage, Vercel.

## Run locally
`npm install` then `npm run dev`.

## Accounting rules
- Employee sales are a breakdown of daily sales, not additional sales.
- Supplier payments are not recorded again as operating expenses.
- Cash refunds are cash receipts; credit-adjustment returns reduce supplier dues.
- Total-only sales have unknown profit, not zero profit.
- Household withdrawals are owner draws, not operating expenses.

## Security
Before production, enable owner-scoped Supabase RLS. Never expose the service-role key in browser code.
