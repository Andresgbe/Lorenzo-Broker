# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Lorenzo-Broker (React + TypeScript + Vite) started as a single-page marketing site for a trading/investing community and is growing into a platform: the marketing pages plus a student area (modules, classes), a checkout, and an admin panel. Content is in Spanish — user-facing copy, labels and errors are written in Spanish.

Designs live in a Claude Design canvas, "Lorenzo Broker — Vistas plataforma" (https://claude.ai/artifact/CZpokBUGWomiVhRv5powms). Views are implemented one at a time, in the user's order — ask for the specific screen rather than guessing, and ask for a screenshot of its artboard: the canvas uses the newer file-based format, which the Artifact tool in some sessions cannot enumerate or read.

## Design system — read it before any UI work

The brand's design system is the artifact **"Lorenzo Broker"**: https://claude.ai/artifact/EY57tXbUVdi5hG2XtkxQLM. It holds the palette with contrast checks, the type scale (Playfair Display + Inter), radii, glows, voice and copy rules, iconography, the logos and photos, and a guideline + preview per shared component (Button, TextField, FormAlert, StatusPill, SectionHeading, Logo, MediaPlaceholder, BenefitCard).

**Before changing UI or adding a view, read its `project/README.md`** (Artifact tool, `read_file`) and the README of every component you touch, and build from those tokens and rules. The canvas above says *what* a screen contains; the design system says *how* it looks and reads.

Keep the two in sync: `src/index.css` `@theme` is the code's copy of the tokens. If you add or change a token, a component's look, or a copy rule in code, update the design system too (read the file, edit, publish only the changed `project/` files, then the index `project/design-system.json` last with a new `lastChange`). Hex literals that exist only in components today (`#c6cedb`, `#aab4c5`, `#6f7a8b`, `#49546a`, `#5b6577`) are documented there as `ink-soft`, `nav-text`, `faint`, `step-idle`, `lock` — promote them to `@theme` instead of copying them again.

Build status by artboard:

- **Acceso — done.** 01 Registro, 02 Iniciar sesión, 03 Recuperar contraseña, 04 Nueva contraseña.
- **Pago con Cobrix — UI done, no backend.** 05 Elegir plan, 06 Resumen, 07 En verificación, 08 Confirmado. The four screens navigate as a flow but nothing is persisted and Cobrix is never called: "Pagar con Cobrix" just routes to 07. Payments are Venezuelan rails (PagoMóvil, transferencia, Zelle, Binance Pay) with manual verification, so 07 is a real state the user can sit in for hours, not a spinner. The sandbox harness in `scripts/cobrix/` exists but has never been run against the live API.
- **Área del alumno — UI done, no backend, NOT PROTECTED.** 09 Inicio, 10 Módulos, 11 Clase, 12 Mi cuenta, 13 Membresía vencida. Routes nest under a `student-nav` layout route. Course content and membership are hardcoded demo data in `entities/course` and `entities/membership`; the account forms and "Guardar cambios" do nothing. **Anyone can open `/alumno` without signing in** — there is deliberately no guard yet so the screens can be reviewed. Before any real content is wired, these routes need an auth guard (and the lesson media needs server-side authorization: a guard in React only hides the page, it does not protect a video URL).
- **Panel de administración — UI done, no backend.** 14 Resumen, 15 Alumnos, 16 Pagos, 17 Contenido. Nested under `admin-shell` (sidebar layout) and wrapped in `RequireAdmin`, so `role=admin` is required — unlike the student area, these routes *are* gated. `/admin` itself stays the login/entry page. Search and filters work client-side over demo arrays in `entities/student` and `entities/payment`; every action button (Confirmar, Rechazar, Guardar cambios, Exportar CSV, Ver detalle) is inert.

The schema for those groups is written in `supabase/migrations/0003_platform_schema.sql` (profiles, plans, memberships, payments, course_modules, lessons, lesson_progress, private `lessons` bucket, `confirm_payment`/`reject_payment` RPCs). No UI reads it yet. Confirm with the user that 0003 was applied before wiring anything to it.

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

Routes are a mix: some older marketing ones are English (`/about`, `/mentorship`, `/faq`), everything newer is Spanish (`/registro`, `/suscripcion`, `/alumno`). That inconsistency is known; use Spanish for anything new.

**Discord is gone.** The product no longer uses it — do not reintroduce a Discord link, icon or mention anywhere. The old Discord showcase (`community-section`, `/community`) and its successor (`platform-section`, `/plataforma`, the "La plataforma — Todo el temario" module browser) were both removed on the user's request; don't bring either back. Course modules are shown only inside the student area.

Marketing and admin pages render inside `Layout` (Navbar + Footer). Auth pages are registered at the router's top level, outside `Layout`, and bring their own chrome via the `auth-shell` widget — a minimal header (logo + one contextual link) around a centered card.

`vite.config.ts` sets `base` to `/Lorenzo-Broker/` in `gh-pages` mode, so the router takes a `basename` from `import.meta.env.BASE_URL`. Any absolute URL built in code must account for that base (see `absoluteUrl` in `entities/session/model/AuthContext.tsx`).

## Auth and roles

Auth is Supabase (`shared/lib/supabaseClient.ts`, which returns `null` when env vars are absent — every call site must handle that). `entities/session` owns it and exposes `useAuth()`.

**There are two kinds of user, and the distinction is load-bearing:**

- `isAuthenticated` — somebody is signed in. Says nothing about permissions.
- `isAdmin` — `app_metadata.role === 'admin'`. **Every admin-only surface must gate on `isAdmin`, never on `isAuthenticated`.** The inline content editors (`PricingSection`, `FaqSection`, `IncludesSection`) and `RequireAdmin` all do.

The role is read from `app_metadata` because only the server can write it. Never move it to `user_metadata` — users can edit their own `user_metadata`, which would let any student grant themselves admin.

Granting admin is a server-side action, done once per admin account:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
where email = 'admin@example.com';
```

**Client-side gating is cosmetic.** It hides UI; it does not protect data. The real boundary is Row Level Security on the Supabase tables (`site_content` above all) — a write policy that requires the admin role. Treat any change that widens who can write as needing an RLS review.

Student access lives at `/registro`, `/iniciar-sesion`, `/recuperar-contrasena` and `/nueva-contrasena`. Admin access lives at `/admin`, deliberately separate.

Current admin accounts (role set 2026-10-18): `menteclon500@gmail.com` and `lorenzoperezus@gmail.com` (Lorenzo, the client). A role change only reaches the browser after signing out and back in, because the role travels inside the JWT.

## Editing site content (the client's workflow)

The client edits the marketing copy himself; this is a core feature, not an admin nicety.

1. He signs in at **`/admin`** (`pages/login` + `features/admin-login`). On success `LoginForm` sends him to the home page.
2. On the public pages, editable parts show inline editors when `isAdmin`: **PricingSection** (`pricing.plan`), **IncludesSection** (`includes.items`, drag to reorder, Bonus toggle), **FaqSection** (`faq.items`; full editing on `/faq`, choosing which questions appear on the home from the home itself), **AboutPage** (`about.page`) and **MentorshipPage** (`mentorship.page`). Fields save on blur.

   The two pages use the reusable path, which new editable content should follow too: `useSiteContentDraft(key, defaults)` from `entities/site-content` (draft + `update` / `commit` on blur / `replace` for add-remove), `shared/ui/EditableText` (the in-place input/textarea), `shared/ui/EditableParagraphs` (paragraph list with add/remove) and `shared/ui/RichText` (renders `**palabra**` as emphasis — the only formatting stored copy supports). Keep defaults equal to the current copy so a fresh environment looks the same.
3. Everything lands in one JSON row: `site_content` where `id = 'site'`, one key per section. The stored value overrides the widget's default array.

Known gaps — ask before assuming they are wanted, but keep them in mind:
- Still hardcoded: the Hero, the closing CTA, the footer, the About photos, and the mentorship application URL (`EXTERNAL_LINKS.mentorshipApplication`, still `REPLACE_ME`).
- `/admin` shows no link to the admin panel (`/admin/resumen`) once signed in; it only offers "Cerrar sesión".
- `LoginForm` hand-rolls its inputs instead of using `TextField`.

## Supabase project

- Project **LBP**, ref `vwqivhvhlrzjiqvwnhno` (us-east-1), org "PROJECTS ENVIROMENT". `.env.local` and the GitHub Pages secrets point at it.
- Migrations live in `supabase/migrations/`, numbered. 0001 (site_content) and 0002 (admin-only writes) are applied. 0003 (platform schema) and 0004 (strip Discord leftovers from site_content) are written; check with the user whether they ran them.
- Applying SQL: Claude cannot run it from here. The claude.ai Supabase connector only sees another org, and the CLI (`supabase link` done, `supabase/.temp/` gitignored) times out connecting to the pooler. Write the migration file and have the user paste it into LBP's SQL Editor, then paste results back.

Password recovery relies on Supabase's `detectSessionInUrl` (on by default): the emailed link lands on `/nueva-contrasena` carrying a one-time recovery session, which `supabase-js` picks up from the URL before the page renders. So that page gates on having *any* session — no session means the link expired, was already used, or someone typed the URL. After `updateUser({ password })` it signs out and sends the user to `/iniciar-sesion`, so the new password is actually exercised and no recovery session lingers.

## Checkout

Four routes under `/suscripcion`, outside `Layout`, wrapped in the `checkout-shell` widget (header + 3-step indicator + width presets).

The chosen plan travels in `?plan=<id>`, not in context or router state, so a refresh or a shared link still works. Steps 06-08 read it with `useSelectedPlan()` and `<Navigate>` back to step 1 when it is missing or unknown — keep that guard on any new checkout screen.

**There is one plan: `MAIN_PLAN`, $29/month.** `PLANS` stays an array because the checkout already navigates by id, so adding a plan is adding an entry — but every screen today renders the single plan. `PRICE_PLACEHOLDER` survives only for amounts that genuinely cannot be computed; prices that are known render through `formatPrice`.

Plan perks and payment-method timings are provisional copy inferred from the design thumbnails — the user approved them as stand-ins, not as final text. They are flagged with comments in `entities/plan/model/plans.ts` and `shared/config/payment-methods.ts`.

## Forms

Build forms from `shared/ui/TextField` and `shared/ui/FormAlert` rather than hand-rolling inputs, so labels, hints, error text and `aria-describedby`/`aria-invalid` stay consistent. `TextField` takes a `control` render prop for composite inputs (see the cédula/RIF field in `features/register`).

Conventions in place:

- Validation rules live in the feature's `model/` (e.g. `features/register/model/validation.ts`), separate from the component, and return a `Partial<Record<field, string>>`.
- Shared rules (email shape, minimum password length) live in `shared/lib/validation.ts`.
- Forms use `noValidate` and render their own messages, so the copy stays in Spanish and matches the design.
- Field errors clear as the user edits that field.
- **Auth errors must not reveal whether an account exists.** Sign-in always says "Correo o contraseña incorrectos"; password reset always confirms it sent something. Don't "improve" these into specific messages.

## Notable conventions/state

- `src/shared/config/external-links.ts` still holds `https://REPLACE_ME` for `whopCheckout`, `mentorshipApplication` and `whatsappSupport`. Instagram is set.
- Styling is Tailwind CSS v4 via `@tailwindcss/vite` — no `tailwind.config`; the theme tokens are CSS variables in `src/index.css` (`--color-bg`, `--color-accent`, …), used as Tailwind classes (`bg-bg`, `text-accent`).
- Animations use `framer-motion` (scroll-in pattern: `initial`/`whileInView`/`viewport`).
- Icons are inline SVG components defined locally in the widget that uses them (`LockIcon` in `PlatformSection`, `InstagramIcon` in `Footer`). There is no shared icon module; follow the local pattern.
- Several home sections are live-editable by an admin and persist through `entities/site-content` to the Supabase `site_content` table. The arrays in those widgets (e.g. `DEFAULT_FAQ_ITEMS`) are **defaults only** — once a value is saved, the stored row wins and editing the default changes nothing on a configured environment.
- Images are imported from `src/shared/assets/images/` so Vite fingerprints them. Compress before committing; `public/` is only for files needing a fixed URL (`favicon.png`).
- `scripts/cobrix/` is a standalone sandbox test harness for the Cobrix payment gateway (plain Node, no deps, not part of the Vite build). Its `.env` and `webhooks.log` are gitignored.
