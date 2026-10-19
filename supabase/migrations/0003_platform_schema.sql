-- Platform schema, following Spec_Lorenzo_Broker_Plataforma_Membresia (29/09/2026).
--
--   Product (plan) → Course → Module → Lesson (+ PDF attachments)
--
-- Trust model:
--   * Admin = role 'admin' in app_metadata (is_admin()). Only the server can set it.
--   * Students read only their own rows, and course content only for courses a
--     live entitlement gives them (has_course_access()).
--   * Access is granted only by apply_paid_payment() (called by the Cobrix
--     webhook as service_role, or by an admin action that is logged). Nothing a
--     student sends can grant access, set a price or change a status.
--   * Money is stored in integer cents. Dates in UTC (timestamptz).

-- ======================================================================= reset of the earlier draft

-- An earlier draft of this migration (memberships, course_modules, a public
-- 'lessons' bucket…) was applied to LBP before the spec arrived. Its tables
-- held no real data: profiles are rebuilt from auth.users below and the plan
-- is re-seeded. Drop it so this version can be created cleanly. Every
-- statement is IF EXISTS, so this is a no-op on a fresh database.
-- is_admin() is kept (create or replace below): 0002's site_content policy uses it.
drop policy if exists "Members read lesson media, preview module is open" on storage.objects;
drop policy if exists "Admins upload lesson media" on storage.objects;
drop policy if exists "Admins update lesson media" on storage.objects;
drop policy if exists "Admins delete lesson media" on storage.objects;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_email_changed on auth.users;

drop table if exists
  public.lesson_progress,
  public.lessons,
  public.course_modules,
  public.payments,
  public.memberships,
  public.plans,
  public.profiles
  cascade;

drop function if exists public.confirm_payment(uuid);
drop function if exists public.reject_payment(uuid, text);
drop function if exists public.set_payment_amount();
drop function if exists public.has_active_membership();
drop function if exists public.handle_new_user();
drop function if exists public.handle_user_email_change();

-- ======================================================================= helpers

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

create or replace function public.is_service_role()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt()) ->> 'role', '') = 'service_role';
$$;

