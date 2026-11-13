-- Indexes applied as migration version 20261113134251.
create index if not exists shops_owner_id_idx on public.shops(owner_id);
create index if not exists shop_sales_created_by_idx on public.shop_sales(created_by);
create index if not exists shop_sales_shop_owner_pair_idx on public.shop_sales(shop_id,owner_id);
create index if not exists shop_expenses_created_by_idx on public.shop_expenses(created_by);
create index if not exists shop_expenses_shop_owner_pair_idx on public.shop_expenses(shop_id,owner_id);
create index if not exists subscriptions_shop_owner_pair_idx on public.subscriptions(shop_id,owner_id);
create index if not exists subscription_payments_shop_owner_pair_idx on public.subscription_payments(shop_id,owner_id);
create index if not exists subscription_payments_subscription_id_idx on public.subscription_payments(subscription_id);
