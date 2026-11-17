-- Phase 0 security hardening:
-- Membership creation is performed by create_shop_with_trial.
-- No customer-facing membership edit flow exists, so clients must not
-- be able to reassign an owner membership to another shop.
DROP POLICY IF EXISTS "shop_memberships_owner_update" ON public.shop_memberships;

REVOKE UPDATE ON TABLE public.shop_memberships
  FROM PUBLIC, anon, authenticated;
