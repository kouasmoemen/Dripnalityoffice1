-- Run after the core migration and 20260801_drop_02_tshirt.sql.
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do update set public = true;

create policy "Public product media is readable"
on storage.objects for select
using (bucket_id = 'product-media');

create policy "Admins upload product media"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-media' and public.is_admin());

create policy "Admins update product media"
on storage.objects for update to authenticated
using (bucket_id = 'product-media' and public.is_admin())
with check (bucket_id = 'product-media' and public.is_admin());

create policy "Admins delete product media"
on storage.objects for delete to authenticated
using (bucket_id = 'product-media' and public.is_admin());
