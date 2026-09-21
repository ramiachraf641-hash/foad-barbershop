-- Review and run manually in Supabase SQL Editor.
-- Allows guest customers to create the order row used by the current frontend.
-- It does not modify booking, auth, services, products, or order management.

alter table if exists public.orders enable row level security;

do $$
begin
  if to_regclass('public.orders') is not null
     and not exists (
       select 1
       from pg_policies
       where schemaname = 'public'
         and tablename = 'orders'
         and policyname = 'store orders guest insert'
     ) then
    create policy "store orders guest insert"
      on public.orders
      for insert
      to anon, authenticated
      with check (
        customer_name is not null
        and length(trim(customer_name)) > 0
        and phone is not null
        and length(trim(phone)) > 0
        and total >= 0
        and status = 'pending'
      );
  end if;
end
$$;
