-- DROP 02 catalog details. Run once in Supabase SQL Editor after the core migration.

alter table public.products add column if not exists sku text unique;

update public.products
set
  price_cents = 10000,
  currency = 'TND',
  sizes = array['S', 'M', 'L'],
  sku = case slug
    when 'black-signature-zip' then 'DRP-HZ-001'
    when 'brown-archive-zip' then 'DRP-HZ-002'
    else sku
  end,
  is_sold_out = true,
  updated_at = now()
where slug in ('black-signature-zip', 'brown-archive-zip');

insert into public.drops (slug, title, description, status, is_published, starts_at)
values ('drop-02', 'DROP 02 / MULTI-BALACLAVAS', 'DRIPNALITY oversized multi-balaclavas white T-shirt.', 'live', true, now())
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.products (drop_id, slug, sku, name, description, price_cents, currency, color, category, cover_image, gallery, sizes, inventory, is_sold_out, is_published, sort_order)
select
  drops.id,
  'drp-ts-003',
  'DRP-TS-003',
  'Dripnality’s Oversized Multi-Balaclavas White T-Shirt',
  'Oversized white T-shirt from the DRIPNALITY Multi-Balaclavas release.',
  6000,
  'TND',
  'White',
  'tshirts',
  '/tshirt-drop/T12.jpeg',
  '["/tshirt-drop/T0.jpeg", "/tshirt-drop/T1.jpeg", "/tshirt-drop/T2.jpeg", "/tshirt-drop/T3.jpeg", "/tshirt-drop/T4.jpeg", "/tshirt-drop/T5.jpeg", "/tshirt-drop/T6.jpeg", "/tshirt-drop/T7.jpeg", "/tshirt-drop/T8.jpeg", "/tshirt-drop/T9.jpeg", "/tshirt-drop/T10.jpeg", "/tshirt-drop/T11.jpeg", "/tshirt-drop/T12.jpeg", "/tshirt-drop/T13.jpeg", "/tshirt-drop/T14.jpeg", "/tshirt-drop/T15.jpeg"]'::jsonb,
  array['S', 'M', 'L'],
  99,
  false,
  true,
  1
from public.drops drops
where drops.slug = 'drop-02'
on conflict (slug) do update set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  color = excluded.color,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  sizes = excluded.sizes,
  inventory = excluded.inventory,
  is_sold_out = false,
  is_published = true,
  updated_at = now();
