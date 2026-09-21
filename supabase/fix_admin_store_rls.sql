-- Minimal Ecommerce Admin RLS repair.
-- Review and execute manually in Supabase.
-- This file does not touch appointments, services, booking, Auth, profiles,
-- business_settings, appointment_settings, or booking RPCs.

-- Keep RLS enabled for the three store surfaces.
alter table if exists public.products enable row level security;
alter table if exists public.product_categories enable row level security;

-- Public storefront reads active products and category names.
do $$
begin
  if to_regclass('public.product_categories') is not null
     and not exists (
       select 1 from pg_policies
       where schemaname='public'
         and tablename='product_categories'
         and policyname='store categories public read'
     ) then
    create policy "store categories public read"
      on public.product_categories
      for select
      to anon, authenticated
      using (true);
  end if;

  if to_regclass('public.products') is not null
     and not exists (
       select 1 from pg_policies
       where schemaname='public'
         and tablename='products'
         and policyname='store products public read active'
     ) then
    create policy "store products public read active"
      on public.products
      for select
      to anon, authenticated
      using (is_active = true);
  end if;
end
$$;

-- Admin CRUD for products and categories.
-- The policy is created only when the existing public.is_admin() function exists.
do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'Required existing function public.is_admin() was not found; no admin write policies were created.';
  end if;

  if to_regclass('public.products') is not null
     and not exists (
       select 1 from pg_policies
       where schemaname='public'
         and tablename='products'
         and policyname='store products admin manage'
     ) then
    create policy "store products admin manage"
      on public.products
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;

  if to_regclass('public.product_categories') is not null
     and not exists (
       select 1 from pg_policies
       where schemaname='public'
         and tablename='product_categories'
         and policyname='store categories admin manage'
     ) then
    create policy "store categories admin manage"
      on public.product_categories
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end
$$;

-- Do not create or alter the products bucket. The existing bucket is reused.
-- Public image reads and admin upload/delete are scoped to bucket products.
do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'Required existing function public.is_admin() was not found; no storage admin policies were created.';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and policyname='store product images public read'
  ) then
    create policy "store product images public read"
      on storage.objects
      for select
      to public
      using (bucket_id='products');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and policyname='store product images admin upload'
  ) then
    create policy "store product images admin upload"
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id='products' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and policyname='store product images admin delete'
  ) then
    create policy "store product images admin delete"
      on storage.objects
      for delete
      to authenticated
      using (bucket_id='products' and public.is_admin());
  end if;
end
$$;
