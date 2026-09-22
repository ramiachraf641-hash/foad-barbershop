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
