-- JOY SHOES initial Supabase schema
create extension if not exists pgcrypto;
create table if not exists public.owners (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 created_at timestamptz not null default now()
);
create table if not exists public.suppliers (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.owners(id) on delete cascade,
 owner_name text not null, shop_name text, phone text, address text,
 location_text text, photo_path text, notes text,
 opening_balance numeric(14,2) not null default 0 check(opening_balance>=0),
 created_at timestamptz not null default now()
);
create table if not exists public.daily_sales (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.owners(id) on delete cascade,
 sale_date date not null,
 entry_mode text not null check(entry_mode in ('total_only','cost_and_sale')),
 total_sales numeric(14,2) not null check(total_sales>=0),
 cost_of_goods_sold numeric(14,2),
 notes text, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(owner_id,sale_date),
 check((entry_mode='total_only' and cost_of_goods_sold is null) or
 (entry_mode='cost_and_sale' and cost_of_goods_sold is not null and cost_of_goods_sold>=0))
);
alter table public.owners enable row level security;
alter table public.suppliers enable row level security;
alter table public.daily_sales enable row level security;
create policy "owner reads own profile" on public.owners for select to authenticated using(id=auth.uid());
create policy "owner updates own profile" on public.owners for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy "owner manages own suppliers" on public.suppliers for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "owner manages own daily sales" on public.daily_sales for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
