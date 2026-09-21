-- Ecommerce-only missing objects for the current frontend.
-- Review before execution. This file does not modify booking, auth, profiles,
-- business_settings, appointment_settings, services, or appointment RPCs.

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  old_price numeric(10,2),
  stock_quantity integer not null default 0,
  sku text,
  main_image text,
  images jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  slug text,
  created_at timestamptz not null default now()
);

alter table if exists public.product_categories
  add column if not exists name text,
  add column if not exists created_at timestamptz default now();

alter table if exists public.products
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists price numeric(10,2) default 0,
  add column if not exists old_price numeric(10,2),
  add column if not exists stock_quantity integer default 0,
  add column if not exists sku text,
  add column if not exists main_image text,
  add column if not exists images jsonb default '[]'::jsonb,
  add column if not exists is_active boolean default true,
  add column if not exists is_featured boolean default false,
  add column if not exists slug text,
  add column if not exists created_at timestamptz default now();

-- Required by the existing products -> product_categories(name) relation.
alter table if exists public.products
  add column if not exists category_id uuid;

do $$
begin
  if to_regclass('public.products') is not null
     and to_regclass('public.product_categories') is not null
     and not exists (
       select 1
       from pg_constraint
       where conrelid = 'public.products'::regclass
         and contype = 'f'
         and confrelid = 'public.product_categories'::regclass
     )
  then
    alter table public.products
      add constraint products_category_id_fkey
      foreign key (category_id)
      references public.product_categories(id)
      on delete set null;
  end if;
end
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  total numeric(10,2) not null default 0,
  city text,
  address text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table if exists public.orders
  add column if not exists customer_name text,
  add column if not exists phone text,
  add column if not exists total numeric(10,2) default 0,
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists status text default 'pending',
  add column if not exists created_at timestamptz default now();

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'product_categories'
      and policyname = 'store categories public read'
  ) then
    create policy "store categories public read"
      on public.product_categories
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'store products public read active'
  ) then
    create policy "store products public read active"
      on public.products
      for select
      to anon, authenticated
      using (is_active = true);
  end if;

  if to_regprocedure('public.is_admin()') is not null then
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'products'
        and policyname = 'store products admin manage'
    ) then
      create policy "store products admin manage"
        on public.products
        for all
        to authenticated
        using (public.is_admin())
        with check (public.is_admin());
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'orders'
        and policyname = 'store orders admin read'
    ) then
      create policy "store orders admin read"
        on public.orders
        for select
        to authenticated
        using (public.is_admin());
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'orders'
        and policyname = 'store orders admin update'
    ) then
      create policy "store orders admin update"
        on public.orders
        for update
        to authenticated
        using (public.is_admin())
        with check (public.is_admin());
    end if;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'store product images public read'
  ) then
    create policy "store product images public read"
      on storage.objects
      for select
      to public
      using (bucket_id = 'products');
  end if;

  if to_regprocedure('public.is_admin()') is not null then
    if not exists (
      select 1 from pg_policies
      where schemaname = 'storage'
        and tablename = 'objects'
        and policyname = 'store product images admin upload'
    ) then
      create policy "store product images admin upload"
        on storage.objects
        for insert
        to authenticated
        with check (bucket_id = 'products' and public.is_admin());
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'storage'
        and tablename = 'objects'
        and policyname = 'store product images admin delete'
    ) then
      create policy "store product images admin delete"
        on storage.objects
        for delete
        to authenticated
        using (bucket_id = 'products' and public.is_admin());
    end if;
  end if;
end
$$;
