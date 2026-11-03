-- Who is who, and what an admin can do to a student from the panel.
--
-- Roles: every new account is a student. The role that counts for permissions
-- stays in auth.users.raw_app_meta_data (is_admin() reads it from the JWT);
-- profiles.role is a copy so the panel can show it, kept in sync by a trigger.
-- Users cannot write it: 0003 only grants update on full_name, tax_id and phone.
--
-- The owner is an admin with "owner": true (Lorenzo). There is one, and other
-- admins cannot edit him or take his access away.
--
-- Every action here needs an admin and a reason, and is logged in admin_actions.
-- Depends on 0003.

alter table public.profiles
  add column if not exists role text not null default 'student'
  check (role in ('student', 'admin', 'owner'));

create or replace function public.role_from_app_metadata(p_meta jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_meta ->> 'role' = 'admin' and p_meta ->> 'owner' = 'true' then 'owner'
    when p_meta ->> 'role' = 'admin' then 'admin'
    else 'student'
  end;
$$;

revoke execute on function public.role_from_app_metadata(jsonb) from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, tax_id, phone, role)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'tax_id',
    new.raw_user_meta_data ->> 'phone',
    public.role_from_app_metadata(new.raw_app_meta_data)
  );
  return new;
end;
$$;

create or replace function public.handle_user_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set role = public.role_from_app_metadata(new.raw_app_meta_data) where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_role_changed on auth.users;
create trigger on_auth_user_role_changed
  after update of raw_app_meta_data on auth.users
  for each row
  when (old.raw_app_meta_data is distinct from new.raw_app_meta_data)
  execute function public.handle_user_role_change();

-- Lorenzo is the owner. Keeps role = admin, so is_admin() does not change for him.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin", "owner": true}'::jsonb
where email = 'lorenzoperezus@gmail.com';

update public.profiles p
set role = public.role_from_app_metadata(u.raw_app_meta_data)
from auth.users u
where u.id = p.id;

create unique index if not exists profiles_single_owner_idx on public.profiles (role) where role = 'owner';

-- Only the owner himself can touch the owner. Internal: called by the functions below.
create or replace function public.assert_can_manage(p_user_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_user_id <> auth.uid()
     and exists (select 1 from public.profiles where id = p_user_id and role = 'owner') then
    raise exception 'Solo el dueño puede modificar su propia cuenta' using errcode = '42501';
  end if;
end;
$$;

revoke execute on function public.assert_can_manage(uuid) from public, anon, authenticated;

-- Same as in 0003, now protecting the owner.
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

  update public.entitlements set status = 'revoked' where user_id = p_user_id and plan_id = p_plan_id;

  insert into public.admin_actions (admin_id, user_id, action, reason, details)
  values (auth.uid(), p_user_id, 'revoke_access', p_reason, jsonb_build_object('plan_id', p_plan_id));
end;
$$;

-- Name, ID and phone, in profiles and in the account's metadata (what the
-- student's own session reads). The email is not here: it belongs to Auth and
-- changing it needs the server's Admin API.
create or replace function public.admin_update_student(
  p_user_id uuid,
  p_full_name text,
  p_tax_id text,
  p_phone text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := nullif(trim(coalesce(p_full_name, '')), '');
  v_tax_id text := nullif(trim(coalesce(p_tax_id, '')), '');
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede editar alumnos' using errcode = '42501';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Indica el motivo';
  end if;
  perform public.assert_can_manage(p_user_id);

  update public.profiles
  set full_name = v_name, tax_id = v_tax_id, phone = v_phone
  where id = p_user_id;
  if not found then
    raise exception 'Alumno no encontrado';
  end if;

  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('full_name', v_name, 'tax_id', v_tax_id, 'phone', v_phone)
  where id = p_user_id;

  insert into public.admin_actions (admin_id, user_id, action, reason, details)
  values (
    auth.uid(), p_user_id, 'update_student', p_reason,
    jsonb_build_object('full_name', v_name, 'tax_id', v_tax_id, 'phone', v_phone)
  );
end;
$$;

-- A payment received outside the platform: saved as paid, and it extends the
-- student's access by the months paid. Returns the new payment's id.
create or replace function public.admin_record_payment(
  p_user_id uuid,
  p_plan_id text,
  p_months integer,
  p_amount_usd_cents integer,
  p_amount_bs_cents bigint,
  p_method text,
  p_reference text,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_days integer;
  v_payment_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede registrar pagos' using errcode = '42501';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Indica el motivo';
  end if;
  if p_months is null or p_months not between 1 and 12 then
    raise exception 'Los meses deben estar entre 1 y 12';
  end if;
  if p_amount_usd_cents is null or p_amount_usd_cents <= 0 then
    raise exception 'El monto debe ser mayor que cero';
  end if;

  select duration_days into v_days from public.plans where id = p_plan_id and kind = 'subscription';
  if v_days is null then
    raise exception 'Plan no encontrado: %', p_plan_id;
  end if;

  insert into public.payments (user_id, plan_id, status, amount_usd_cents, amount_bs_cents, exchange_rate, method, reference, paid_at)
  values (
    p_user_id, p_plan_id, 'paid', p_amount_usd_cents, p_amount_bs_cents,
    case when p_amount_bs_cents is null then null else round(p_amount_bs_cents::numeric / p_amount_usd_cents, 6) end,
    p_method, nullif(trim(coalesce(p_reference, '')), ''), now()
  )
  returning id into v_payment_id;

  perform public.extend_entitlement(p_user_id, p_plan_id, p_months * v_days, 'manual');

  insert into public.admin_actions (admin_id, user_id, action, reason, details)
  values (
    auth.uid(), p_user_id, 'record_payment', p_reason,
    jsonb_build_object('payment_id', v_payment_id, 'plan_id', p_plan_id, 'months', p_months, 'amount_usd_cents', p_amount_usd_cents)
  );

  return v_payment_id;
end;
$$;

revoke execute on function public.admin_update_student(uuid, text, text, text, text) from public, anon;
revoke execute on function public.admin_record_payment(uuid, text, integer, integer, bigint, text, text, text) from public, anon;
grant execute on function public.admin_update_student(uuid, text, text, text, text) to authenticated;
grant execute on function public.admin_record_payment(uuid, text, integer, integer, bigint, text, text, text) to authenticated;
