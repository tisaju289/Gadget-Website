-- =====================================================================
-- Nexio storefront — full database schema
-- Run this ONCE on a fresh Supabase project (SQL Editor), then run
-- database/seed.sql to load the demo/base content.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- types
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------ functions
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;

-- ------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

drop policy if exists "Profiles viewable by owner" on public.profiles;
create policy "Profiles viewable by owner" on public.profiles
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = user_id);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- ----------------------------------------------------------- user_roles
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = _user_id
    and exists (
      select 1 from public.user_roles
      where user_id = _user_id and role = _role
    )
$$;

-- new signups get a profile + the default 'user' role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------- categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  icon text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;

drop policy if exists "Public read active categories" on public.categories;
create policy "Public read active categories" on public.categories
  for select to anon, authenticated
  using (is_active = true or public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories
  for each row execute function public.update_updated_at_column();

-- -------------------------------------------------------- subcategories
create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.subcategories to anon;
grant select, insert, update, delete on public.subcategories to authenticated;
grant all on public.subcategories to service_role;
alter table public.subcategories enable row level security;

drop policy if exists "Public read active subcategories" on public.subcategories;
create policy "Public read active subcategories" on public.subcategories
  for select to anon, authenticated
  using (is_active = true or public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins manage subcategories" on public.subcategories;
create policy "Admins manage subcategories" on public.subcategories
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop trigger if exists trg_subcategories_updated_at on public.subcategories;
create trigger trg_subcategories_updated_at before update on public.subcategories
  for each row execute function public.update_updated_at_column();

-- --------------------------------------------------------------- brands
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.brands to anon;
grant select, insert, update, delete on public.brands to authenticated;
grant all on public.brands to service_role;
alter table public.brands enable row level security;

drop policy if exists "Public read active brands" on public.brands;
create policy "Public read active brands" on public.brands
  for select to anon, authenticated
  using (is_active = true or public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins manage brands" on public.brands;
create policy "Admins manage brands" on public.brands
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop trigger if exists update_brands_updated_at on public.brands;
create trigger update_brands_updated_at before update on public.brands
  for each row execute function public.update_updated_at_column();

-- ------------------------------------------------------------- products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  brand text,
  description text,
  image_url text,
  gallery text[] not null default '{}'::text[],
  price numeric not null,
  original_price numeric,
  label text,
  sku text,
  warranty text,
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  stock integer not null default 0,
  variations jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_flash_sale boolean not null default false,
  is_new_arrival boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products" on public.products
  for select to anon, authenticated
  using (is_active = true or public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.update_updated_at_column();

-- -------------------------------------------------------------- banners
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  image_url text not null,
  link_url text,
  position text not null default 'hero',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.banners to anon;
grant select, insert, update, delete on public.banners to authenticated;
grant all on public.banners to service_role;
alter table public.banners enable row level security;

drop policy if exists "Public read active banners" on public.banners;
create policy "Public read active banners" on public.banners
  for select to anon, authenticated
  using (is_active = true or public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins manage banners" on public.banners;
create policy "Admins manage banners" on public.banners
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop trigger if exists trg_banners_updated_at on public.banners;
create trigger trg_banners_updated_at before update on public.banners
  for each row execute function public.update_updated_at_column();

-- --------------------------------------------------------------- orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null default ('ORD-' || to_char(now(), 'YYMMDD') || '-' || lpad(floor(random() * 100000)::text, 5, '0')),
  customer_name text not null,
  customer_mobile text not null,
  customer_address text not null,
  delivery_option text not null default 'inside',
  delivery_fee numeric not null default 0,
  subtotal numeric not null default 0,
  total numeric not null default 0,
  payment_method text not null default 'cod',
  note text,
  status text not null default 'pending',
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.orders to anon;
grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;

drop policy if exists "Anyone can create valid pending orders" on public.orders;
create policy "Anyone can create valid pending orders" on public.orders
  for insert to anon, authenticated
  with check (
    length(trim(customer_name)) >= 2
    and length(trim(customer_mobile)) >= 6
    and length(trim(customer_address)) >= 10
    and delivery_option = any (array['inside', 'outside'])
    and delivery_fee >= 0 and subtotal >= 0 and total >= subtotal
    and payment_method = 'cod' and status = 'pending'
    and jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0
  );
drop policy if exists "Admins read orders" on public.orders;
create policy "Admins read orders" on public.orders
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins delete orders" on public.orders;
create policy "Admins delete orders" on public.orders
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
  for each row execute function public.update_updated_at_column();

-- ------------------------------------------------------------ preorders
create table if not exists public.preorders (
  id uuid primary key default gen_random_uuid(),
  preorder_number text not null default ('PRE-' || to_char(now(), 'YYMMDD') || '-' || lpad(floor(random() * 100000)::text, 5, '0')),
  customer_name text not null,
  customer_mobile text not null,
  customer_address text,
  product_name text not null,
  product_link text,
  product_image text,
  quantity integer not null default 1,
  budget numeric,
  advance_paid numeric not null default 0,
  note text,
  status text not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.preorders to anon;
grant select, insert, update, delete on public.preorders to authenticated;
grant all on public.preorders to service_role;
alter table public.preorders enable row level security;

drop policy if exists "Anyone can create valid pending preorders" on public.preorders;
create policy "Anyone can create valid pending preorders" on public.preorders
  for insert to anon, authenticated
  with check (
    length(trim(customer_name)) >= 2
    and length(trim(customer_mobile)) >= 6
    and length(trim(product_name)) >= 2
    and quantity > 0
    and coalesce(budget, 0) >= 0
    and advance_paid >= 0
    and status = 'pending'
    and admin_note is null
  );
drop policy if exists "Admins read preorders" on public.preorders;
create policy "Admins read preorders" on public.preorders
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins update preorders" on public.preorders;
create policy "Admins update preorders" on public.preorders
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins delete preorders" on public.preorders;
create policy "Admins delete preorders" on public.preorders
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

drop trigger if exists update_preorders_updated_at on public.preorders;
create trigger update_preorders_updated_at before update on public.preorders
  for each row execute function public.update_updated_at_column();

-- --------------------------------------------------------- site_settings
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true,
  site_name text not null default 'Nexio',
  logo_url text,
  favicon_url text,
  meta_title text,
  meta_description text,
  meta_keywords text,
  og_image_url text,
  fb_pixel_id text,
  fb_capi_access_token text,
  fb_test_event_code text,
  ga_measurement_id text,
  ga_api_secret text,
  gtm_id text,
  google_ads_id text,
  google_ads_conversion_label text,
  tiktok_pixel_id text,
  tiktok_access_token text,
  snapchat_pixel_id text,
  pinterest_tag_id text,
  twitter_pixel_id text,
  linkedin_partner_id text,
  hotjar_id text,
  clarity_id text,
  gsc_verification text,
  custom_head_scripts text,
  custom_body_scripts text,
  header_hotline text,
  topbar_phone text,
  footer_tagline text,
  footer_email text,
  footer_facebook text,
  footer_instagram text,
  footer_youtube text,
  footer_linkedin text,
  footer_copyright text,
  footer_branches jsonb not null default '[]'::jsonb,
  show_topbar boolean not null default true,
  show_megamenu boolean not null default true,
  show_hotline boolean not null default true,
  show_preorder_btn boolean not null default true,
  show_header_search boolean not null default true,
  show_footer_branches boolean not null default true,
  show_footer_company boolean not null default true,
  show_footer_help boolean not null default true,
  show_footer_terms boolean not null default true,
  show_footer_socials boolean not null default true,
  show_mobile_bottom_nav boolean not null default true,
  bottom_nav_phone text,
  bottom_nav_whatsapp text,
  checkout_title text,
  checkout_inside_label text,
  checkout_inside_fee numeric,
  checkout_inside_note text,
  checkout_outside_label text,
  checkout_outside_fee numeric,
  checkout_outside_note text,
  checkout_cod_label text,
  checkout_cod_note text,
  checkout_success_title text,
  checkout_success_message text,
  checkout_terms_text text,
  checkout_show_note_field boolean not null default true,
  auto_image_optimization boolean not null default true,
  image_quality integer not null default 78,
  nav_links jsonb not null default '[]'::jsonb,
  show_nav_categories boolean not null default false,
  topbar_links jsonb not null default '[]'::jsonb,
  nav_category_links jsonb not null default '[]'::jsonb,
  home_category_limit integer not null default 8,
  home_brand_limit integer not null default 8,
  home_featured_per_row integer not null default 6,
  home_best_selling_per_row integer not null default 6,
  home_new_arrivals_per_row integer not null default 6,
  home_category_per_row integer not null default 6,
  home_brand_per_row integer not null default 4,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon;
grant select, insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings" on public.site_settings
  for select to anon, authenticated using (true);
drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings" on public.site_settings
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop trigger if exists update_site_settings_updated_at on public.site_settings;
create trigger update_site_settings_updated_at before update on public.site_settings
  for each row execute function public.update_updated_at_column();

-- ---------------------------------------------------------------- storage
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
