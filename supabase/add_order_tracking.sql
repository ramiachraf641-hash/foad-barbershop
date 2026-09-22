-- Secure guest order tracking.
-- Prerequisite: public.orders must contain id (uuid), phone and status.
-- This does not grant anon SELECT on public.orders.

create or replace function public.track_guest_order(
  p_order_id uuid,
  p_phone text
)
returns table(order_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_order_id is null or p_phone is null or length(trim(p_phone)) = 0 then
    return;
  end if;

  return query
    select o.id, o.status
    from public.orders o
    where o.id = p_order_id
      and regexp_replace(coalesce(o.phone, ''), '[^0-9]+', '', 'g') =
          regexp_replace(trim(p_phone), '[^0-9]+', '', 'g');
end;
$$;

revoke all on function public.track_guest_order(uuid, text) from public;
grant execute on function public.track_guest_order(uuid, text) to anon, authenticated;
