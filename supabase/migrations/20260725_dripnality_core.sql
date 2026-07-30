-- DRIPNALITY core commerce schema.
-- Run this migration once with the Supabase CLI or in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'staff', 'admin');
create type public.drop_status as enum ('draft', 'scheduled', 'live', 'archived');
create type public.order_status as enum ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role public.user_role not null default 'customer',
  early_access boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.drops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  status public.drop_status not null default 'draft',
  access_code text unique,
  starts_at timestamptz,
  ends_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  drop_id uuid references public.drops (id) on delete set null,
  slug text not null unique,
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  color text,
  category text not null default 'hoodies',
  cover_image text,
  hover_image text,
  hover_video text,
  gallery jsonb not null default '[]'::jsonb,
  sizes text[] not null default array['S', 'M', 'L', 'XL'],
  inventory integer not null default 0 check (inventory >= 0),
  is_sold_out boolean not null default true,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wishlist_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id, size)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  status public.order_status not null default 'pending',
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  shipping_address jsonb,
  stripe_checkout_session_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  size text,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  email text not null unique,
  source text not null default 'footer',
  early_access boolean not null default true,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create table public.support_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_profile_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger drops_updated_at before update on public.drops for each row execute procedure public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute procedure public.set_updated_at();
create trigger cart_items_updated_at before update on public.cart_items for each row execute procedure public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();
create trigger support_inquiries_updated_at before update on public.support_inquiries for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.drops enable row level security;
alter table public.products enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.subscribers enable row level security;
alter table public.support_inquiries enable row level security;

create policy "Profiles are readable by their owner" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "Profiles are editable by their owner" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = public.current_profile_role());
create policy "Admins can manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "Published drops are public" on public.drops for select using (is_published or public.is_admin());
create policy "Admins can manage drops" on public.drops for all using (public.is_admin()) with check (public.is_admin());

create policy "Published products are public" on public.products for select using (is_published or public.is_admin());
create policy "Admins can manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "Members manage their wishlist" on public.wishlist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Members manage their cart" on public.cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Members read their own orders" on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "Admins manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "Members read their own order items" on public.order_items for select using (
  exists (select 1 from public.orders where public.orders.id = order_id and (public.orders.user_id = auth.uid() or public.is_admin()))
);
create policy "Admins manage order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can subscribe" on public.subscribers for insert with check (true);
create policy "Members read their own subscription" on public.subscribers for select using (auth.uid() = user_id or public.is_admin());
create policy "Members update their own subscription" on public.subscribers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins manage subscribers" on public.subscribers for all using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can create an inquiry" on public.support_inquiries for insert with check (true);
create policy "Members read their own inquiries" on public.support_inquiries for select using (auth.uid() = user_id or public.is_admin());
create policy "Admins manage inquiries" on public.support_inquiries for all using (public.is_admin()) with check (public.is_admin());

insert into public.drops (slug, title, description, status, is_published, starts_at)
values ('drop-01', 'DROP 01 / THE QUIET STATEMENT', 'The first DRIPNALITY archive release.', 'archived', true, now())
on conflict (slug) do nothing;

insert into public.products (drop_id, slug, name, description, price_cents, color, category, cover_image, hover_image, hover_video, gallery, is_sold_out, is_published, sort_order)
select
  drops.id,
  item.slug,
  item.name,
  item.description,
  item.price_cents,
  item.color,
  'hoodies',
  item.cover_image,
  item.hover_image,
  item.hover_video,
  item.gallery,
  true,
  true,
  item.sort_order
from public.drops drops
cross join (
  values
    ('black-signature-zip', 'Black Signature Zip Hoodie', 'Heavyweight French terry zip hoodie with a structured double-layered hood.', 14500, 'Black', '/hoodie-black-artwork.jpg', '/ds black1.jpg', null::text, '["/hoodie-black-artwork.jpg", "/don1black.png", "/ds black1.jpg"]'::jsonb, 1),
    ('brown-archive-zip', 'Brown Archive Zip Hoodie', 'Heavyweight French terry zip hoodie finished in a rich archive brown.', 15500, 'Brown', '/hoodie-brown-artwork.jpg', null::text, '/vid brown1.mp4', '["/hoodie-brown-artwork.jpg", "/don2brown.png", "/ds brown1.jpg"]'::jsonb, 2)
) as item(slug, name, description, price_cents, color, cover_image, hover_image, hover_video, gallery, sort_order)
where drops.slug = 'drop-01'
on conflict (slug) do update set
  cover_image = excluded.cover_image,
  hover_image = excluded.hover_image,
  hover_video = excluded.hover_video,
  gallery = excluded.gallery,
  updated_at = now();

-- Assign the first administrator manually after creating your account:
-- update public.profiles set role = 'admin' where email = 'your-admin-email@example.com';
