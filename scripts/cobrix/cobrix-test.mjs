#!/usr/bin/env node
// Banco de pruebas de la pasarela Cobrix. Solo sandbox: ver assertSandbox().
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(HERE, '.env');
const LOG_PATH = join(HERE, 'webhooks.log');

// ---------------------------------------------------------------- env

function loadEnv(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length >= 2) value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}

const env = loadEnv(ENV_PATH);
const API_KEY = env.COBRIX_API_KEY ?? '';
const WEBHOOK_SECRET = env.COBRIX_WEBHOOK_SECRET ?? '';
const BASE_URL = (env.COBRIX_BASE_URL || 'https://sandbox-api.cobrix.co/api').replace(/\/+$/, '');
const PROVIDER = env.COBRIX_PROVIDER || 'lorenzo-broker';

function assertSandbox() {
  if (!BASE_URL.toLowerCase().includes('sandbox')) {
    console.error(`ABORTADO: COBRIX_BASE_URL no parece sandbox -> ${BASE_URL}`);
    console.error('Este script es solo para pruebas. Ajusta COBRIX_BASE_URL en scripts/cobrix/.env');
    process.exit(1);
  }
}

function assertApiKey() {
  if (!API_KEY || API_KEY.startsWith('pega_')) {
    console.error('ABORTADO: falta COBRIX_API_KEY en scripts/cobrix/.env');
    process.exit(1);
  }
}

function assertWebhookSecret() {
  if (!WEBHOOK_SECRET) {
    console.error('ABORTADO: falta COBRIX_WEBHOOK_SECRET en scripts/cobrix/.env');
    process.exit(1);
  }
}

// ---------------------------------------------------------------- utils

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const name = token.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        flags[name] = true;
      } else {
        flags[name] = next;
        i++;
      }
    } else {
      positional.push(token);
    }
  }
  return { flags, positional };
}

function dueDate(daysAhead = 3) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

function show(label, value) {
  console.log(`${label}: ${value}`);
}

function printResponse(res) {
  show('HTTP', `${res.status}`);
  console.log('--- respuesta ---');
  console.log(res.json !== null ? JSON.stringify(res.json, null, 2) : res.text || '(cuerpo vacío)');
  console.log('-----------------');
  const link = res.json?.payment?.payment_link;
  if (link) {
    console.log('');
    console.log('>>> payment_link:');
    console.log(`>>> ${link}`);
    console.log('');
  }
}

async function api(method, path, { body, idempotencyKey } = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { Authorization: `Bearer ${API_KEY}` };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (idempotencyKey) headers['x-idempotency'] = idempotencyKey;

  console.log(`${method} ${url}`);
  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, ok: res.ok, text, json };
}

function buildInvoiceBody({ cedula, amount, name, email }) {
  const body = {
    reference: cedula,
    provider: PROVIDER,
    provider_id: `test-${Date.now()}`,
    amount: Number(amount),
    due_date: dueDate(3),
  };
  if (name) body.name = name;
  if (email) body.email = email;
  return body;
}

// ---------------------------------------------------------------- comandos API

async function cmdCreate(flags) {
  assertApiKey();
  const { cedula, amount, name, email } = flags;
  if (!cedula || amount === undefined || amount === true) {
    console.error('Uso: create --cedula V12345678 --amount 1 [--name "Nombre"] [--email a@b.com]');
    process.exit(1);
  }
  if (!Number.isFinite(Number(amount))) {
    console.error(`amount inválido: ${amount}`);
    process.exit(1);
  }

  const body = buildInvoiceBody({ cedula, amount, name, email });
  const idempotencyKey = randomUUID();

  show('x-idempotency', idempotencyKey);
  console.log('--- body enviado ---');
  console.log(JSON.stringify(body, null, 2));
  console.log('--------------------');

  const res = await api('POST', '/v1/invoices', { body, idempotencyKey });
  printResponse(res);
  if (!res.ok) process.exitCode = 1;
}

async function cmdGet(positional) {
  assertApiKey();
  const id = positional[0];
  if (!id) {
    console.error('Uso: get <id>');
    process.exit(1);
  }
  const res = await api('GET', `/v1/invoices/${encodeURIComponent(id)}`);
  printResponse(res);
  if (!res.ok) process.exitCode = 1;
}

