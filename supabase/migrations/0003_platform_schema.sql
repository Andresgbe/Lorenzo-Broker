-- Platform schema: profiles, plans, memberships, payments, course content,
-- lesson progress and the private bucket for lesson media.
--
-- Trust model:
--   * Students may read their own rows and create a payment in 'pending'.
--   * Nothing a student sends can set a price, a status or a membership date:
--     amount comes from `plans`, status is not a writable column, and
--     memberships are only written by confirm_payment().
--   * Admin = role 'admin' in app_metadata (see is_admin()).

-- ---------------------------------------------------------------- helpers

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- ---------------------------------------------------------------- profiles

-- One row per auth user. Filled by trigger from the signup metadata
-- (full_name, tax_id) so the admin panel can list students.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  tax_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile, admins read all"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Students may only edit display fields, never id or email.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, tax_id) on public.profiles to authenticated;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, tax_id)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'tax_id'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- Accounts created before this migration.
insert into public.profiles (id, email, full_name, tax_id)
select id, coalesce(email, ''), raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'tax_id'
from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------- plans

-- Server-side source of truth for price and duration. Mirrors PLANS in
-- src/entities/plan/model/plans.ts; the id must match.
create table public.plans (
  id text primary key,
  name text not null,
  price_usd numeric(10, 2) not null check (price_usd > 0),
  duration_days integer not null check (duration_days > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.plans enable row level security;

create policy "Anyone can read plans"
  on public.plans for select to anon, authenticated
  using (true);

insert into public.plans (id, name, price_usd, duration_days)
values ('mensual', 'Membresía mensual', 29, 30)
on conflict (id) do nothing;

-- ---------------------------------------------------------------- memberships

-- One row per student. Active means expires_at > now(); "por vencer" and
-- "vencida" are derived in the UI. Written only by confirm_payment().
create table public.memberships (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan_id text not null references public.plans (id),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.memberships enable row level security;

create policy "Users read own membership, admins read all"
  on public.memberships for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function public.set_updated_at();

create or replace function public.has_active_membership()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = (select auth.uid()) and m.expires_at > now()
  );
$$;

-- ---------------------------------------------------------------- payments

-- Payments go through manual verification (PagoMóvil, transferencia, Zelle,
-- Binance Pay), so 'pending' is a state a student can sit in for hours.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan_id text not null references public.plans (id),
  amount_usd numeric(10, 2) not null,
  method text not null check (method in ('pago-movil', 'transferencia', 'zelle', 'binance-pay')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'rejected')),
  -- Bank/Zelle/Binance reference the student reports, if any.
  reference text,
  -- Cobrix's id for the charge, once the gateway is wired.
  provider_payment_id text unique,
  rejection_reason text,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index payments_user_id_created_at_idx on public.payments (user_id, created_at desc);
create index payments_pending_idx on public.payments (created_at) where status = 'pending';

alter table public.payments enable row level security;

create policy "Users read own payments, admins read all"
  on public.payments for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Users create own pending payments"
  on public.payments for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

-- A student chooses plan, method and reference — nothing else.
revoke insert, update, delete on public.payments from anon, authenticated;
grant insert (plan_id, method, reference) on public.payments to authenticated;

-- Price is never taken from the client.
create or replace function public.set_payment_amount()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.amount_usd is null then
    select p.price_usd into new.amount_usd
    from public.plans p
    where p.id = new.plan_id and p.is_active;

    if new.amount_usd is null then
      raise exception 'Plan no disponible: %', new.plan_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger payments_set_amount
  before insert on public.payments
  for each row execute function public.set_payment_amount();

-- Admin (or, later, the Cobrix webhook running as service_role) confirms a
-- pending payment. Extends the membership from today or from its current
-- expiry, whichever is later, so paying early never loses days.
create or replace function public.confirm_payment(p_payment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments;
  v_days integer;
begin
  if not (public.is_admin() or coalesce((select auth.jwt()) ->> 'role', '') = 'service_role') then
    raise exception 'Solo un administrador puede confirmar pagos' using errcode = '42501';
  end if;

  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then
    raise exception 'Pago no encontrado';
  end if;
  if v_payment.status <> 'pending' then
    raise exception 'Este pago ya fue revisado';
  end if;

  select duration_days into v_days from public.plans where id = v_payment.plan_id;

  update public.payments
  set status = 'paid', reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_payment_id;

  insert into public.memberships (user_id, plan_id, expires_at)
  values (v_payment.user_id, v_payment.plan_id, now() + make_interval(days => v_days))
  on conflict (user_id) do update
  set plan_id = excluded.plan_id,
      expires_at = greatest(public.memberships.expires_at, now()) + make_interval(days => v_days);
end;
$$;

create or replace function public.reject_payment(p_payment_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (public.is_admin() or coalesce((select auth.jwt()) ->> 'role', '') = 'service_role') then
    raise exception 'Solo un administrador puede rechazar pagos' using errcode = '42501';
  end if;

  update public.payments
  set status = 'rejected', rejection_reason = p_reason, reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_payment_id and status = 'pending';

  if not found then
    raise exception 'Pago no encontrado o ya revisado';
  end if;
end;
$$;

revoke execute on function public.confirm_payment(uuid) from public, anon;
revoke execute on function public.reject_payment(uuid, text) from public, anon;
grant execute on function public.confirm_payment(uuid) to authenticated, service_role;
grant execute on function public.reject_payment(uuid, text) to authenticated, service_role;

-- ---------------------------------------------------------------- course content

-- Titles and structure are public: the marketing page lists the modules and
-- the preview module's lessons. The media itself is protected by the
-- storage policies below, not by hiding media_path.
create table public.course_modules (
  id text primary key,
  title text not null,
  position integer not null default 0,
  is_preview boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id text primary key,
  module_id text not null references public.course_modules (id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('video', 'pdf')),
  -- Videos only; the UI formats it as "12:30".
  duration_seconds integer check (duration_seconds > 0),
  -- Object path in the 'lessons' bucket: <module_id>/<lesson_id>/<file>.
  media_path text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index lessons_module_id_position_idx on public.lessons (module_id, position);

alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;

create policy "Anyone can read modules"
  on public.course_modules for select to anon, authenticated
  using (true);

create policy "Admins manage modules"
  on public.course_modules for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Anyone can read lessons"
  on public.lessons for select to anon, authenticated
  using (true);

create policy "Admins manage lessons"
  on public.lessons for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------- lesson progress

create table public.lesson_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_id text not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index lesson_progress_lesson_id_idx on public.lesson_progress (lesson_id);

alter table public.lesson_progress enable row level security;

create policy "Users read own progress, admins read all"
  on public.lesson_progress for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Users mark own lessons"
  on public.lesson_progress for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users unmark own lessons"
  on public.lesson_progress for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- lesson media

-- Private bucket: files are only reachable through signed URLs, and a signed
-- URL is only issued to someone the select policy allows.
insert into storage.buckets (id, name, public)
values ('lessons', 'lessons', false)
on conflict (id) do nothing;

create policy "Members read lesson media, preview module is open"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'lessons'
    and (
      (select public.is_admin())
      or (select public.has_active_membership())
      or (storage.foldername(name))[1] in (select id from public.course_modules where is_preview)
    )
  );

create policy "Admins upload lesson media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'lessons' and (select public.is_admin()));

create policy "Admins update lesson media"
  on storage.objects for update to authenticated
  using (bucket_id = 'lessons' and (select public.is_admin()))
  with check (bucket_id = 'lessons' and (select public.is_admin()));

create policy "Admins delete lesson media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'lessons' and (select public.is_admin()));