-- ======================================================================= profiles

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  tax_id text,
  -- WhatsApp, required by the spec at signup.
  phone text,
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

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, tax_id, phone) on public.profiles to authenticated;

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
  insert into public.profiles (id, email, full_name, tax_id, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'tax_id',
    new.raw_user_meta_data ->> 'phone'
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

insert into public.profiles (id, email, full_name, tax_id, phone)
select id, coalesce(email, ''), raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'tax_id', raw_user_meta_data ->> 'phone'
from auth.users
on conflict (id) do nothing;

-- ======================================================================= plans

-- Products. A subscription has a duration and grace; a one_time product
-- (e.g. the trading manual) never expires. Ids are slugs: the checkout
-- carries them in ?plan=.
create table public.plans (
  id text primary key check (id ~ '^[a-z0-9-]{1,40}$'),
  name text not null,
  kind text not null default 'subscription' check (kind in ('subscription', 'one_time')),
  price_usd_cents integer not null check (price_usd_cents > 0),
  duration_days integer check (duration_days > 0),
  grace_days integer not null default 2 check (grace_days >= 0),
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((kind = 'subscription' and duration_days is not null) or (kind = 'one_time' and duration_days is null))
);

alter table public.plans enable row level security;

create policy "Anyone can read plans"
  on public.plans for select to anon, authenticated
  using (true);

create policy "Admins manage plans"
  on public.plans for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create trigger plans_set_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

insert into public.plans (id, name, kind, price_usd_cents, duration_days, grace_days)
values ('mensual', 'Membresía mensual', 'subscription', 2900, 30, 2)
on conflict (id) do nothing;

-- ======================================================================= entitlements

-- What a student has. One row per (user, plan), extended on every payment.
-- Live = not revoked and (lifetime, or now < expires_at + the plan's grace).
-- `status` is kept current by the daily job for emails and the admin panel;
-- access checks use the dates, not the stored status.
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null references public.plans (id),
  status text not null default 'active' check (status in ('active', 'grace', 'expired', 'revoked')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  source text not null default 'payment' check (source in ('payment', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan_id)
);

create index entitlements_expires_at_idx on public.entitlements (expires_at);

alter table public.entitlements enable row level security;

create policy "Users read own entitlements, admins read all"
  on public.entitlements for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create trigger entitlements_set_updated_at
  before update on public.entitlements
  for each row execute function public.set_updated_at();

-- ======================================================================= content

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  position integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plan_courses (
  plan_id text not null references public.plans (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  primary key (plan_id, course_id)
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text not null default '',
  position integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  description text not null default '',
  -- Bunny Stream video id. Playback goes through a signed URL issued by the
  -- server after checking access; the id alone does not play.
  bunny_video_id text,
  duration_seconds integer check (duration_seconds > 0),
  position integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lesson_attachments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  title text not null,
  -- Object path in the private 'lesson-files' bucket: <lesson_id>/<file>.
  storage_path text not null unique,
  size_bytes bigint,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index plan_courses_course_id_idx on public.plan_courses (course_id);
create index modules_course_id_position_idx on public.modules (course_id, position);
create index lessons_module_id_position_idx on public.lessons (module_id, position);
create index lesson_attachments_lesson_id_idx on public.lesson_attachments (lesson_id, position);

create trigger courses_set_updated_at before update on public.courses
  for each row execute function public.set_updated_at();
create trigger modules_set_updated_at before update on public.modules
  for each row execute function public.set_updated_at();
create trigger lessons_set_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();

-- True when the current user holds a live entitlement to a plan that
-- includes this course.
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
      and e.status <> 'revoked'
      and (e.expires_at is null or now() < e.expires_at + make_interval(days => p.grace_days))
  );
$$;

alter table public.courses enable row level security;
alter table public.plan_courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_attachments enable row level security;

-- Students see published content of courses they have access to; admins see
-- everything, drafts included.
create policy "Read published courses with access"
  on public.courses for select to authenticated
  using ((select public.is_admin()) or (is_published and public.has_course_access(id)));

create policy "Read plan courses"
  on public.plan_courses for select to authenticated
  using ((select public.is_admin()) or public.has_course_access(course_id));

create policy "Read published modules with access"
  on public.modules for select to authenticated
  using (
    (select public.is_admin())
    or (is_published and exists (
      select 1 from public.courses c
      where c.id = course_id and c.is_published and public.has_course_access(c.id)
    ))
  );

create policy "Read published lessons with access"
  on public.lessons for select to authenticated
  using (
    (select public.is_admin())
    or (is_published and exists (
      select 1 from public.modules m join public.courses c on c.id = m.course_id
      where m.id = module_id and m.is_published and c.is_published and public.has_course_access(c.id)
    ))
  );

create policy "Read attachments of readable lessons"
  on public.lesson_attachments for select to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.courses c on c.id = m.course_id
      where l.id = lesson_id and l.is_published and m.is_published and c.is_published
        and public.has_course_access(c.id)
    )
  );

create policy "Admins manage courses" on public.courses for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage plan courses" on public.plan_courses for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage modules" on public.modules for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage lessons" on public.lessons for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage attachments" on public.lesson_attachments for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ======================================================================= progress

create table public.lesson_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
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

-- ======================================================================= payments

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null references public.plans (id),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired', 'review')),
  amount_usd_cents integer not null check (amount_usd_cents > 0),
  amount_bs_cents bigint,
  -- Bs per USD used for this payment (Cobrix's, or BCV of the day).
  exchange_rate numeric(18, 6),
  method text check (method in ('pago-movil', 'transferencia', 'zelle', 'binance-pay')),
  cobrix_id text unique,
  reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_user_id_created_at_idx on public.payments (user_id, created_at desc);
create index payments_status_created_at_idx on public.payments (status, created_at);

alter table public.payments enable row level security;

-- Payments are created by the checkout Edge Function (service role), never
-- by the browser.
create policy "Users read own payments, admins read all"
  on public.payments for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'cobrix',
  event_id text not null,
  type text,
  payload jsonb not null,
  processed boolean not null default false,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, event_id)
);

alter table public.webhook_events enable row level security;

create policy "Admins read webhook events"
  on public.webhook_events for select to authenticated
  using ((select public.is_admin()));

-- "Reporté mi pago": the student uploads a receipt when the webhook never came.
create table public.payment_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  payment_id uuid references public.payments (id) on delete set null,
  -- Object path in the private 'receipts' bucket: <user_id>/<file>.
  receipt_path text not null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index payment_reports_status_idx on public.payment_reports (status, created_at);

alter table public.payment_reports enable row level security;

create policy "Users read own reports, admins read all"
  on public.payment_reports for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Users file own reports"
  on public.payment_reports for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

revoke insert, update, delete on public.payment_reports from anon, authenticated;
grant insert (payment_id, receipt_path, note) on public.payment_reports to authenticated;

create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  kind text not null,
  -- What the email is about (entitlement period, payment id…): with kind and
  -- user it makes each send unique, so no reminder goes out twice.
  reference text not null,
  sent_at timestamptz not null default now(),
  unique (user_id, kind, reference)
);

