-- An admin can end a student's membership now: a state of its own ('ended',
-- "Expirada" in the panel), different from one that ran out by date and from a
-- revoked one. No grace days apply, and paying or granting access starts again
-- from today, because the expiry is moved to now.
-- Depends on 0003, and on assert_can_manage() from 0007: run 0007 and 0008 first.

alter table public.entitlements drop constraint if exists entitlements_status_check;
alter table public.entitlements
  add constraint entitlements_status_check
  check (status in ('active', 'grace', 'expired', 'revoked', 'ended'));

-- Same as in 0003, also leaving out ended memberships, which are still inside
-- their grace days by date.
create or replace function public.has_course_access(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.entitlements e
    join public.plans p on p.id = e.plan_id
    join public.plan_courses pc on pc.plan_id = e.plan_id
    where e.user_id = (select auth.uid())
      and pc.course_id = p_course_id
      and e.status not in ('revoked', 'ended')
      and (e.expires_at is null or now() < e.expires_at + make_interval(days => p.grace_days))
  );
$$;

create or replace function public.admin_expire_access(p_user_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede expirar un acceso' using errcode = '42501';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Indica el motivo';
  end if;
  perform public.assert_can_manage(p_user_id);

  update public.entitlements e
  set status = 'ended', expires_at = least(e.expires_at, now())
  from public.plans p
  where p.id = e.plan_id
    and e.user_id = p_user_id
    and p.kind = 'subscription'
    and e.status <> 'revoked';

  insert into public.admin_actions (admin_id, user_id, action, reason, details)
  values (auth.uid(), p_user_id, 'expire_access', p_reason, '{}'::jsonb);
end;
$$;

revoke execute on function public.admin_expire_access(uuid, text) from public, anon;
grant execute on function public.admin_expire_access(uuid, text) to authenticated;
