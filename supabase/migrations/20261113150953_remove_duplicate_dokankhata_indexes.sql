-- Keep the original *_pair_idx and *_subscription_id_idx indexes.
-- Remove only exact duplicates created during the subsequent policy hardening pass.
-- Applied to production as migration version 20261113150953.

drop index if exists public.shop_sales_shop_owner_idx;
drop index if exists public.shop_expenses_shop_owner_idx;
drop index if exists public.subscriptions_shop_owner_idx;
drop index if exists public.subscription_payments_shop_owner_idx;
drop index if exists public.subscription_payments_subscription_idx;
