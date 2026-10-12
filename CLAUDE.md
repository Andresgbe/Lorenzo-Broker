# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Lorenzo-Broker (React + TypeScript + Vite) started as a single-page marketing site for a trading/investing community and is growing into a platform: the marketing pages plus a student area (modules, classes), a checkout, and an admin panel. Content is in Spanish — user-facing copy, labels and errors are written in Spanish.

Designs live in a Claude Design canvas, "Lorenzo Broker — Vistas plataforma" (https://claude.ai/artifact/CZpokBUGWomiVhRv5powms). Views are implemented one at a time, in the user's order — ask for the specific screen rather than guessing, and ask for a screenshot of its artboard: the canvas uses the newer file-based format, which the Artifact tool in some sessions cannot enumerate or read.

Build status by artboard:

- **Acceso — done.** 01 Registro, 02 Iniciar sesión, 03 Recuperar contraseña, 04 Nueva contraseña.
- **Pago con Cobrix — UI done, no backend.** 05 Elegir plan, 06 Resumen, 07 En verificación, 08 Confirmado. The four screens navigate as a flow but nothing is persisted and Cobrix is never called: "Pagar con Cobrix" just routes to 07. Payments are Venezuelan rails (PagoMóvil, transferencia, Zelle, Binance Pay) with manual verification, so 07 is a real state the user can sit in for hours, not a spinner. The sandbox harness in `scripts/cobrix/` exists but has never been run against the live API.
- **Área del alumno — UI done, no backend, NOT PROTECTED.** 09 Inicio, 10 Módulos, 11 Clase, 12 Mi cuenta, 13 Membresía vencida. Routes nest under a `student-nav` layout route. Course content and membership are hardcoded demo data in `entities/course` and `entities/membership`; the account forms and "Guardar cambios" do nothing. **Anyone can open `/alumno` without signing in** — there is deliberately no guard yet so the screens can be reviewed. Before any real content is wired, these routes need an auth guard (and the lesson media needs server-side authorization: a guard in React only hides the page, it does not protect a video URL).
- **Panel de administración — UI done, no backend.** 14 Resumen, 15 Alumnos, 16 Pagos, 17 Contenido. Nested under `admin-shell` (sidebar layout) and wrapped in `RequireAdmin`, so `role=admin` is required — unlike the student area, these routes *are* gated. `/admin` itself stays the login/entry page. Search and filters work client-side over demo arrays in `entities/student` and `entities/payment`; every action button (Confirmar, Rechazar, Guardar cambios, Exportar CSV, Ver detalle) is inert.

None of the pending groups have database tables yet. Each will need schema plus RLS before its UI is worth wiring.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then build for production via Vite
- `npm run build:gh-pages` — production build for GitHub Pages (base `/Lorenzo-Broker/`)
- `npm run lint` — run ESLint over the project
- `npm run preview` — serve the production build locally

There is no test runner configured in this repo (no test script, no test files).

`npm run lint` currently reports 5 pre-existing `no-explicit-any` errors in `shared/ui/Button.tsx` (the framer-motion + react-router `Link` wrapper). They are unrelated to new work — don't treat them as regressions, and don't "fix" them as a drive-by.

## Architecture

The codebase follows **Feature-Sliced Design (FSD)**, layered under `src/`:

- `app/` — app-wide composition: `router.tsx` (react-router-dom `createBrowserRouter`) and `Layout.tsx` (persistent Navbar/Footer shell wrapping an `<Outlet />`).
- `pages/` — one folder per route, each composing widgets/features into a page.
- `widgets/` — larger composed UI blocks used by pages (`navbar`, `hero`, `footer`, `auth-shell`, …).
- `features/` — user-facing interactive behavior (`register`, `sign-in`, `password-reset`, `admin-login`, `subscribe-cta`, `video-player`).
- `entities/` — domain data shapes and their presentational units (`entities/benefit`, `entities/session`, `entities/site-content`).
- `shared/` — reusable, domain-agnostic code: `ui/` (`Button`, `Container`, `TextField`, `FormAlert`, …), `lib/` (`cn.ts`, `validation.ts`, `supabaseClient.ts`), `config/` (`routes.ts`, `external-links.ts`).

Each slice exposes a public API through an `index.ts` barrel file (re-exporting only what other slices should consume) — import from the slice's barrel (e.g. `from '../../entities/benefit'`), not from its internal `ui/`/`model/` files directly.

Import dependencies flow one direction only: `app` → `pages` → `widgets` → `features` → `entities` → `shared`. A lower layer must never import from a higher one.

There are no path aliases configured — cross-slice imports use relative paths (e.g. `../../shared/ui/Button`).

## Routing

`shared/config/routes.ts` is the single source of truth — never hardcode a path string in a component.

Marketing routes are English (`/about`, `/mentorship`, `/community`, `/faq`); the newer student-facing routes are Spanish (`/registro`, `/iniciar-sesion`, `/recuperar-contrasena`). That inconsistency is known and not yet resolved; follow Spanish for new student-facing routes.

Marketing and admin pages render inside `Layout` (Navbar + Footer). Auth pages are registered at the router's top level, outside `Layout`, and bring their own chrome via the `auth-shell` widget — a minimal header (logo + one contextual link) around a centered card.

`vite.config.ts` sets `base` to `/Lorenzo-Broker/` in `gh-pages` mode, so the router takes a `basename` from `import.meta.env.BASE_URL`. Any absolute URL built in code must account for that base (see `absoluteUrl` in `entities/session/model/AuthContext.tsx`).

## Auth and roles

Auth is Supabase (`shared/lib/supabaseClient.ts`, which returns `null` when env vars are absent — every call site must handle that). `entities/session` owns it and exposes `useAuth()`.

**There are two kinds of user, and the distinction is load-bearing:**

- `isAuthenticated` — somebody is signed in. Says nothing about permissions.
- `isAdmin` — `app_metadata.role === 'admin'`. **Every admin-only surface must gate on `isAdmin`, never on `isAuthenticated`.** The inline content editors (`PricingSection`, `FaqSection`, `CommunitySection`, `IncludesSection`) and `RequireAdmin` all do.

The role is read from `app_metadata` because only the server can write it. Never move it to `user_metadata` — users can edit their own `user_metadata`, which would let any student grant themselves admin.

Granting admin is a server-side action, done once per admin account:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
where email = 'admin@example.com';
```

**Client-side gating is cosmetic.** It hides UI; it does not protect data. The real boundary is Row Level Security on the Supabase tables (`site_content` above all) — a write policy that requires the admin role. Treat any change that widens who can write as needing an RLS review.

Student access lives at `/registro`, `/iniciar-sesion`, `/recuperar-contrasena` and `/nueva-contrasena`. Admin access lives at `/admin`, deliberately separate.

Password recovery relies on Supabase's `detectSessionInUrl` (on by default): the emailed link lands on `/nueva-contrasena` carrying a one-time recovery session, which `supabase-js` picks up from the URL before the page renders. So that page gates on having *any* session — no session means the link expired, was already used, or someone typed the URL. After `updateUser({ password })` it signs out and sends the user to `/iniciar-sesion`, so the new password is actually exercised and no recovery session lingers.

## Checkout

Four routes under `/suscripcion`, outside `Layout`, wrapped in the `checkout-shell` widget (header + 3-step indicator + width presets).

The chosen plan travels in `?plan=<id>`, not in context or router state, so a refresh or a shared link still works. Steps 06-08 read it with `useSelectedPlan()` and `<Navigate>` back to step 1 when it is missing or unknown — keep that guard on any new checkout screen.

Prices are the literal string `PRICE_PLACEHOLDER` (`[PRECIO]`), matching the designs. **Do not invent amounts.** When real prices exist they should come from Supabase alongside the other editable content, not be hardcoded in `entities/plan`.

Plan names, perks and payment-method timings are provisional copy inferred from the design thumbnails — the user approved them as stand-ins, not as final text. They are flagged with comments in `entities/plan/model/plans.ts` and `shared/config/payment-methods.ts`; replace them once the real artboards are available.

## Forms

Build forms from `shared/ui/TextField` and `shared/ui/FormAlert` rather than hand-rolling inputs, so labels, hints, error text and `aria-describedby`/`aria-invalid` stay consistent. `TextField` takes a `control` render prop for composite inputs (see the cédula/RIF field in `features/register`).

Conventions in place:

- Validation rules live in the feature's `model/` (e.g. `features/register/model/validation.ts`), separate from the component, and return a `Partial<Record<field, string>>`.
- Shared rules (email shape, minimum password length) live in `shared/lib/validation.ts`.
- Forms use `noValidate` and render their own messages, so the copy stays in Spanish and matches the design.
- Field errors clear as the user edits that field.
- **Auth errors must not reveal whether an account exists.** Sign-in always says "Correo o contraseña incorrectos"; password reset always confirms it sent something. Don't "improve" these into specific messages.

## Notable conventions/state

- `src/shared/config/external-links.ts` still holds `https://REPLACE_ME` for `whopCheckout`, `discordInvite` and `mentorshipApplication`. Instagram is set.
- Styling is Tailwind CSS v4 via `@tailwindcss/vite` — no `tailwind.config`; the theme tokens are CSS variables in `src/index.css` (`--color-bg`, `--color-accent`, …), used as Tailwind classes (`bg-bg`, `text-accent`).
- Animations use `framer-motion` (scroll-in pattern: `initial`/`whileInView`/`viewport`).
- Icons are inline SVG components defined locally in the widget that uses them (`LockIcon` in `CommunitySection`, `DiscordIcon` in `Footer`). There is no shared icon module; follow the local pattern.
- Several home sections are live-editable by an admin and persist through `entities/site-content` to the Supabase `site_content` table. The arrays in those widgets (e.g. `DEFAULT_CHANNEL_GROUPS`) are **defaults only** — once a value is saved, the stored row wins and editing the default changes nothing on a configured environment.
- Images are imported from `src/shared/assets/images/` so Vite fingerprints them. Compress before committing; `public/` is only for files needing a fixed URL (`favicon.png`).
- `scripts/cobrix/` is a standalone sandbox test harness for the Cobrix payment gateway (plain Node, no deps, not part of the Vite build). Its `.env` and `webhooks.log` are gitignored.
