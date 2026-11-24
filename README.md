# AEGC Student Mobility (Nigeria → UK)

Next.js + TypeScript build of the AEGC Nigeria → UK Student Mobility platform.
Increment 1: foundations plus applicant entry screens A01–A05 and a first-pass results page.

## Run it

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run typecheck` | Full TypeScript check |
| `npm test` | Matching-engine unit tests (Vitest) |
| `npm run lint` | ESLint (Next.js rules) |
| `npm run build && npm start` | Production build and server |

## What's in this increment

| Area | Location |
| --- | --- |
| AEGC brand theme (Figtree; Blue #2861EB, Purple #8F37E9, black, white, gradient) | `src/app/globals.css`, `src/app/layout.tsx` |
| Domain types (framework-free) | `src/domain/types.ts` |
| Deterministic matching engine + tests | `src/domain/matching/` |
| Shared wire contracts (Zod), used by browser and server | `src/contracts/` |
| Catalogue repository + synthetic fixtures | `src/server/catalogue/` |
| API: `GET /api/v1/catalogue/coverage`, `POST /api/v1/diagnostics/match` | `src/app/api/v1/` |
| Typed API client | `src/lib/api-client.ts` |
| Layout components: `Container`, `Section`, `SiteHeader` (sticky, mobile menu), `SiteFooter`, `AppShell` | `src/components/layout/` |
| UI components: `Button`/`ButtonLink`, `Heading`/`Lead`, `Card`, `Icon`, form fields, `StatusBadge`, `Notice` | `src/components/ui/` |
| Landing sections: `Hero`, `EvidencePreview`, `RouteSteps`, `InfoColumns`, `CtaBand` | `src/components/marketing/` |
| Page frames: `StepPage` (stepped journey), `SimplePage` | `src/features/diagnostic/Stepper.tsx` |
| A01 Landing | `src/app/page.tsx` |
| A02 Adult gate (+ under-18 exit) | `src/app/start/`, `src/app/under-18/` |
| A03 Qualifications | `src/app/profile/qualifications/` |
| A04 Study and funding | `src/app/profile/preferences/` |
| A05 Review answers | `src/app/profile/review/` |
| Results (first pass; full A06–A08 next) | `src/app/results/` |

## Design system

- **Brand tokens** (colours, Figtree, type scale `text-display` / `text-title` / `text-lead`, radius, shadow, motion) all live in `src/app/globals.css` under `@theme`. Change a token once and it updates everywhere.
- **Motion:** the landing page has one load sequence: the photo settles, the copy rises, and the example result's checks pop in one by one. Elsewhere, motion only responds to actions (menu, choices, buttons, progress bar). Everything switches off when the visitor has reduced motion turned on.
- **Responsive:** layouts are mobile-first. The hero stacks on phones, with the example card overlapping the photo, and splits from `lg` up. The how-it-works route runs vertically on phones and horizontally from `md` up.
- **Hero image:** `public/images/hero-student-london.jpg`, resized to 2000px and compressed; `next/image` serves sized versions per screen.

## Rules the code enforces (from Documents 06 and 07)

- **Three-valued outcomes.** MET / NOT_MET / UNKNOWN. Unknown, conflicting or expired facts are UNKNOWN, never a pass.
- **No grade conversion.** A programme must publish a reviewed threshold on the applicant's own scale (CGPA /5, CGPA /4, percentage, degree class). Otherwise the outcome is UNKNOWN.
- **Freshness.** At or after `reviewDueAt`, a programme's facts are treated as expired.
- **Closed intakes and other study levels are filtered out**, not shown as academic failures.
- **Affordability is separate from academic outcome.** No currency conversion, and no annual ↔ whole-course arithmetic.
- **Preference weights are 40/30/20/10** (subject/budget/intake/location). They are never rescaled, and missing inputs are recorded as unassessed.
- **No commercial inputs** reach the engine.
- **Anonymous diagnosis is transient.** It is held in React memory only, and the API route does not persist or log it.
- **API hygiene.** Closed request objects (unknown keys rejected), a 64 KiB body limit, `Cache-Control: no-store`, and a consistent error body.

## Decision to confirm with Product

When the budget is **not** strict and an academically eligible course is over budget, the engine puts it in **Needs review**, not **Potential matches**. The spec only says "MET plus assessed tuition fit" counts as potential, so this is the conservative reading. Change it in `groupFor()` in `src/domain/matching/engine.ts` if Product decides otherwise.

## Synthetic data

Every institution, programme, criterion and fee in `src/server/catalogue/fixtures.ts` is fictional.
Real catalogue data comes from the reviewed pipeline (plan steps 12–13) once sources and usage rights are approved.

## Brand assets still needed

The header uses `public/aegc-logo.png` (214×42). An SVG or 2× PNG version would look sharper on high-resolution screens.

## Next increment

A06 Results (full design), A07 Programme evidence, A08 Compare, A10 Saved shortlist.
