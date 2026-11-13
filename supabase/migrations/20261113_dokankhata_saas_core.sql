-- DokanKhata SaaS core schema
-- Reconstructed from the verified production schema on 2026-11-13.
-- Additive migration: existing JOY SHOES accounting tables and records remain untouched.
-- Run after 20261113_dokankhata_shop_catalog.sql.

begin;

-- A user may own multiple shops. Keep the pair unique for tenant-safe composite references.
alter table public.shops drop constraint if exists shops_one_per_owner;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.shops'::regclass
      and conname = 'shops_id_owner_id_unique'
  ) then
    alter table public.shops
      add constraint shops_id_owner_id_unique unique (id, owner_id);
  end if;
end $$;
create index if not exists shops_owner_id_idx on public.shops(owner_id);

create table if not exists public.owner_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_sales (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null,
  owner_id uuid not null,
  sale_date date not null default ((now() at time zone 'Asia/Dhaka')::date),
  sold_at timestamptz not null default now(),
  amount numeric(14,2) not null check (amount > 0),
  cost_amount numeric(14,2) check (cost_amount is null or cost_amount >= 0),
  payment_method text not null default 'cash'
    check (payment_method in ('cash','bkash','nagad','rocket','bank','other')),
  seller_name text,
  notes text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  constraint shop_sales_shop_owner_fkey
    foreign key (shop_id, owner_id) references public.shops(id, owner_id) on delete cascade
);

create table if not exists public.shop_expenses (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null,
  owner_id uuid not null,
  expense_date date not null default ((now() at time zone 'Asia/Dhaka')::date),
  category text not null
    check (category in ('business','hand','employee_payment','owner_withdrawal','other')),
  description text not null,
  amount numeric(14,2) not null check (amount > 0),
  payment_method text not null default 'cash'
    check (payment_method in ('cash','bkash','nagad','rocket','bank','other')),
  notes text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  constraint shop_expenses_shop_owner_fkey
    foreign key (shop_id, owner_id) references public.shops(id, owner_id) on delete cascade
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null unique,
  owner_id uuid not null,
  plan_code text not null default 'starter' check (plan_code = 'starter'),
  status text not null default 'trialing'
    check (status in ('trialing','active','past_due','expired','cancelled')),
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '7 days'),
  current_period_started_at timestamptz,
  current_period_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_shop_owner_fkey
    foreign key (shop_id, owner_id) references public.shops(id, owner_id) on delete cascade
);

create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null,
  owner_id uuid not null,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  amount numeric(14,2) not null default 200 check (amount = 200),
  payment_method text not null check (payment_method in ('bkash','nagad')),
  sender_phone text not null,
  transaction_id text not null,
  proof_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  admin_note text,
  constraint subscription_payments_shop_owner_fkey
    foreign key (shop_id, owner_id) references public.shops(id, owner_id) on delete cascade
);

create index if not exists shop_memberships_user_id_idx on public.shop_memberships(user_id);
create index if not exists products_created_by_idx on public.products(created_by);
create index if not exists shops_owner_id_idx on public.shops(owner_id);
create index if not exists shop_sales_shop_date_idx on public.shop_sales(shop_id, sale_date desc);
create index if not exists shop_sales_owner_idx on public.shop_sales(owner_id);
create index if not exists shop_sales_created_by_idx on public.shop_sales(created_by);
create index if not exists shop_sales_shop_owner_pair_idx on public.shop_sales(shop_id, owner_id);
create index if not exists shop_expenses_shop_date_idx on public.shop_expenses(shop_id, expense_date desc);
create index if not exists shop_expenses_owner_idx on public.shop_expenses(owner_id);
create index if not exists shop_expenses_created_by_idx on public.shop_expenses(created_by);
create index if not exists shop_expenses_shop_owner_pair_idx on public.shop_expenses(shop_id, owner_id);
create index if not exists subscriptions_owner_idx on public.subscriptions(owner_id);
create index if not exists subscriptions_shop_owner_pair_idx on public.subscriptions(shop_id, owner_id);
create index if not exists subscription_payments_shop_submitted_idx
  on public.subscription_payments(shop_id, submitted_at desc);
create index if not exists subscription_payments_subscription_id_idx
  on public.subscription_payments(subscription_id);
create index if not exists subscription_payments_shop_owner_pair_idx
  on public.subscription_payments(shop_id, owner_id);

alter table public.owner_profiles enable row level security;
alter table public.shop_sales enable row level security;
alter table public.shop_expenses enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_payments enable row level security;