async function cmdList() {
  assertApiKey();
  const res = await api('GET', '/v1/invoices');
  printResponse(res);
  if (!res.ok) process.exitCode = 1;
}

async function cmdCancel(positional) {
  assertApiKey();
  const id = positional[0];
  if (!id) {
    console.error('Uso: cancel <id>');
    process.exit(1);
  }
  const res = await api('DELETE', `/v1/invoices/${encodeURIComponent(id)}`);
  printResponse(res);
  if (!res.ok) process.exitCode = 1;
}

async function cmdIdem(flags) {
  assertApiKey();
  const cedula = flags.cedula || 'V12345678';
  const amount = Number(flags.amount ?? 1);
  const name = flags.name || 'Prueba Idempotencia';
  const email = flags.email;

  const body = buildInvoiceBody({ cedula, amount, name, email });
  const key = randomUUID();

  console.log('Probando idempotencia con una sola x-idempotency para las 3 llamadas.');
  show('x-idempotency', key);
  console.log('');

  console.log('[1/3] body original');
  const first = await api('POST', '/v1/invoices', { body, idempotencyKey: key });
  printResponse(first);

  console.log('[2/3] mismo body, misma key -> debería repetir el resultado');
  const second = await api('POST', '/v1/invoices', { body, idempotencyKey: key });
  printResponse(second);

  const conflictBody = { ...body, amount: amount + 1 };
  console.log('[3/3] amount distinto, misma key -> debería dar conflicto');
  const third = await api('POST', '/v1/invoices', { body: conflictBody, idempotencyKey: key });
  printResponse(third);

  const idOf = (res) => res.json?.id ?? res.json?.invoice?.id ?? null;
  const sameId = idOf(first) !== null && idOf(first) === idOf(second);

  console.log('');
  console.log('===== resumen idempotencia =====');
  show('1) body original       ', `HTTP ${first.status}`);
  show('2) repetido, misma key ', `HTTP ${second.status}`);
  show('3) amount != , misma key', `HTTP ${third.status}`);
  show('¿1 y 2 devolvieron el mismo id?', sameId ? `sí (${idOf(first)})` : 'no');
  const conflicted = third.status === 409 || third.status === 422;
  show('¿3 fue rechazada?', conflicted ? `sí (HTTP ${third.status})` : `NO — revisar (HTTP ${third.status})`);
  console.log('================================');
}

// ---------------------------------------------------------------- webhook

