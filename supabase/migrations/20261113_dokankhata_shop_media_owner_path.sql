-- Shop media uploads use a two-segment path:
--   <authenticated user UUID>/<shop UUID>/<logo|cover>-<timestamp>.<ext>
-- This prevents the previously broken shop_id-first path policy and ensures
-- an authenticated user can only upload to a shop they own or actively belong to.
-- Public bucket means public downloads only; uploads/deletes remain RLS-protected.

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'dokankhata-shop-media',
  'dokankhata-shop-media',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists dokankhata_shop_media_insert on storage.objects;
create policy dokankhata_shop_media_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'dokankhata-shop-media'
  and (storage.foldername(objects.name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.shops s
    where s.id::text = (storage.foldername(objects.name))[2]
      and (
        s.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.shop_memberships m
          where m.shop_id = s.id
            and m.user_id = (select auth.uid())
            and m.status = 'active'
        )
      )
  )
);

drop policy if exists dokankhata_shop_media_delete on storage.objects;
create policy dokankhata_shop_media_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'dokankhata-shop-media'
  and (storage.foldername(objects.name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.shops s
    where s.id::text = (storage.foldername(objects.name))[2]
      and (
        s.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.shop_memberships m
          where m.shop_id = s.id
            and m.user_id = (select auth.uid())
            and m.status = 'active'
            and m.role in ('owner','manager')
        )
      )
  )
);
