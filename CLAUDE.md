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

The brand's design system is the artifact **"Lorenzo Broker"**: https://claude.ai/artifact/EY57tXbUVdi5hG2XtkxQLM. It holds the palette with contrast checks, the type scale (Domine + Inter), radii, glows, voice and copy rules, iconography, the logos and photos, and a guideline + preview per shared component (Button, TextField, FormAlert, StatusPill, SectionHeading, Logo, MediaPlaceholder, BenefitCard, EditableText, AdminTopBar, Switch, ConfirmDialog, MenuButton, DragHandle).

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

Keep the two in sync: `src/index.css` `@theme` is the code's copy of the tokens. If you add or change a token, a component's look, or a copy rule in code, update the design system too (read the file, edit, publish only the changed `project/` files, then the index `project/design-system.json` last with a new `lastChange`).

**Brand palette — the current design (21 Oct 2026).** Lorenzo applied his *Manual de Marca* (his patch `0001-Aplicar-el-manual-de-marca…`, reproduced in the code). It replaced the old near-black + neon green (`#25e98a`) + gold look on every screen, and **every view, new or old, uses it from now on**:
- Pantone colors as tokens: `brand-gray` #4b4f54 (7540 C), `brand-black` #262729 (426 C), `brand-navy` #283380 (072 C; the manual writes #060e9f but its swatches and logo use #283380), `brand-petrol` #006e96 (7705 C), `brand-teal` #00b09a (3275 C).
- Surfaces are brand grays: `bg` #1c1d1f → `bg-2` #222326 → `panel` #262729 → `panel-2` #2c2e31, `line` #373a3e, `line-strong` #4b4f54. Text: `ink` #f4f5f6, `ink-soft` #d0d3d7, `muted` #a7acb3, `faint` #868b93, `ink-inverse` #0f1415 on the accent.
- `accent` is teal 3275 C (#00b09a): buttons, links, the highlighted word, focus. Glows use `rgba(0,176,154,…)`. Navy and petrol go **only** in gradients and fills (hero and closing-CTA halos, the Bonus badge), never as text on dark: they fail contrast.
- **Bonus** items (BenefitCard, pricing checks) are petrol: `brand-petrol` border/badge and `highlight` (#4cb3dc) for their text. **`gold` is no longer a brand color**: it stays only for waiting/warning states (En verificación, Por vencer, Vencida, borrador).
- Fonts: **Domine** (display, replaces Playfair Display; max weight 700, so never `font-extrabold`/`font-black` on display text) and **Inter** (body). Clarendon and Theinhardt, the manual's paid fonts, are listed as fallbacks in `--font-display` / `--font-body`.
- **Logo:** the official full lockup, negative (white) version, `shared/assets/images/logo-lorenzo-broker-negativo.png`, via `Logo` (`size="md"` 48 → 62 px in headers, `size="lg"` 84 px in the footer). The manual forbids the color versions on dark backgrounds and separating or rearranging the mark and the wordmark.
- Never hardcode a hex or an rgba of the old palette; use the tokens. The old hex literals (`#c6cedb`, `#6f7a8b`, `#49546a`) are now `ink-soft`, `faint`, `step-idle` in `@theme`.
- On phones the navbar hides "Suscríbete ahora" below `sm` (it overlapped the logo; the hero shows the big button).

Build status by artboard:

- **Acceso — done.** 01 Registro, 02 Iniciar sesión, 03 Recuperar contraseña, 04 Nueva contraseña.
- **Pago — UI done, no backend; Cobrix set aside for now (user's decision, 22 Oct 2026).** 05 Elegir plan → 06 Resumen (one big card: datos + plan, método de pago, total and the pay button always at the bottom) → **Pagar** (`/suscripcion/pagar?plan=&metodo=`, `pages/checkout-pay`: amount in Bs at `DEMO_EXCHANGE_RATE` or in USD, the method's `payTo` details with Copiar, required payment reference) → 07 En verificación (shows the method) → 08 Confirmado. Every checkout screen except 07/08 carries the standard `PageTopBar` through `CheckoutShell`'s `topBar` prop. `payTo` and the rate in `shared/config/payment-methods.ts` are demo data. Nothing is persisted and no gateway is called. Payments are Venezuelan rails (PagoMóvil, transferencia, Zelle, Binance Pay) with manual verification, so 07 is a real state the user can sit in for hours, not a spinner. The sandbox harness in `scripts/cobrix/` exists but has never been run against the live API.
- **Área del alumno — content wired to Supabase, membership still demo, guarded by session.** 09 Inicio, Cursos (`/alumno/cursos`, replaced 10 Módulos), Curso (`/alumno/cursos/:courseId`: modules, lessons, completion marks, progress %), 11 Clase (`/alumno/clase/:lessonId`: description, PDF downloads via signed URL, "Marcar como completada", previous/next across modules), 12 Mi cuenta, 13 Membresía vencida. Routes nest under `student-nav`. Courses come from `useCourseTree()` and RLS returns only published content of courses the user's live entitlements include, so a visitor or a student without access sees an empty state. The membership card on Inicio and Mi cuenta are still demo (`entities/membership`). **Guard:** every `/alumno` route sits under `RequireAuth` (`entities/session`): without a session it redirects to `/iniciar-sesion` with `state.from`, and `SignInForm` returns there after signing in (internal paths only). It checks the session, not the membership: the "Renovar" / expired state from the spec still needs the real entitlement check. The video player is a placeholder: Bunny playback needs the signed-URL Edge Function.
- **Panel de administración — Cursos wired; the rest UI only.** 14 Resumen, 15 Alumnos, 16 Pagos are demo arrays with inert buttons. Pagos has a detail page (`/admin/pagos/:paymentId`, `pages/admin-payment`, 22 Oct 2026) built from `findDemoPaymentDetail()` in `entities/payment`: USD and Bs (integer cents), rate, method, source (Cobrix or reported), reference, receipt, student, and an event timeline in Caracas time. Confirm/reject there open a `Modal` that requires a reason (spec: every manual action is logged with a reason); today they only change local state. **Cursos** (`/admin/cursos` → `/admin/cursos/:courseId` → `/admin/cursos/:courseId/clases/:lessonId`) is the content module from the spec, and it replaced the old 17 Contenido mock. Creating a course is two steps, as the user asked: `/admin/cursos/nuevo` saves title, description and plans first (the course doesn't exist until then); only afterwards does the course page let the admin add modules and lessons. The course page is one column: a summary card ("Editar datos" opens the form in place, plus "Publicar" / "Pasar a borrador"), then modules and lessons full width. The admin creates, renames, reorders (drag and drop), publishes (switch) and deletes (confirm dialog) courses, modules and lessons; picks which plans include each course; sets a lesson's description, Bunny video ID and duration; and uploads, renames and deletes PDFs. It lives in `pages/admin-courses|admin-course|admin-lesson`, with the shared controls in `features/manage-courses` and the data in `entities/course`. Content is edited **only** here, never inside the student views. Everything sits under `admin-shell` + `RequireAdmin`.

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
- `features/` — user-facing interactive behavior (`register`, `sign-in`, `password-reset`, `subscribe-cta`, `video-player`).
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
- `isAdmin` — `app_metadata.role === 'admin'`. **Every admin-only surface must gate on `isAdmin`, never on `isAuthenticated`.** The inline content editors (`PricingSection`, `FaqSection`, `IncludesSection`, About, Mentoría), the marketing `Navbar`'s hamburger menu (top-left corner of the header; the section links stay visible in the bar), which for an admin is the **same dropdown as `AdminShell`**: same classes and the same panel sections from `ADMIN_SECTIONS` (`shared/config/routes.ts`), then email and Cerrar sesión; on small screens it also carries the site links, and `RequireAdmin` all do (without a session it sends to `/iniciar-sesion` with `state.from`; a signed-in student goes to `/alumno`). The student area (`StudentNav`) deliberately shows no Dashboard link, even to admins (user's decision, 19 Oct 2026). Its bar holds Inicio and Cursos, plus a profile avatar at top right: `AccountMenu` (`features/account-menu`), which opens name and email, then — for admins only (`isAdmin`) — "Panel de administrador" (`/admin/resumen`), Mi área, Mi cuenta and Cerrar sesión (user's decision, 22 Oct 2026: Membresía y pagos and Seguridad led to the same page as Mi cuenta, so they were taken out of the menu and are reached through the Mi cuenta tabs). The marketing `Navbar` always shows the same avatar: signed out it is a person icon whose menu offers Iniciar sesión and Registrarte (the user found those as text links in the bar ugly, so keep them out of the bar). Mi cuenta (`/alumno/cuenta`) shows one section at a time, picked with `?seccion=datos|membresia|seguridad`; Datos personales is read-only until "Editar" (name, cédula/RIF, phone/WhatsApp from `user_metadata.phone`; never the email); the Seguridad tab (formerly Configuración; old `?seccion=configuracion|clave` still open it) holds Cambiar correo first, then Cambiar contraseña; each opens its form in a `Modal` (`shared/ui/Modal.tsx`: X in the corner, Escape or backdrop click closes it, no Cancelar button, primary action alone at the right) (user's decisions, 22 Oct 2026). In Mi cuenta forms the primary button always sits at the bottom-right corner, with Cancelar to its left (user's decision, 22 Oct 2026; admin forms keep their centered button). These forms don't persist yet through `studentAccountPath()`.

**Vista de alumno (22 Oct 2026).** An admin can flip a "Vista de alumno" `Switch` in `AccountMenu` (shown only when `isAdminAccount`); the `AdminShell` "Vista de alumno" button turns it on too. While on, `useAuth().isAdmin` is **false** everywhere, so every admin surface (editors, hamburger, panel link, `RequireAdmin` → `/alumno`) disappears; `isAdminAccount` keeps the real role and `viewAsStudent` / `setViewAsStudent` drive it (persisted in localStorage `lb:view-as-student`, cleared on logout). Keep gating admin UI on `isAdmin`, never on `isAdminAccount`. Student views call `useCourseTree({ publishedOnly: true })` so drafts stay hidden in that mode; RLS still returns every course to an admin, so the preview is not filtered by plan. It is cosmetic: permissions don't change.

The role is read from `app_metadata` because only the server can write it. Never move it to `user_metadata` — users can edit their own `user_metadata`, which would let any student grant themselves admin.

Granting admin is a server-side action, done once per admin account:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
where email = 'admin@example.com';
```

**Client-side gating is cosmetic.** It hides UI; it does not protect data. The real boundary is Row Level Security on the Supabase tables (`site_content` above all) — a write policy that requires the admin role. Treat any change that widens who can write as needing an RLS review.

Access lives at `/registro`, `/iniciar-sesion`, `/recuperar-contrasena` and `/nueva-contrasena`. **There is one login for everyone** (user's decision, 22 Oct 2026): the old admin login at `/admin` (`pages/login` + `features/admin-login`) was removed, and `/admin` now just redirects to `/admin/resumen`. `SignInForm` returns to `state.from` when present; otherwise an admin lands on `/admin/resumen` and a student on `/alumno`. `login()` returns the account's `role` for that. The only error it shows verbatim is `NOT_CONFIGURED` (missing `.env.local`), which says nothing about the account.

Current admin accounts (role set 2026-10-18): `menteclon500@gmail.com` and `lorenzoperezus@gmail.com` (Lorenzo, the client). A role change only reaches the browser after signing out and back in, because the role travels inside the JWT.

## Editing site content (the client's workflow)

The client edits the marketing copy himself; this is a core feature, not an admin nicety.

1. He signs in at **`/iniciar-sesion`** like everyone else and lands on the panel (`/admin/resumen`); "Ver el sitio" in the hamburger menu takes him to the public pages.
2. On the public pages, editable parts show inline editors when `isAdmin`: **PricingSection** (`pricing.plan`), **IncludesSection** (`includes.items`, drag to reorder, Bonus toggle), **FaqSection** (`faq.items`; full editing on `/faq`, choosing which questions appear on the home from the home itself), **AboutPage** (`about.page`) and **MentorshipPage** (`mentorship.page`). Fields save on blur.

   The two pages use the reusable path, which new editable content should follow too: `useSiteContentDraft(key, defaults)` from `entities/site-content` (draft + `update` / `commit` on blur / `replace` for add-remove), `shared/ui/EditableText` (the in-place input/textarea), `shared/ui/EditableParagraphs` (paragraph list with add/remove) and `shared/ui/RichText` (renders `**palabra**` as emphasis — the only formatting stored copy supports). Keep defaults equal to the current copy so a fresh environment looks the same.
3. Everything lands in one JSON row: `site_content` where `id = 'site'`, one key per section. The stored value overrides the widget's default array.

Known gaps — ask before assuming they are wanted, but keep them in mind:
- Still hardcoded: the Hero, the closing CTA, the footer, "Así funciona cada parte" (`widgets/includes-detail`, below `PricingSection` on the home, added 22 Oct 2026: one row per "¿Qué incluye?" card with intro, points and a screenshot frame; placeholder copy and no images yet, Lorenzo will send both), the About photos, and the mentorship application URL (`EXTERNAL_LINKS.mentorshipApplication`, still `REPLACE_ME`).
- **Contacto** (`/contacto`, `pages/contact` + `features/contact-form`, added 22 Oct 2026): the form inserts into `contact_messages` without reading back. The phone shown there is `CONTACT_PHONE` in `shared/config/contact.ts`, `null` until Lorenzo confirms the number (the row is hidden while null). There is no admin inbox for these messages yet.

## Supabase project

- Project **LBP**, ref `vwqivhvhlrzjiqvwnhno` (us-east-1), org "PROJECTS ENVIROMENT". `.env.local` and the GitHub Pages secrets point at it.
- Migrations live in `supabase/migrations/`, numbered. 0001 (site_content) and 0002 (admin-only writes) are applied. 0003 (platform schema) and 0004 (strip Discord leftovers from site_content) are written; check with the user whether they ran them. 0005 adds `courses.welcome_video_id` (each course's optional Bunny welcome video, set in the course form and shown above the modules on the student course page). 0006 adds `contact_messages` (the /contacto form: anon and authenticated may insert only the message columns, only admins read/update status/delete; depends on `is_admin()` from 0003); check with the user whether it ran.
- Applying SQL: Claude cannot run it from here. The claude.ai Supabase connector only sees another org, and the CLI (`supabase link` done, `supabase/.temp/` gitignored) times out connecting to the pooler. Write the migration file and have the user paste it into LBP's SQL Editor, then paste results back. The fix that would let Claude apply migrations directly is re-authorizing the claude.ai Supabase connector with the "PROJECTS ENVIROMENT" org selected (then `apply_migration` works). Don't pull the CLI's token out of the Windows credential store.

When another screen links to `/recuperar-contrasena` (Mi cuenta › Seguridad), it passes `BackLinkState` (`{ from, fromTitle }`, `shared/config/routes.ts`) so the page shows the standard `PageTopBar` (back arrow + `{fromTitle} / RECUPERAR CONTRASEÑA`) above the card, through `AuthShell`'s `topBar` prop, instead of "Volver a iniciar sesión". Back navigation is always `PageTopBar`, never a "← text" link; `from` goes through `safeInternalPath`.

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
