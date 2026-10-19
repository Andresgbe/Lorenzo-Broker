# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Lorenzo-Broker (React + TypeScript + Vite) started as a single-page marketing site for a trading/investing community and is growing into a membership platform: the marketing pages plus a student area (courses, modules, classes), a checkout, and an admin panel. Content is in Spanish — user-facing copy, labels and errors are written in Spanish.

## The spec — source of truth for scope

The platform is built against **"Spec – Plataforma de membresía Lorenzo Broker"** (Lorenzo Pérez, 29/09/2026; the user's copy is `Spec_Lorenzo_Broker_Plataforma_Membresia.pdf`), sold to the client as quote COT-2026-LB02 by AG Software Agency. When a requirement is unclear, the spec decides; ask the user before deviating from it. Key points:

- **Goal:** students (≈90% Venezuelan, mostly on phones) pay in bolívares through **Cobrix** (Pago Móvil, transferencia; Zelle and Binance Pay if Lorenzo enables them) and get access automatically. Stripe/Whop/Kajabi don't work in Venezuela. Operating cost under USD 50/month.
- **Stack change agreed in the quote:** stay on this React + Supabase app (not Next.js/Vercel). Server work goes in **Supabase Edge Functions + pg_cron**: Cobrix checkout and webhook, signed URLs, reconciliation, emails.
- **Content:** Product (plan) → Course → Module → Lesson. A lesson has title, description, an optional video and optional PDF attachments. The membership includes **5 courses**; the client creates and orders them himself from the admin panel (`/admin/cursos`).
- **Videos:** **Bunny Stream** with token auth. The admin pastes the Bunny video ID; the server issues a signed URL (≤2 h, domain-restricted) only after checking access. Optional email watermark. **PDFs:** private Supabase bucket, short-lived signed URLs, same access check.
- **Access rule:** checked on the server for every content request: `now < expires_at + grace_days`. Paying while active extends from the current expiry; paying while expired starts from the payment date. Grace defaults to 2 days and is configured per plan. One-time products never expire.
- **Payments:** access is granted **only** by a verified Cobrix webhook (signature check, idempotency through `webhook_events.event_id`, amount check → `review` on mismatch), or by a logged admin action. Never by the browser redirect. Reconciliation runs every 15 min; `pending` older than 48 h → `expired`. "Reporté mi pago" uploads a receipt (images/PDF, ≤5 MB) for manual approval.
- **Emails** (Resend, Spanish, own verified domain): verification, recovery, welcome, receipt (USD, Bs, rate, method, Cobrix ref), failed/expired, reminder 3 days before, expires today, access suspended, reactivation at +7 days, admin alerts. Scheduled daily at 8:00 Caracas time; `email_log` prevents duplicates.
- **Admin panel:** Lorenzo runs the business without touching code: KPIs, students (search, CSV, student detail: grant/revoke access, extend N days, every manual action asks for a reason and is logged in `admin_actions`), payments + reported-payments inbox, plans (price, duration, grace, active), **content**, settings (community link, email texts, WhatsApp support).
- **Security:** RLS on every table; service keys only on the server; rate limits; Zod validation in Edge Functions; CSP/HSTS; 2 active sessions per account max. Money in **integer cents**; dates stored UTC, shown in Caracas time.
- **Phases (quote):** Fase 1 = modules 1–6 (auth, Cobrix checkout + webhook, memberships, members area + Bunny + PDFs, admin: students/manual access/content, core emails), due 20–30 Oct 2026. Fase 2 = blocks A–G (reconciliation and reported payments, remaining emails, KPIs/CSV/plans/settings, progress and community, watermark and session limit, one-time products, staging/Sentry/hardening).
- **Spec vs. user decisions:** the spec says the community link can be Telegram or Discord. The user has since dropped Discord from the product (see Routing), so treat the community link as a configurable URL and don't name Discord in the UI.

Designs live in a Claude Design canvas, "Lorenzo Broker — Vistas plataforma" (https://claude.ai/artifact/CZpokBUGWomiVhRv5powms). Views are implemented one at a time, in the user's order — ask for the specific screen rather than guessing, and ask for a screenshot of its artboard: the canvas uses the newer file-based format, which the Artifact tool in some sessions cannot enumerate or read.

## Design system — read it before any UI work

The brand's design system is the artifact **"Lorenzo Broker"**: https://claude.ai/artifact/EY57tXbUVdi5hG2XtkxQLM. It holds the palette with contrast checks, the type scale (Playfair Display + Inter), radii, glows, voice and copy rules, iconography, the logos and photos, and a guideline + preview per shared component (Button, TextField, FormAlert, StatusPill, SectionHeading, Logo, MediaPlaceholder, BenefitCard, EditableText, AdminTopBar, Switch, ConfirmDialog, MenuButton, DragHandle).

**Admin panel patterns, chosen by the user (19 Oct 2026) from the options canvas https://claude.ai/artifact/PxER1YcP8UoHbzHsybK1Yw.** Use them on every admin page:
- `AdminShell` has no sidebar. Its sticky header matches the site's and the student area's (19 Oct 2026): 76 px tall, aligned with the 1400 px content column. It holds a **hamburger button that opens a dropdown menu** (Resumen, Alumnos, Pagos, Cursos, Ver el sitio, Cerrar sesión); from 1500 px the button sits in the header's top-left corner. On the right are a "Vista de alumno" button that opens `/alumno/cursos` and the profile avatar (`AccountMenu`). Content gets the full width (max 1400 px). It closes on navigation, outside click or Escape.
- `AdminTopBar`: back button, breadcrumbs and actions at the top of the page. The code lives in `shared/ui/PageTopBar.tsx`; `widgets/admin-shell` re-exports it as `AdminTopBar`. The student area uses the same `PageTopBar` on Curso and Clase (TUS CURSOS / CURSO / MÓDULO / CLASE), so never go back to the old "← Tus cursos" text link. Changed on the user's request (19 Oct 2026): no box, no background and not sticky, so it doesn't read as a second header under the shell's. The breadcrumb is plain uppercase text (CURSOS / CURSO / MÓDULO / CLASE), and the back button is 48 px and hangs into the left gutter on screens ≥1500 px. It replaces the old "← Cursos" text link.
- Table row actions (Alumnos, Pagos) live in a `MenuButton` "⋯". Its menu is `position: fixed`, so a scrolling table doesn't clip it. "Exportar CSV" is `Button size="sm"` ghost.
- Actions are `Button size="sm"` (40 px, icon + sentence case: Vista previa, Editar, Publicar). Secondary and destructive actions go in the `MenuButton` "⋯".
- Published/draft status is a `Switch` on each row.
- Every delete goes through `ConfirmDialog` (`DeleteButton` wraps it for inline links). Never use `confirm()`.
- Forms (create/edit): the primary action ("Crear curso", "Guardar cambios") stands alone, **centered** at the bottom. There is no "Cancelar" button: cancel is the corner **X** (`CloseButton` in `features/manage-courses`), which opens a `ConfirmDialog` ("Seguir editando" / "Descartar") before leaving. The card is `relative`, and gets `pt-20` when a field would otherwise sit right under the X.
- Reordering is drag and drop: `useDragReorder` (`shared/lib`) + `DragHandle`, with one `scope` per nested list.
- Big uppercase buttons stay on the public site.
- Tokens added for these: `line-strong`, `subtle`, `danger-strong`.

**Before changing UI or adding a view, read its `project/README.md`** (Artifact tool, `read_file`) and the README of every component you touch, and build from those tokens and rules. The canvas above says *what* a screen contains; the design system says *how* it looks and reads.

Keep the two in sync: `src/index.css` `@theme` is the code's copy of the tokens. If you add or change a token, a component's look, or a copy rule in code, update the design system too (read the file, edit, publish only the changed `project/` files, then the index `project/design-system.json` last with a new `lastChange`). Hex literals that exist only in components today (`#c6cedb`, `#6f7a8b`, `#49546a`) are documented there as `ink-soft`, `faint`, `step-idle` — promote them to `@theme` instead of copying them again.

Build status by artboard:

- **Acceso — done.** 01 Registro, 02 Iniciar sesión, 03 Recuperar contraseña, 04 Nueva contraseña.
- **Pago con Cobrix — UI done, no backend.** 05 Elegir plan, 06 Resumen, 07 En verificación, 08 Confirmado. The four screens navigate as a flow but nothing is persisted and Cobrix is never called: "Pagar con Cobrix" just routes to 07. Payments are Venezuelan rails (PagoMóvil, transferencia, Zelle, Binance Pay) with manual verification, so 07 is a real state the user can sit in for hours, not a spinner. The sandbox harness in `scripts/cobrix/` exists but has never been run against the live API.
- **Área del alumno — content wired to Supabase, membership still demo, guarded by session.** 09 Inicio, Cursos (`/alumno/cursos`, replaced 10 Módulos), Curso (`/alumno/cursos/:courseId`: modules, lessons, completion marks, progress %), 11 Clase (`/alumno/clase/:lessonId`: description, PDF downloads via signed URL, "Marcar como completada", previous/next across modules), 12 Mi cuenta, 13 Membresía vencida. Routes nest under `student-nav`. Courses come from `useCourseTree()` and RLS returns only published content of courses the user's live entitlements include, so a visitor or a student without access sees an empty state. The membership card on Inicio and Mi cuenta are still demo (`entities/membership`). **Guard:** every `/alumno` route sits under `RequireAuth` (`entities/session`): without a session it redirects to `/iniciar-sesion` with `state.from`, and `SignInForm` returns there after signing in (internal paths only). It checks the session, not the membership: the "Renovar" / expired state from the spec still needs the real entitlement check. The video player is a placeholder: Bunny playback needs the signed-URL Edge Function.
- **Panel de administración — Cursos wired; the rest UI only.** 14 Resumen, 15 Alumnos, 16 Pagos are demo arrays with inert buttons. **Cursos** (`/admin/cursos` → `/admin/cursos/:courseId` → `/admin/cursos/:courseId/clases/:lessonId`) is the content module from the spec, and it replaced the old 17 Contenido mock. Creating a course is two steps, as the user asked: `/admin/cursos/nuevo` saves title, description and plans first (the course doesn't exist until then); only afterwards does the course page let the admin add modules and lessons. The course page is one column: a summary card ("Editar datos" opens the form in place, plus "Publicar" / "Pasar a borrador"), then modules and lessons full width. The admin creates, renames, reorders (drag and drop), publishes (switch) and deletes (confirm dialog) courses, modules and lessons; picks which plans include each course; sets a lesson's description, Bunny video ID and duration; and uploads, renames and deletes PDFs. It lives in `pages/admin-courses|admin-course|admin-lesson`, with the shared controls in `features/manage-courses` and the data in `entities/course`. Content is edited **only** here, never inside the student views. Everything sits under `admin-shell` + `RequireAdmin`.

The schema for all of this is `supabase/migrations/0003_platform_schema.sql`, written to the spec's data model: profiles, plans (cents, kind, duration, grace), entitlements, courses / plan_courses / modules / lessons / lesson_attachments, lesson_progress, payments, webhook_events, payment_reports, email_log, admin_actions, buckets `lesson-files` and `receipts`, plus RPCs `apply_paid_payment` (service_role), `admin_grant_access`, `admin_revoke_access` and `admin_review_payment_report`. **Until 0003 is applied, every wired screen shows a load error or an empty state.** To let a test student see content before payments exist, an admin calls `admin_grant_access(user_id, 'mensual', days, reason)`.

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
- `isAdmin` — `app_metadata.role === 'admin'`. **Every admin-only surface must gate on `isAdmin`, never on `isAuthenticated`.** The inline content editors (`PricingSection`, `FaqSection`, `IncludesSection`, About, Mentoría), the marketing `Navbar`'s hamburger menu (top-left corner of the header; the section links stay visible in the bar), which for an admin is the **same dropdown as `AdminShell`**: same classes and the same panel sections from `ADMIN_SECTIONS` (`shared/config/routes.ts`), then email and Cerrar sesión; on small screens it also carries the site links, and `RequireAdmin` all do. The student area (`StudentNav`) deliberately shows no Dashboard link, even to admins (user's decision, 19 Oct 2026). Its bar holds Inicio and Cursos, plus a profile avatar at top right: `AccountMenu` (`features/account-menu`), which opens name and email, Mi área, Mi cuenta, Membresía y pagos, Cambiar contraseña and Cerrar sesión. The marketing `Navbar` always shows the same avatar: signed out it is a person icon whose menu offers Iniciar sesión and Registrarte (the user found those as text links in the bar ugly, so keep them out of the bar). Mi cuenta (`/alumno/cuenta`) shows one section at a time, picked with `?seccion=datos|membresia|clave` through `studentAccountPath()`.

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
- `LoginForm` hand-rolls its inputs instead of using `TextField`.

## Supabase project

- Project **LBP**, ref `vwqivhvhlrzjiqvwnhno` (us-east-1), org "PROJECTS ENVIROMENT". `.env.local` and the GitHub Pages secrets point at it.
- Migrations live in `supabase/migrations/`, numbered. 0001 (site_content) and 0002 (admin-only writes) are applied. 0003 (platform schema) and 0004 (strip Discord leftovers from site_content) are written; check with the user whether they ran them. 0005 adds `courses.welcome_video_id` (each course's optional Bunny welcome video, set in the course form and shown above the modules on the student course page).
- Applying SQL: Claude cannot run it from here. The claude.ai Supabase connector only sees another org, and the CLI (`supabase link` done, `supabase/.temp/` gitignored) times out connecting to the pooler. Write the migration file and have the user paste it into LBP's SQL Editor, then paste results back. The fix that would let Claude apply migrations directly is re-authorizing the claude.ai Supabase connector with the "PROJECTS ENVIROMENT" org selected (then `apply_migration` works). Don't pull the CLI's token out of the Windows credential store.

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
