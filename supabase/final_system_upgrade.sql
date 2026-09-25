-- Final system upgrade
-- No additional SQL changes are confirmed locally.
-- Existing security/RLS/RPC objects are intentionally untouched.
-- Tracking SQL remains in add_order_tracking.sql and must not be duplicated here.

create or replace function public.admin_get_order_items(p_order_id uuid)
returns table (order_id uuid, product_name_snapshot text, quantity integer, unit_price numeric, subtotal numeric)
language sql security definer set search_path = public
as $$
  select oi.order_id, oi.product_name_snapshot, oi.quantity, oi.unit_price, oi.subtotal
  from public.order_items oi
  where oi.order_id = p_order_id and public.is_admin();
$$;
revoke all on function public.admin_get_order_items(uuid) from public;
grant execute on function public.admin_get_order_items(uuid) to authenticated;

-- Delete only delivered/cancelled orders older than seven days.
-- orders has no updated_at in the current schema, so created_at is the only
-- available timestamp and is used as the retention reference.
create or replace function public.cleanup_old_completed_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  with eligible_orders as (
    select id
    from public.orders
    where status in ('delivered', 'cancelled')
      and created_at < now() - interval '7 days'
  ), deleted_items as (
    delete from public.order_items oi
    using eligible_orders eo
    where oi.order_id = eo.id
  )
  delete from public.orders o
  using eligible_orders eo
  where o.id = eo.id;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.cleanup_old_completed_orders() from public;