-- Owner profile: only the authenticated identity may read or edit its own profile.
drop policy if exists owner_profiles_select_own on public.owner_profiles;
create policy owner_profiles_select_own on public.owner_profiles
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists owner_profiles_insert_own on public.owner_profiles;
create policy owner_profiles_insert_own on public.owner_profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists owner_profiles_update_own on public.owner_profiles;
create policy owner_profiles_update_own on public.owner_profiles
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Shop sales: tenant owner or an active member of this exact shop only.
drop policy if exists shop_sales_select_member on public.shop_sales;
create policy shop_sales_select_member on public.shop_sales
  for select to authenticated using (
    exists (select 1 from public.shops s
      where s.id = shop_sales.shop_id and s.owner_id = (select auth.uid()))
    or exists (select 1 from public.shop_memberships m
      where m.shop_id = shop_sales.shop_id and m.user_id = (select auth.uid()) and m.status = 'active')
  );
drop policy if exists shop_sales_insert_member on public.shop_sales;
create policy shop_sales_insert_member on public.shop_sales
  for insert to authenticated with check (
    created_by = (select auth.uid()) and (
      exists (select 1 from public.shops s
        where s.id = shop_sales.shop_id and s.owner_id = (select auth.uid()))
      or exists (select 1 from public.shop_memberships m
        where m.shop_id = shop_sales.shop_id and m.user_id = (select auth.uid()) and m.status = 'active')
    )
  );
drop policy if exists shop_sales_update_member on public.shop_sales;
create policy shop_sales_update_member on public.shop_sales
  for update to authenticated using (
    exists (select 1 from public.shops s
      where s.id = shop_sales.shop_id and s.owner_id = (select auth.uid()))
    or exists (select 1 from public.shop_memberships m
      where m.shop_id = shop_sales.shop_id and m.user_id = (select auth.uid()) and m.status = 'active')
  ) with check (
    created_by = (select auth.uid()) and (
      exists (select 1 from public.shops s
        where s.id = shop_sales.shop_id and s.owner_id = (select auth.uid()))
      or exists (select 1 from public.shop_memberships m
        where m.shop_id = shop_sales.shop_id and m.user_id = (select auth.uid()) and m.status = 'active')
    )
  );
drop policy if exists shop_sales_delete_member on public.shop_sales;
create policy shop_sales_delete_member on public.shop_sales
  for delete to authenticated using (
    exists (select 1 from public.shops s
      where s.id = shop_sales.shop_id and s.owner_id = (select auth.uid()))
    or exists (select 1 from public.shop_memberships m
      where m.shop_id = shop_sales.shop_id and m.user_id = (select auth.uid())
        and m.status = 'active' and m.role in ('owner','manager'))
  );

-- Shop expenses: the same per-shop isolation and actor attribution rules.
drop policy if exists shop_expenses_select_member on public.shop_expenses;
create policy shop_expenses_select_member on public.shop_expenses
  for select to authenticated using (
    exists (select 1 from public.shops s
      where s.id = shop_expenses.shop_id and s.owner_id = (select auth.uid()))
    or exists (select 1 from public.shop_memberships m
      where m.shop_id = shop_expenses.shop_id and m.user_id = (select auth.uid()) and m.status = 'active')
  );
drop policy if exists shop_expenses_insert_member on public.shop_expenses;
create policy shop_expenses_insert_member on public.shop_expenses
  for insert to authenticated with check (
    created_by = (select auth.uid()) and (
      exists (select 1 from public.shops s
        where s.id = shop_expenses.shop_id and s.owner_id = (select auth.uid()))
      or exists (select 1 from public.shop_memberships m
        where m.shop_id = shop_expenses.shop_id and m.user_id = (select auth.uid()) and m.status = 'active')
    )
  );
drop policy if exists shop_expenses_update_member on public.shop_expenses;
create policy shop_expenses_update_member on public.shop_expenses
  for update to authenticated using (
    exists (select 1 from public.shops s
      where s.id = shop_expenses.shop_id and s.owner_id = (select auth.uid()))
    or exists (select 1 from public.shop_memberships m
      where m.shop_id = shop_expenses.shop_id and m.user_id = (select auth.uid()) and m.status = 'active')
  ) with check (
    created_by = (select auth.uid()) and (
      exists (select 1 from public.shops s
        where s.id = shop_expenses.shop_id and s.owner_id = (select auth.uid()))
      or exists (select 1 from public.shop_memberships m
        where m.shop_id = shop_expenses.shop_id and m.user_id = (select auth.uid()) and m.status = 'active')
    )
  );
