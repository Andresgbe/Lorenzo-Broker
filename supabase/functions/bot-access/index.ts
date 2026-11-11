// Gives web access to whoever pays through Lorenzo's Telegram bot. Only the bot
// calls it, with the shared secret BOT_ACCESS_SECRET in the x-bot-secret header,
// so it runs without a user JWT (deploy with --no-verify-jwt).
//
// Actions:
//   payment     the bot confirmed a payment: applies it if the Telegram user is
//               linked to an account, or keeps it pending until they give an email.
//   link        the payer gave their email: creates the account (or finds it),
//               links it and applies the pending payments.
//   login_link  the payer asks for a new way in (/web in the bot).
//
// One-time login links only go to accounts the bot created
// (profiles.telegram_can_login). An account that already existed is never opened
// from Telegram: whoever types its email in the bot is not proven to own it.
//
// Secrets: BOT_ACCESS_SECRET, SITE_URL (where the login link lands, e.g.
// https://andresgbe.github.io/Lorenzo-Broker/alumno). SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY come with every Edge Function.
import { createClient } from 'npm:@supabase/supabase-js@2.45.0';
import { z } from 'npm:zod@3.23.8';

const Payment = z.object({
  action: z.literal('payment'),
  ref: z.string().min(3).max(120),
  telegram_id: z.number().int().positive(),
  plan: z.enum(['mensual', 'anual']),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  asset: z.string().min(2).max(10),
  method: z.enum(['crypto-pay', 'manual']),
});

const Link = z.object({
  action: z.literal('link'),
  telegram_id: z.number().int().positive(),
  email: z.string().trim().toLowerCase().email().max(254),
  full_name: z.string().trim().max(120).optional(),
});

const LoginLink = z.object({
  action: z.literal('login_link'),
  telegram_id: z.number().int().positive(),
});

const Body = z.discriminatedUnion('action', [Payment, Link, LoginLink]);

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function sameSecret(given: string, expected: string) {
  if (!expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

interface ProfileRow {
  id: string;
  email: string;
  telegram_id: number | null;
  telegram_can_login: boolean;
}

async function profileByTelegram(telegramId: number): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, telegram_id, telegram_can_login')
    .eq('telegram_id', telegramId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function profileByEmail(email: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, telegram_id, telegram_can_login')
    .ilike('email', email)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function applyPayment(userId: string, p: { ref: string; plan: string; amount: string; asset: string; method: string }) {
  const { data, error } = await supabase.rpc('bot_apply_payment', {
    p_user_id: userId,
    p_plan_id: p.plan,
    p_ref: p.ref,
    // Céntimos del monto en la moneda de cobro: en USDT equivale a dólares.
    p_amount_cents: Math.round(Number(p.amount) * 100),
    p_method: p.method,
    p_reference: `Telegram · ${p.amount} ${p.asset} · ${p.ref}`,
  });
  if (error) throw error;
  return data === true;
}

async function applyPending(telegramId: number, userId: string) {
  const { data, error } = await supabase
    .from('bot_pending_payments')
    .select('ref, plan_id, amount, asset, method')
    .eq('telegram_id', telegramId)
    .is('applied_at', null)
    .order('created_at');
  if (error) throw error;
  let applied = 0;
  for (const row of data ?? []) {
    if (await applyPayment(userId, { ref: row.ref, plan: row.plan_id, amount: row.amount, asset: row.asset, method: row.method })) {
      applied++;
    }
    await supabase.from('bot_pending_payments').update({ applied_at: new Date().toISOString(), user_id: userId }).eq('ref', row.ref);
  }
  return applied;
}

async function loginLink(email: string) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: Deno.env.get('SITE_URL') ?? undefined },
  });
  if (error) throw error;
  return data.properties.action_link;
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!sameSecret(request.headers.get('x-bot-secret') ?? '', Deno.env.get('BOT_ACCESS_SECRET') ?? '')) {
    return json(401, { error: 'unauthorized' });
  }

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json(400, { error: 'invalid_body' });
  const body = parsed.data;

  try {
    if (body.action === 'payment') {
      const profile = await profileByTelegram(body.telegram_id);
      if (!profile) {
        const { error } = await supabase.from('bot_pending_payments').upsert(
          { ref: body.ref, telegram_id: body.telegram_id, plan_id: body.plan, amount: body.amount, asset: body.asset, method: body.method },
          { onConflict: 'ref', ignoreDuplicates: true },
        );
        if (error) throw error;
        return json(200, { status: 'need_email' });
      }
      const applied = await applyPayment(profile.id, body);
      return json(200, {
        status: 'applied',
        applied,
        login_link: profile.telegram_can_login ? await loginLink(profile.email) : null,
      });
    }

    if (body.action === 'login_link') {
      const profile = await profileByTelegram(body.telegram_id);
      if (!profile) return json(200, { status: 'need_email' });
      if (!profile.telegram_can_login) return json(200, { status: 'use_password', email: profile.email });
      return json(200, { status: 'link', login_link: await loginLink(profile.email) });
    }

    // body.action === 'link'
    const linked = await profileByTelegram(body.telegram_id);
    if (linked && linked.email.toLowerCase() !== body.email) {
      return json(200, { status: 'already_linked', email: linked.email });
    }

    const existing = linked ?? (await profileByEmail(body.email));
    if (existing) {
      if (existing.telegram_id && existing.telegram_id !== body.telegram_id) {
        return json(200, { status: 'email_taken' });
      }
      if (!existing.telegram_id) {
        const { error } = await supabase.from('profiles').update({ telegram_id: body.telegram_id }).eq('id', existing.id);
        if (error) throw error;
      }
      const applied = await applyPending(body.telegram_id, existing.id);
      if (existing.telegram_can_login) {
        return json(200, { status: 'created', applied, login_link: await loginLink(existing.email) });
      }
      return json(200, { status: 'existing_account', applied, email: existing.email });
    }

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: body.email,
      email_confirm: true,
      user_metadata: { full_name: body.full_name ?? null, needs_password: true, created_by_bot: true },
    });
    if (createError) throw createError;
    // El trigger handle_new_user ya creó el perfil; aquí se vincula con Telegram.
    const { error: linkError } = await supabase
      .from('profiles')
      .update({ telegram_id: body.telegram_id, telegram_can_login: true })
      .eq('id', created.user.id);
    if (linkError) throw linkError;
    const applied = await applyPending(body.telegram_id, created.user.id);
    return json(200, { status: 'created', applied, login_link: await loginLink(body.email) });
  } catch (error) {
    console.error('bot-access', body.action, error);
    return json(500, { error: 'server_error' });
  }
});
