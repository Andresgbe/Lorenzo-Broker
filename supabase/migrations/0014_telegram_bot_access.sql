-- Access to the web for whoever pays through the Telegram bot (Lorenzo's bot,
-- Crypto Pay in USDT). The bot calls the Edge Function `bot-access`, which runs
-- with the service role and uses what this migration adds:
--
--   - profiles.telegram_id links an account to a Telegram user. Users can't
--     write it: 0003 only grants update on full_name, tax_id and phone.
--   - profiles.telegram_can_login: true only for accounts the bot created. Only
--     those get one-time login links through Telegram; an account that already
--     existed is never opened from a chat, or anyone could type its email in
--     the bot and log in as its owner.
--   - payments.bot_ref (cp:<invoice_id> or manual:<...>) makes each bot payment
--     count once, however many times the bot reports it.
--   - bot_pending_payments keeps a payment until its payer gives an email.
--   - bot_apply_payment() records the payment and extends the membership in one
--     transaction. Service role only.
--
-- Depends on extend_entitlement() from 0008 and on the plans 'mensual' and 'anual'.

alter table public.profiles add column if not exists telegram_id bigint unique;
alter table public.profiles add column if not exists telegram_can_login boolean not null default false;

alter table public.payments add column if not exists bot_ref text unique;
alter table public.payments drop constraint if exists payments_method_check;
alter table public.payments
  add constraint payments_method_check
  check (method in ('pago-movil', 'transferencia', 'zelle', 'binance-pay', 'crypto-pay', 'manual'));

create table if not exists public.bot_pending_payments (
  ref text primary key,
  telegram_id bigint not null,
  plan_id text not null references public.plans (id),
  amount text not null,
  asset text not null,
  method text not null check (method in ('crypto-pay', 'manual')),
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  user_id uuid references auth.users (id) on delete set null
);

create index if not exists bot_pending_payments_telegram_idx
  on public.bot_pending_payments (telegram_id) where applied_at is null;

-- Only the service role touches it; admins can read it from the SQL editor or a future panel.
alter table public.bot_pending_payments enable row level security;
drop policy if exists "Admins read pending bot payments" on public.bot_pending_payments;
create policy "Admins read pending bot payments"
  on public.bot_pending_payments for select to authenticated
  using ((select public.is_admin()));
revoke all on public.bot_pending_payments from anon, authenticated;
grant select on public.bot_pending_payments to authenticated;

-- Records a bot payment and extends the plan's period. Returns false when that
-- ref was already applied, so a repeated call changes nothing.
create or replace function public.bot_apply_payment(
  p_user_id uuid,
  p_plan_id text,
  p_ref text,
  p_amount_cents integer,
  p_method text,
  p_reference text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_days integer;
  v_payment_id uuid;
begin
  if not public.is_service_role() then
    raise exception 'Solo el servidor puede aplicar pagos del bot' using errcode = '42501';
  end if;

  select duration_days into v_days from public.plans where id = p_plan_id and kind = 'subscription';
  if v_days is null then
    raise exception 'Plan no encontrado: %', p_plan_id;
  end if;

  insert into public.payments (user_id, plan_id, status, amount_usd_cents, method, reference, bot_ref, paid_at)
  values (p_user_id, p_plan_id, 'paid', greatest(p_amount_cents, 1), p_method, p_reference, p_ref, now())
  on conflict (bot_ref) do nothing
  returning id into v_payment_id;

  if v_payment_id is null then
    return false;
  end if;

  perform public.extend_entitlement(p_user_id, p_plan_id, v_days, 'payment');
  return true;
end;
$$;

revoke execute on function public.bot_apply_payment(uuid, text, text, integer, text, text) from public, anon, authenticated;
grant execute on function public.bot_apply_payment(uuid, text, text, integer, text, text) to service_role;