drop policy if exists shop_expenses_delete_member on public.shop_expenses;
create policy shop_expenses_delete_member on public.shop_expenses
  for delete to authenticated using (
    exists (select 1 from public.shops s
      where s.id = shop_expenses.shop_id and s.owner_id = (select auth.uid()))
    or exists (select 1 from public.shop_memberships m
      where m.shop_id = shop_expenses.shop_id and m.user_id = (select auth.uid())
        and m.status = 'active' and m.role in ('owner','manager'))
  );

-- Subscriptions are visible to the shop owner. Client may create only a seven-day Starter trial.
drop policy if exists subscriptions_owner_select on public.subscriptions;
create policy subscriptions_owner_select on public.subscriptions
  for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists subscriptions_owner_insert_trial on public.subscriptions;
create policy subscriptions_owner_insert_trial on public.subscriptions
  for insert to authenticated with check (
    owner_id = (select auth.uid())
    and plan_code = 'starter'
    and status = 'trialing'
    and trial_ends_at > now()
    and trial_ends_at <= now() + interval '7 days'
  );

-- Customers can submit only fixed-price, pending requests for their own shop subscription.
-- No client update/approval policy is created.
drop policy if exists subscription_payments_owner_select on public.subscription_payments;
create policy subscription_payments_owner_select on public.subscription_payments
  for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists subscription_payments_owner_insert on public.subscription_payments;
create policy subscription_payments_owner_insert on public.subscription_payments
  for insert to authenticated with check (
    owner_id = (select auth.uid())
    and status = 'pending'
    and amount = 200
    and exists (
      select 1 from public.subscriptions sub
      where sub.id = subscription_payments.subscription_id
        and sub.shop_id = subscription_payments.shop_id
        and sub.owner_id = subscription_payments.owner_id
        and sub.owner_id = (select auth.uid())
    )
  );

grant select, insert, update on public.owner_profiles to authenticated;
grant select, insert, update, delete on public.shop_sales to authenticated;
grant select, insert, update, delete on public.shop_expenses to authenticated;
grant select, insert on public.subscriptions to authenticated;
grant select, insert on public.subscription_payments to authenticated;

-- Atomic onboarding: create the shop, owner membership and 7-day trial together.
create or replace function public.create_shop_with_trial(
  p_name text,
  p_category text,
  p_phone text default null,
  p_address text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $function$
declare
  v_user_id uuid := auth.uid();
  v_shop_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_name is null or char_length(btrim(p_name)) < 2 then
    raise exception 'Shop name must contain at least 2 characters';
  end if;

  if p_category not in ('footwear','cosmetics','grocery','clothing','electronics','other') then
    raise exception 'Unsupported shop category';
  end if;

  insert into public.owners(id)
  values (v_user_id)
  on conflict (id) do nothing;

  insert into public.shops(owner_id, name, category, phone, address)
  values (
    v_user_id,
    btrim(p_name),
    p_category,
    nullif(btrim(coalesce(p_phone,'')), ''),
    nullif(btrim(coalesce(p_address,'')), '')
  )
  returning id into v_shop_id;

  insert into public.shop_memberships(shop_id, user_id, role, status)
  values (v_shop_id, v_user_id, 'owner', 'active');

  insert into public.subscriptions(shop_id, owner_id, plan_code, status)
  values (v_shop_id, v_user_id, 'starter', 'trialing');

  return v_shop_id;
end;
$function$;

revoke all on function public.create_shop_with_trial(text,text,text,text) from public, anon;
grant execute on function public.create_shop_with_trial(text,text,text,text) to authenticated;

-- Public image delivery; uploads/deletes are scoped to a shop UUID in the object path.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dokankhata-shop-media','dokankhata-shop-media',true,5242880,
  array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists dokankhata_shop_media_insert on storage.objects;
create policy dokankhata_shop_media_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'dokankhata-shop-media'
    and exists (
      select 1 from public.shops s
      where s.id::text = (storage.foldername(name))[1]
        and (s.owner_id = (select auth.uid()) or exists (
          select 1 from public.shop_memberships m
          where m.shop_id = s.id and m.user_id = (select auth.uid()) and m.status = 'active'
        ))
    )
  );

drop policy if exists dokankhata_shop_media_delete on storage.objects;
create policy dokankhata_shop_media_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'dokankhata-shop-media'
    and exists (
      select 1 from public.shops s
      where s.id::text = (storage.foldername(name))[1]
        and (s.owner_id = (select auth.uid()) or exists (
          select 1 from public.shop_memberships m
          where m.shop_id = s.id and m.user_id = (select auth.uid())
            and m.status = 'active' and m.role in ('owner','manager')
        ))
    )
  );

commit;
