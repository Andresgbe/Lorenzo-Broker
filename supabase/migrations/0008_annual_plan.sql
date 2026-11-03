-- Annual membership: $297 for 365 days, with the same courses as the monthly one.
--
-- A student can now hold rows for two subscription plans (entitlements has one
-- row per user and plan), so access stops being "per plan" in two places:
--   - Extending counts from the latest live expiry of any subscription, so
--     moving from monthly to annual keeps the days already paid.
--   - Revoking takes away every subscription, or a monthly row would keep the
--     access of someone whose annual row was revoked.
--
-- Depends on 0003 and on assert_can_manage() from 0007: run 0007 first.

insert into public.plans (id, name, kind, price_usd_cents, duration_days, grace_days, position)
values ('anual', 'Membresía anual', 'subscription', 29700, 365, 2, 1)
on conflict (id) do nothing;

insert into public.plan_courses (plan_id, course_id)
select 'anual', course_id from public.plan_courses where plan_id = 'mensual'
on conflict do nothing;

create or replace function public.extend_entitlement(p_user_id uuid, p_plan_id text, p_days integer, p_source text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan public.plans;
  v_base timestamptz;
begin
  select * into v_plan from public.plans where id = p_plan_id;
  if not found then
    raise exception 'Plan no encontrado: %', p_plan_id;
  end if;

  if v_plan.kind = 'one_time' then
    insert into public.entitlements (user_id, plan_id, status, expires_at, source)
    values (p_user_id, p_plan_id, 'active', null, p_source)
    on conflict (user_id, plan_id) do update
    set status = 'active', expires_at = null, source = excluded.source;
    return;
  end if;

  select greatest(now(), coalesce(max(e.expires_at), now())) into v_base
  from public.entitlements e
  join public.plans p on p.id = e.plan_id
  where e.user_id = p_user_id and p.kind = 'subscription' and e.status <> 'revoked';

  insert into public.entitlements (user_id, plan_id, status, starts_at, expires_at, source)
  values (p_user_id, p_plan_id, 'active', now(), v_base + make_interval(days => p_days), p_source)
  on conflict (user_id, plan_id) do update
  set status = 'active',
      source = excluded.source,
      starts_at = case when public.entitlements.expires_at > now() and public.entitlements.status <> 'revoked'
                       then public.entitlements.starts_at else now() end,
      expires_at = excluded.expires_at;
end;
$$;

revoke execute on function public.extend_entitlement(uuid, text, integer, text) from public, anon, authenticated;

create or replace function public.admin_revoke_access(p_user_id uuid, p_plan_id text, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede quitar acceso' using errcode = '42501';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Indica el motivo';
  end if;
  perform public.assert_can_manage(p_user_id);

  update public.entitlements e
  set status = 'revoked'
  from public.plans p
  where p.id = e.plan_id and e.user_id = p_user_id and (e.plan_id = p_plan_id or p.kind = 'subscription');

  insert into public.admin_actions (admin_id, user_id, action, reason, details)
  values (auth.uid(), p_user_id, 'revoke_access', p_reason, jsonb_build_object('plan_id', p_plan_id));
end;
$$;
