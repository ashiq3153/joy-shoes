-- Atomically create one shop, owner membership and its 7-day Starter trial.
-- This function intentionally uses SECURITY INVOKER (the PostgreSQL default).
-- Existing owner/shop data is not modified.
-- Applied to production as migration version 20261113151126.

create or replace function public.create_shop_with_trial(
  p_name text,
  p_category text,
  p_phone text default null,
  p_address text default null
)
returns uuid
language plpgsql
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
