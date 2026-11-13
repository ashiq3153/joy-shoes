-- DokanKhata SaaS foundation: shops, memberships and shop-scoped product catalog.
-- Additive only: legacy JOY SHOES accounting tables and rows are preserved.

begin;

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 100),
  category text not null check (category in ('footwear','cosmetics','grocery','clothing','electronics','other')),
  phone text,
  address text,
  logo_url text,
  cover_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shops_one_per_owner unique (owner_id)
);

create table if not exists public.shop_memberships (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','manager','staff')),
  status text not null default 'active' check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now(),
  constraint shop_memberships_unique_user unique (shop_id,user_id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_code text,
  product_name text not null check (char_length(btrim(product_name)) between 1 and 160),
  category text,
  brand text,
  barcode text,
  unit text not null default 'piece',
  purchase_price numeric(14,2) not null default 0 check (purchase_price >= 0),
  selling_price numeric(14,2) not null default 0 check (selling_price >= 0),
  stock_qty numeric(14,3) not null default 0 check (stock_qty >= 0),
  low_stock_at numeric(14,3) not null default 0 check (low_stock_at >= 0),
  is_active boolean not null default true,
  notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists products_shop_code_unique
  on public.products(shop_id, product_code) where product_code is not null and btrim(product_code) <> '';
create index if not exists products_shop_name_idx on public.products(shop_id, product_name);
create index if not exists products_shop_barcode_idx on public.products(shop_id, barcode);
create index if not exists products_created_by_idx on public.products(created_by);
create index if not exists shop_memberships_user_id_idx on public.shop_memberships(user_id);

alter table public.shops enable row level security;
alter table public.shop_memberships enable row level security;
alter table public.products enable row level security;

drop policy if exists shops_owner_select on public.shops;
create policy shops_owner_select on public.shops
  for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists shops_owner_insert on public.shops;
create policy shops_owner_insert on public.shops
  for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists shops_owner_update on public.shops;
create policy shops_owner_update on public.shops
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists shop_memberships_self_select on public.shop_memberships;
create policy shop_memberships_self_select on public.shop_memberships
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists shop_memberships_owner_insert on public.shop_memberships;
create policy shop_memberships_owner_insert on public.shop_memberships
  for insert to authenticated with check (
    user_id = (select auth.uid()) and role = 'owner'
    and exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = (select auth.uid()))
  );
drop policy if exists shop_memberships_owner_update on public.shop_memberships;
create policy shop_memberships_owner_update on public.shop_memberships
  for update to authenticated using (user_id = (select auth.uid()) and role = 'owner')
  with check (user_id = (select auth.uid()) and role = 'owner');

drop policy if exists products_member_select on public.products;
create policy products_member_select on public.products
  for select to authenticated using (
    exists (select 1 from public.shop_memberships m
      where m.shop_id = products.shop_id and m.user_id = (select auth.uid()) and m.status = 'active')
    or exists (select 1 from public.shops s
      where s.id = products.shop_id and s.owner_id = (select auth.uid()))
  );
drop policy if exists products_member_insert on public.products;
create policy products_member_insert on public.products
  for insert to authenticated with check (
    exists (select 1 from public.shop_memberships m
      where m.shop_id = products.shop_id and m.user_id = (select auth.uid()) and m.status = 'active')
    or exists (select 1 from public.shops s
      where s.id = products.shop_id and s.owner_id = (select auth.uid()))
  );
drop policy if exists products_member_update on public.products;
create policy products_member_update on public.products
  for update to authenticated using (
    exists (select 1 from public.shop_memberships m
      where m.shop_id = products.shop_id and m.user_id = (select auth.uid()) and m.status = 'active')
    or exists (select 1 from public.shops s
      where s.id = products.shop_id and s.owner_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.shop_memberships m
      where m.shop_id = products.shop_id and m.user_id = (select auth.uid()) and m.status = 'active')
    or exists (select 1 from public.shops s
      where s.id = products.shop_id and s.owner_id = (select auth.uid()))
  );

-- Supabase's Data API no longer grants access to new public tables by default.
grant select, insert, update on public.shops to authenticated;
grant select, insert, update on public.shop_memberships to authenticated;
grant select, insert, update on public.products to authenticated;

-- Attach the existing owner's legacy JOY SHOES records to the first shop record
-- without changing, copying or deleting any accounting row.
insert into public.shops (owner_id, name, category)
select o.id, 'JOY SHOES', 'footwear'
from public.owners o
where
  exists (select 1 from public.daily_sales x where x.owner_id=o.id)
  or exists (select 1 from public.suppliers x where x.owner_id=o.id)
  or exists (select 1 from public.purchases x where x.owner_id=o.id)
  or exists (select 1 from public.expenses x where x.owner_id=o.id)
  or exists (select 1 from public.employees x where x.owner_id=o.id)
on conflict (owner_id) do nothing;

insert into public.shop_memberships (shop_id, user_id, role, status)
select s.id, s.owner_id, 'owner', 'active'
from public.shops s
on conflict (shop_id,user_id) do nothing;

commit;
