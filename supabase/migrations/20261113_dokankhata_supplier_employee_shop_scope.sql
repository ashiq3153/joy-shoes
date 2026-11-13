-- Scope legacy supplier and employee directories to a shop.
-- Additive migration: keep every existing row and existing owner_id unchanged.
-- Purchases, employee-sales attribution, cash flows and other accounting ledgers
-- remain owner-scoped pending their own migration.

begin;

alter table public.suppliers add column if not exists shop_id uuid;
alter table public.employees add column if not exists shop_id uuid;

update public.suppliers x
set shop_id = s.id
from public.shops s
where s.owner_id = x.owner_id and x.shop_id is null;

update public.employees x
set shop_id = s.id
from public.shops s
where s.owner_id = x.owner_id and x.shop_id is null;

do $$
begin
  if exists (select 1 from public.suppliers where shop_id is null) then
    raise exception 'Cannot backfill all suppliers to a shop. Map the remaining rows before continuing.';
  end if;
  if exists (select 1 from public.employees where shop_id is null) then
    raise exception 'Cannot backfill all employees to a shop. Map the remaining rows before continuing.';
  end if;
end $$;

alter table public.suppliers alter column shop_id set not null;
alter table public.employees alter column shop_id set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid='public.suppliers'::regclass and conname='suppliers_shop_owner_fkey') then
    alter table public.suppliers add constraint suppliers_shop_owner_fkey
      foreign key (shop_id, owner_id) references public.shops(id, owner_id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.suppliers'::regclass and conname='suppliers_id_shop_owner_unique') then
    alter table public.suppliers add constraint suppliers_id_shop_owner_unique unique (id, shop_id, owner_id);
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.employees'::regclass and conname='employees_shop_owner_fkey') then
    alter table public.employees add constraint employees_shop_owner_fkey
      foreign key (shop_id, owner_id) references public.shops(id, owner_id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.employees'::regclass and conname='employees_id_shop_owner_unique') then
    alter table public.employees add constraint employees_id_shop_owner_unique unique (id, shop_id, owner_id);
  end if;
end $$;

create index if not exists suppliers_shop_id_idx on public.suppliers(shop_id);
create index if not exists employees_shop_id_idx on public.employees(shop_id);
create index if not exists suppliers_shop_owner_pair_idx on public.suppliers(shop_id, owner_id);
create index if not exists employees_shop_owner_pair_idx on public.employees(shop_id, owner_id);

-- Keep existing output columns and their order; append shop_id for shop filtering.
-- security_invoker ensures the caller's table RLS applies to the view's base tables.
create or replace view public.supplier_ledger_view
with (security_invoker = true)
as
select
  s.id as supplier_id,
  s.owner_id,
  s.owner_name,
  s.shop_name,
  s.opening_balance
    + coalesce(p.total_purchases, 0::numeric)
    - coalesce(pay.total_payments, 0::numeric)
    - coalesce(ret.credit_returns, 0::numeric) as outstanding_balance,
  coalesce(p.total_purchases, 0::numeric) as total_purchases,
  coalesce(pay.total_payments, 0::numeric) as total_payments,
  coalesce(ret.credit_returns, 0::numeric) as credit_adjustment_returns,
  s.shop_id
from public.suppliers s
left join (
  select purchases.supplier_id, purchases.owner_id,
    sum(purchases.subtotal) as total_purchases
  from public.purchases
  group by purchases.supplier_id, purchases.owner_id
) p on p.supplier_id = s.id and p.owner_id = s.owner_id
left join (
  select supplier_payments.supplier_id, supplier_payments.owner_id,
    sum(supplier_payments.amount) as total_payments
  from public.supplier_payments
  group by supplier_payments.supplier_id, supplier_payments.owner_id
) pay on pay.supplier_id = s.id and pay.owner_id = s.owner_id
left join (
  select purchase_returns.supplier_id, purchase_returns.owner_id,
    sum(purchase_returns.total_amount) as credit_returns
  from public.purchase_returns
  where purchase_returns.settlement_type = 'credit_adjustment'
  group by purchase_returns.supplier_id, purchase_returns.owner_id
) ret on ret.supplier_id = s.id and ret.owner_id = s.owner_id;

commit;