alter table public.email_log enable row level security;

create policy "Admins read email log"
  on public.email_log for select to authenticated
  using ((select public.is_admin()));

create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  reason text not null check (length(trim(reason)) > 0),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_actions_user_id_idx on public.admin_actions (user_id, created_at desc);

alter table public.admin_actions enable row level security;

create policy "Admins read admin actions"
  on public.admin_actions for select to authenticated
  using ((select public.is_admin()));

-- ======================================================================= access functions

-- Extends (or creates) the user's entitlement to a plan by the plan's
-- duration: from the current expiry if still live, else from now. One-time
-- products become lifetime. Internal: called by the functions below.
create or replace function public.extend_entitlement(p_user_id uuid, p_plan_id text, p_days integer, p_source text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan public.plans;
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

  insert into public.entitlements (user_id, plan_id, status, starts_at, expires_at, source)
  values (p_user_id, p_plan_id, 'active', now(), now() + make_interval(days => p_days), p_source)
  on conflict (user_id, plan_id) do update
  set status = 'active',
      source = excluded.source,
      starts_at = case when public.entitlements.expires_at > now() and public.entitlements.status <> 'revoked'
                       then public.entitlements.starts_at else now() end,
      expires_at = case when public.entitlements.expires_at > now() and public.entitlements.status <> 'revoked'
                        then public.entitlements.expires_at else now() end
                   + make_interval(days => p_days);
end;
$$;

revoke execute on function public.extend_entitlement(uuid, text, integer, text) from public, anon, authenticated;

-- Marks a payment paid and grants its period, in one transaction. Called by
-- the Cobrix webhook / reconciliation (service_role). Idempotent: a payment
-- already paid is left alone.
create or replace function public.apply_paid_payment(p_payment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments;
  v_days integer;
begin
  if not public.is_service_role() then
    raise exception 'Solo el servidor puede aplicar pagos' using errcode = '42501';
  end if;

  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then
    raise exception 'Pago no encontrado';
  end if;
  if v_payment.status = 'paid' then
    return;
  end if;

  select duration_days into v_days from public.plans where id = v_payment.plan_id;

  update public.payments set status = 'paid', paid_at = coalesce(paid_at, now()) where id = p_payment_id;
  perform public.extend_entitlement(v_payment.user_id, v_payment.plan_id, coalesce(v_days, 0), 'payment');
end;
$$;

revoke execute on function public.apply_paid_payment(uuid) from public, anon, authenticated;
grant execute on function public.apply_paid_payment(uuid) to service_role;

-- Admin gives or extends access by hand (e.g. after approving a reported
-- payment). Always logged with a reason.
create or replace function public.admin_grant_access(p_user_id uuid, p_plan_id text, p_days integer, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede dar acceso' using errcode = '42501';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Indica el motivo';
  end if;

  perform public.extend_entitlement(p_user_id, p_plan_id, p_days, 'manual');

  insert into public.admin_actions (admin_id, user_id, action, reason, details)
  values (auth.uid(), p_user_id, 'grant_access', p_reason, jsonb_build_object('plan_id', p_plan_id, 'days', p_days));
end;
$$;

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

  update public.entitlements set status = 'revoked' where user_id = p_user_id and plan_id = p_plan_id;

  insert into public.admin_actions (admin_id, user_id, action, reason, details)
  values (auth.uid(), p_user_id, 'revoke_access', p_reason, jsonb_build_object('plan_id', p_plan_id));
end;
$$;

-- Approve or reject a "Reporté mi pago". Approving marks the linked payment
-- paid (if any) and grants the plan's period.
create or replace function public.admin_review_payment_report(p_report_id uuid, p_approve boolean, p_plan_id text, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_report public.payment_reports;
  v_days integer;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede revisar pagos' using errcode = '42501';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Indica el motivo';
  end if;

  select * into v_report from public.payment_reports where id = p_report_id for update;
  if not found or v_report.status <> 'pending' then
    raise exception 'Reporte no encontrado o ya revisado';
  end if;

  update public.payment_reports
  set status = case when p_approve then 'approved' else 'rejected' end,
      reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_report_id;

  if p_approve then
    select duration_days into v_days from public.plans where id = p_plan_id;
    if v_report.payment_id is not null then
      update public.payments set status = 'paid', paid_at = coalesce(paid_at, now())
      where id = v_report.payment_id and status <> 'paid';
    end if;
    perform public.extend_entitlement(v_report.user_id, p_plan_id, coalesce(v_days, 0), 'manual');
  end if;

  insert into public.admin_actions (admin_id, user_id, action, reason, details)
  values (
    auth.uid(), v_report.user_id,
    case when p_approve then 'approve_payment_report' else 'reject_payment_report' end,
    p_reason, jsonb_build_object('report_id', p_report_id, 'plan_id', p_plan_id)
  );
end;
$$;

revoke execute on function public.admin_grant_access(uuid, text, integer, text) from public, anon;
revoke execute on function public.admin_revoke_access(uuid, text, text) from public, anon;
revoke execute on function public.admin_review_payment_report(uuid, boolean, text, text) from public, anon;
grant execute on function public.admin_grant_access(uuid, text, integer, text) to authenticated;
grant execute on function public.admin_revoke_access(uuid, text, text) to authenticated;
grant execute on function public.admin_review_payment_report(uuid, boolean, text, text) to authenticated;

-- ======================================================================= storage

-- Lesson PDFs: private; a signed URL is issued only to someone the select
-- policy allows (admin, or access to the lesson's course).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lesson-files', 'lesson-files', false, 52428800, array['application/pdf'])
on conflict (id) do nothing;

-- Payment receipts: private, images or PDF up to 5 MB (spec).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

create policy "Read lesson files with access"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'lesson-files'
    and (
      (select public.is_admin())
      or exists (
        select 1 from public.lesson_attachments a
        join public.lessons l on l.id = a.lesson_id
        join public.modules m on m.id = l.module_id
        join public.courses c on c.id = m.course_id
        where a.storage_path = name
          and l.is_published and m.is_published and c.is_published
          and public.has_course_access(c.id)
      )
    )
  );

create policy "Admins upload lesson files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'lesson-files' and (select public.is_admin()));

create policy "Admins update lesson files"
  on storage.objects for update to authenticated
  using (bucket_id = 'lesson-files' and (select public.is_admin()))
  with check (bucket_id = 'lesson-files' and (select public.is_admin()));

create policy "Admins delete lesson files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'lesson-files' and (select public.is_admin()));

create policy "Users upload own receipts"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users read own receipts, admins read all"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'receipts'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin()))
  );