function safeEqualHex(expectedHex, providedHex) {
  const a = Buffer.from(expectedHex, 'hex');
  const b = Buffer.from(String(providedHex).trim(), 'hex');
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Dos formatos: hex plano, o "t=<ts>,v1=<hex>" (firma sobre "<ts>.<raw>", ventana 300 s).
function verifySignature(rawBody, header, secret) {
  if (!header) return { ok: false, reason: 'falta el header x-cobrix-signature' };

  if (header.includes('t=') && header.includes('v1=')) {
    const parts = {};
    for (const chunk of header.split(',')) {
      const eq = chunk.indexOf('=');
      if (eq === -1) continue;
      parts[chunk.slice(0, eq).trim()] = chunk.slice(eq + 1).trim();
    }
    const ts = parts.t;
    const provided = parts.v1;
    if (!ts || !provided) return { ok: false, reason: 'header t=/v1= incompleto', scheme: 't,v1' };
    if (!/^\d+$/.test(ts)) return { ok: false, reason: `timestamp inválido: ${ts}`, scheme: 't,v1' };

    const age = Math.abs(Math.floor(Date.now() / 1000) - Number(ts));
    if (age > 300) {
      return { ok: false, reason: `timestamp fuera de ventana (${age}s > 300s)`, scheme: 't,v1' };
    }

    const expected = createHmac('sha256', secret).update(`${ts}.`).update(rawBody).digest('hex');
    const ok = safeEqualHex(expected, provided);
    return { ok, reason: ok ? 'firma válida' : 'la firma v1 no coincide', scheme: 't,v1' };
  }

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const ok = safeEqualHex(expected, header);
  return { ok, reason: ok ? 'firma válida' : 'la firma no coincide', scheme: 'hex' };
}

function cmdWebhook(flags) {
  assertWebhookSecret();
  const port = Number(flags.port ?? 3000);
  const seenEvents = new Set();

  const server = createServer((req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(405).end();
      return;
    }

    // El cuerpo se acumula crudo: la firma se calcula sobre estos bytes, sin parsear.
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks);
      const signature = req.headers['x-cobrix-signature'];
      const eventId = req.headers['x-cobrix-event-id'];
      const verdict = verifySignature(raw, signature, WEBHOOK_SECRET);

      console.log('');
      console.log('================ webhook recibido ================');
      show('hora', new Date().toISOString());
      for (const [name, value] of Object.entries(req.headers)) {
        if (name.toLowerCase().startsWith('x-cobrix-')) show(name, value);
      }
      show('firma', `${verdict.ok ? 'VÁLIDA' : 'INVÁLIDA'} (${verdict.scheme ?? '-'}) — ${verdict.reason}`);

      const text = raw.toString('utf8');
      let parsed = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = null;
      }
      console.log('--- body ---');
      console.log(parsed !== null ? JSON.stringify(parsed, null, 2) : text || '(vacío)');
      console.log('------------');

      if (!verdict.ok) {
        console.log('-> 401');
        console.log('==================================================');
        res.writeHead(401).end();
        return;
      }

      if (eventId && seenEvents.has(eventId)) {
        console.log(`-> 200 (duplicado de ${eventId}, no se vuelve a registrar)`);
        console.log('==================================================');
        res.writeHead(200).end();
        return;
      }
      if (eventId) seenEvents.add(eventId);

      const entry = {
        received_at: new Date().toISOString(),
        event_id: eventId ?? null,
        signature_scheme: verdict.scheme ?? null,
        headers: Object.fromEntries(
          Object.entries(req.headers).filter(([name]) => name.toLowerCase().startsWith('x-cobrix-'))
        ),
        body: parsed !== null ? parsed : text,
      };
      appendFileSync(LOG_PATH, `${JSON.stringify(entry)}\n`, 'utf8');

      console.log(`-> 200 (registrado en ${LOG_PATH})`);
      console.log('==================================================');
      res.writeHead(200).end();
    });
  });

  server.listen(port, () => {
    console.log(`Receptor de webhooks escuchando en http://localhost:${port}`);
    console.log(`Secreto cargado desde ${ENV_PATH}`);
    console.log(`Eventos válidos se agregan a ${LOG_PATH}`);
    console.log('Ctrl+C para detener.');
  });
}

// ---------------------------------------------------------------- cli

function usage() {
  console.log(`Pruebas de Cobrix (solo sandbox)

  node cobrix-test.mjs create --cedula V12345678 --amount 1 [--name "Nombre"] [--email a@b.com]
  node cobrix-test.mjs get <id>
  node cobrix-test.mjs list
  node cobrix-test.mjs cancel <id>
  node cobrix-test.mjs idem [--cedula ...] [--amount 1]
  node cobrix-test.mjs webhook [--port 3000]

Configuración en scripts/cobrix/.env:
  COBRIX_API_KEY, COBRIX_WEBHOOK_SECRET, COBRIX_BASE_URL, COBRIX_PROVIDER

  base     ${BASE_URL}
  provider ${PROVIDER}
`);
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const command = positional.shift();

  if (!command || command === 'help' || flags.help) {
    usage();
    return;
  }

  assertSandbox();

  switch (command) {
    case 'create':
      await cmdCreate(flags);
      break;
    case 'get':
      await cmdGet(positional);
      break;
    case 'list':
      await cmdList();
      break;
    case 'cancel':
      await cmdCancel(positional);
      break;
    case 'idem':
      await cmdIdem(flags);
      break;
    case 'webhook':
      cmdWebhook(flags);
      break;
    default:
      console.error(`Comando desconocido: ${command}`);
      usage();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error:', err?.message ?? err);
  process.exit(1);
});
