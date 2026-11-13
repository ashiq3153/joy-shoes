-- Fix payment/shop binding and add tenant-key index coverage.
-- Applied to production as migration version 20261113150848.

drop policy if exists subscription_payments_owner_insert on public.subscription_payments;
create policy subscription_payments_owner_insert
on public.subscription_payments
for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and status = 'pending'
  and amount = 200
  and exists (
    select 1
    from public.subscriptions sub
    where sub.id = subscription_payments.subscription_id
      and sub.shop_id = subscription_payments.shop_id
      and sub.owner_id = subscription_payments.owner_id
      and sub.owner_id = (select auth.uid())
  )
);

create index if not exists shops_owner_id_idx on public.shops(owner_id);
create index if not exists shop_sales_created_by_idx on public.shop_sales(created_by);
create index if not exists shop_sales_shop_owner_idx on public.shop_sales(shop_id, owner_id);
create index if not exists shop_expenses_created_by_idx on public.shop_expenses(created_by);
create index if not exists shop_expenses_shop_owner_idx on public.shop_expenses(shop_id, owner_id);
create index if not exists subscriptions_shop_owner_idx on public.subscriptions(shop_id, owner_id);
create index if not exists subscription_payments_shop_owner_idx on public.subscription_payments(shop_id, owner_id);
create index if not exists subscription_payments_subscription_idx on public.subscription_payments(subscription_id);
