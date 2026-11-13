-- DokanKhata SaaS core foundation.
-- Applied to production as migration version 20261113132632.
-- Additive only; all historical JOY SHOES accounting data is retained.

alter table public.shops drop constraint if exists shops_one_per_owner;
alter table public.shops add constraint shops_id_owner_id_unique unique (id, owner_id);

create table if not exists public.owner_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.owner_profiles enable row level security;
create policy owner_profiles_select_own on public.owner_profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy owner_profiles_insert_own on public.owner_profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy owner_profiles_update_own on public.owner_profiles
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
grant select, insert, update on public.owner_profiles to authenticated;

create table if not exists public.shop_sales (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null,
  owner_id uuid not null,
  sale_date date not null default (now() at time zone 'Asia/Dhaka')::date,
  sold_at timestamptz not null default now(),
  amount numeric(14,2) not null check (amount > 0),
  cost_amount numeric(14,2) check (cost_amount is null or cost_amount >= 0),
  payment_method text not null default 'cash'
    check (payment_method in ('cash','bkash','nagad','rocket','bank','other')),
  seller_name text,
  notes text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  constraint shop_sales_shop_owner_fkey foreign key (shop_id, owner_id)
    references public.shops(id, owner_id) on delete cascade
);
alter table public.shop_sales enable row level security;
create policy shop_sales_select_member on public.shop_sales for select to authenticated using (
  exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = (select auth.uid()))
  or exists (select 1 from public.shop_memberships m where m.shop_id = shop_sales.shop_id
    and m.user_id = (select auth.uid()) and m.status = 'active')
);
create policy shop_sales_insert_member on public.shop_sales for insert to authenticated with check (
  created_by = (select auth.uid()) and
  (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = (select auth.uid()))
   or exists (select 1 from public.shop_memberships m where m.shop_id = shop_sales.shop_id
     and m.user_id = (select auth.uid()) and m.status = 'active'))
);
create policy shop_sales_update_member on public.shop_sales for update to authenticated
  using (
    exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = (select auth.uid()))
    or exists (select 1 from public.shop_memberships m where m.shop_id = shop_sales.shop_id
      and m.user_id = (select auth.uid()) and m.status = 'active')
  )
  with check (
    created_by = (select auth.uid()) and
    (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = (select auth.uid()))
     or exists (select 1 from public.shop_memberships m where m.shop_id = shop_sales.shop_id
       and m.user_id = (select auth.uid()) and m.status = 'active'))
  );
create policy shop_sales_delete_member on public.shop_sales for delete to authenticated using (
  exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = (select auth.uid()))
  or exists (select 1 from public.shop_memberships m where m.shop_id = shop_sales.shop_id
    and m.user_id = (select auth.uid()) and m.status = 'active' and m.role in ('owner','manager'))
);
grant select, insert, update, delete on public.shop_sales to authenticated;

create table if not exists public.shop_expenses (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null,
  owner_id uuid not null,
  expense_date date not null default (now() at time zone 'Asia/Dhaka')::date,
  category text not null check (category in ('business','hand','employee_payment','owner_withdrawal','other')),
  description text not null,
  amount numeric(14,2) not null check (amount > 0),
  payment_method text not null default 'cash'
    check (payment_method in ('cash','bkash','nagad','rocket','bank','other')),
  notes text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  constraint shop_expenses_shop_owner_fkey foreign key (shop_id, owner_id)
    references public.shops(id, owner_id) on delete cascade
);
alter table public.shop_expenses enable row level security;
create policy shop_expenses_select_member on public.shop_expenses for select to authenticated using (
  exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = (select auth.uid()))
  or exists (select 1 from public.shop_memberships m where m.shop_id = shop_expenses.shop_id
    and m.user_id = (select auth.uid()) and m.status = 'active')
);
create policy shop_expenses_insert_member on public.shop_expenses for insert to authenticated with check (
  created_by = (select auth.uid()) and
  (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = (select auth.uid()))
   or exists (select 1 from public.shop_memberships m where m.shop_id = shop_expenses.shop_id
     and m.user_id = (select auth.uid()) and m.status = 'active'))
);
create policy shop_expenses_update_member on public.shop_expenses for update to authenticated
  using (
    exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = (select auth.uid()))
    or exists (select 1 from public.shop_memberships m where m.shop_id = shop_expenses.shop_id
      and m.user_id = (select auth.uid()) and m.status = 'active')
  )
  with check (
    created_by = (select auth.uid()) and
    (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = (select auth.uid()))
     or exists (select 1 from public.shop_memberships m where m.shop_id = shop_expenses.shop_id
       and m.user_id = (select auth.uid()) and m.status = 'active'))
  );
create policy shop_expenses_delete_member on public.shop_expenses for delete to authenticated using (
  exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = (select auth.uid()))
  or exists (select 1 from public.shop_memberships m where m.shop_id = shop_expenses.shop_id
    and m.user_id = (select auth.uid()) and m.status = 'active' and m.role in ('owner','manager'))
);
grant select, insert, update, delete on public.shop_expenses to authenticated;

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
  constraint subscriptions_shop_owner_fkey foreign key (shop_id, owner_id)
    references public.shops(id, owner_id) on delete cascade
);
alter table public.subscriptions enable row level security;
create policy subscriptions_owner_select on public.subscriptions for select to authenticated
  using (owner_id = (select auth.uid()));
create policy subscriptions_owner_insert_trial on public.subscriptions for insert to authenticated
  with check (
    owner_id = (select auth.uid()) and plan_code = 'starter' and status = 'trialing'
    and trial_ends_at <= now() + interval '7 days' and trial_ends_at > now()
  );
grant select, insert on public.subscriptions to authenticated;

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
  constraint subscription_payments_shop_owner_fkey foreign key (shop_id, owner_id)
    references public.shops(id, owner_id) on delete cascade
);
alter table public.subscription_payments enable row level security;
create policy subscription_payments_owner_select on public.subscription_payments for select to authenticated
  using (owner_id = (select auth.uid()));
create policy subscription_payments_owner_insert on public.subscription_payments for insert to authenticated
  with check (
    owner_id = (select auth.uid()) and status = 'pending' and amount = 200
    and exists (select 1 from public.subscriptions sub
      where sub.id = subscription_id and sub.shop_id = shop_id and sub.owner_id = (select auth.uid()))
  );
grant select, insert on public.subscription_payments to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dokankhata-shop-media','dokankhata-shop-media',true,5242880,
  array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;

create policy dokankhata_shop_media_insert on storage.objects for insert to authenticated with check (
  bucket_id='dokankhata-shop-media'
  and exists (select 1 from public.shops s
    where s.id::text=(storage.foldername(name))[1]
    and (s.owner_id=(select auth.uid()) or exists (
      select 1 from public.shop_memberships m where m.shop_id=s.id
       and m.user_id=(select auth.uid()) and m.status='active')))
);
create policy dokankhata_shop_media_delete on storage.objects for delete to authenticated using (
  bucket_id='dokankhata-shop-media'
  and exists (select 1 from public.shops s
    where s.id::text=(storage.foldername(name))[1]
    and (s.owner_id=(select auth.uid()) or exists (
      select 1 from public.shop_memberships m where m.shop_id=s.id
       and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','manager'))))
);

insert into public.subscriptions(shop_id,owner_id,plan_code,status)
select s.id,s.owner_id,'starter','trialing' from public.shops s
on conflict (shop_id) do nothing;
