# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Lorenzo-Broker is a single-page marketing/landing site (React + TypeScript + Vite) promoting a trading/investing community (pre-market analysis, news, company breakdowns, live calls, education). Content is in Spanish.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then build for production via Vite
- `npm run lint` — run ESLint over the project
- `npm run preview` — serve the production build locally

There is no test runner configured in this repo (no test script, no test files).

## Architecture

The codebase follows **Feature-Sliced Design (FSD)**, layered under `src/`:

- `app/` — app-wide composition: `router.tsx` (react-router-dom `createBrowserRouter`, routes wired to `Layout` + pages) and `Layout.tsx` (persistent Navbar/Footer shell wrapping an `<Outlet />`).
- `pages/` — one folder per route (`home`, `about`, `mentorship`), each composing widgets/features into a page.
- `widgets/` — larger composed UI blocks used by pages (`navbar`, `hero`, `footer`, `benefits-section`).
- `features/` — user-facing interactive behavior (`subscribe-cta`, `video-player`).
- `entities/` — domain data shapes and their presentational units (e.g. `entities/benefit` has `model/types.ts` + `ui/BenefitCard.tsx`).
- `shared/` — reusable, domain-agnostic code: `ui/` (generic components like `Button`, `Container`), `lib/` (e.g. `cn.ts` — `clsx` + `tailwind-merge` helper), `config/` (`routes.ts` defines `ROUTES` path constants and `HOME_SECTIONS` anchor ids; `external-links.ts` holds outbound URLs).

Each slice exposes a public API through an `index.ts` barrel file (re-exporting only what other slices should consume) — import from the slice's barrel (e.g. `from '../../entities/benefit'`), not from its internal `ui/`/`model/` files directly.

Import dependencies flow one direction only: `app` → `pages` → `widgets` → `features` → `entities` → `shared`. A lower layer must never import from a higher one.

There are no path aliases configured — cross-slice imports use relative paths (e.g. `../../shared/ui/Button`).

## Notable conventions/state

- `src/shared/config/external-links.ts` currently holds placeholder URLs (`https://REPLACE_ME`) for checkout, Discord, and Instagram — these need real values before launch.
- Styling is Tailwind CSS v4 via `@tailwindcss/vite` (no separate `tailwind.config` — v4 uses CSS-based config in `index.css`).
- Animations use `framer-motion` (see `BenefitsSection.tsx` for the scroll-in pattern: `initial`/`whileInView`/`viewport`).
