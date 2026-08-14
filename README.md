# VERIDIAN Moto

Production-shaped personal project for a fictional motorcycle manufacturer and dealership. The approved experience includes a public catalogue, inventory, a 2D configurator, accessories, editorial content, enquiries, and a protected administration area.

## Current milestone

**Phase 10 — Release-ready deployment and handoff**

The application, database workflow, administrator bootstrap, CI quality gate,
production-environment validation, liveness endpoint, deployment smoke checks, and
operations runbook are prepared for a Vercel/Supabase release. Provider credentials
are intentionally not part of the repository, so the final public deployment and
authenticated production smoke pass are completed by the project owner. See
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the exact handoff.

The current content refresh adds market-calibrated Romanian launch prices for all
eight models, a 12-product accessory range with dedicated original imagery, and six
expanded long-form articles in a redesigned editorial experience. The pricing
method and dated sources are recorded in
[docs/CONTENT_RESEARCH.md](docs/CONTENT_RESEARCH.md).

## Stack

- Next.js 16 App Router
- React 19 and TypeScript strict mode
- Tailwind CSS 4
- shadcn/ui with Base UI
- Supabase PostgreSQL and Auth
- Drizzle ORM and Drizzle Kit
- Zod
- Vitest and Testing Library
- Playwright
- pnpm
- Resend REST API (optional enquiry notification)

## Included public routes

- `/` — full marketing homepage
- `/modele` and `/modele/[slug]` — catalogue and model details
- `/configurator` and `/configurator/[slug]` — model selection and configuration
- `/configuratie/[reference]` — immutable, shareable configuration summary without PII
- `/api/oferta` and `/api/oferta/[reference]` — branded offer PDF for a live or saved configuration
- `/accesorii` — published accessory catalogue with category, stock, and sorting filters
- `/descopera` and `/descopera/[slug]` — editorial experience
- `/contact` — validated general and configuration-linked enquiry form
- Legal, sitemap, and robots routes
- `/atelier/login` and `/atelier` — unlinked, noindex administration access
- `/atelier/modele`, `/atelier/categorii`, `/atelier/stoc`,
  `/atelier/accesorii`, `/atelier/solicitari`, `/atelier/descopera`, and
  `/atelier/setari` — protected catalogue, enquiry, editorial, and site-management
  workspaces

## Requirements

- Node.js 24 LTS
- pnpm 11

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The public demo intentionally falls back to the checked-in seed catalogue when
Supabase is not configured. Administration always fails closed. To enable the
database and administrator, follow [docs/DATABASE.md](docs/DATABASE.md) and
[docs/AUTHORIZATION.md](docs/AUTHORIZATION.md).

The contact form and configuration persistence require `DATABASE_URL`. Resend is
optional; without its three environment values, successful enquiries still remain
available in `/atelier/solicitari`. A production deployment with a database also
requires `RATE_LIMIT_SECRET`. See [docs/ENQUIRIES.md](docs/ENQUIRIES.md).

Install Chromium with `pnpm exec playwright install chromium` only when end-to-end
tests are needed.

## Commands

| Command                        | Purpose                                               |
| ------------------------------ | ----------------------------------------------------- |
| `pnpm dev`                     | Start the development server                          |
| `pnpm build`                   | Create a production build                             |
| `pnpm lint`                    | Run ESLint with zero warnings allowed                 |
| `pnpm typecheck`               | Run TypeScript without emitting files                 |
| `pnpm test`                    | Run unit/component tests once                         |
| `pnpm test:watch`              | Run tests in watch mode                               |
| `pnpm test:e2e`                | Run Playwright end-to-end/a11y tests                  |
| `pnpm audit:prod`              | Audit production dependencies                         |
| `pnpm env:check:production`    | Validate deployment variables without printing values |
| `pnpm smoke:production -- URL` | Verify a deployed origin and its security policy      |
| `pnpm release:check`           | Run the complete local release gate                   |
| `pnpm db:generate`             | Generate a reviewed schema migration                  |
| `pnpm db:check`                | Check migration history consistency                   |
| `pnpm db:doctor`               | Run a read-only pooler/schema/lock connectivity check |
| `pnpm db:migrate`              | Apply pending migrations                              |
| `pnpm db:seed`                 | Idempotently seed the demo catalogue                  |
| `pnpm db:admin`                | Provision the configured Auth user                    |
| `pnpm format`                  | Format supported files                                |
| `pnpm format:check`            | Verify formatting                                     |
| `pnpm check`                   | Run the standard local quality gate                   |

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for boundaries and implementation conventions.

The configurator engine and its invariants are documented in
[docs/CONFIGURATOR.md](docs/CONFIGURATOR.md).

Database boundaries are documented in [docs/DATABASE.md](docs/DATABASE.md), and
the layered administration checks in [docs/AUTHORIZATION.md](docs/AUTHORIZATION.md).

The Phase 5 editing, publication, and image workflows are documented in
[docs/ADMIN_CATALOGUE.md](docs/ADMIN_CATALOGUE.md).

The Phase 6 public DTOs, caching, inventory privacy, and SEO behavior are documented
in [docs/PUBLIC_CATALOGUE.md](docs/PUBLIC_CATALOGUE.md).

The Phase 7 immutable snapshot, public form, optional email, and Atelier inbox flow
is documented in [docs/ENQUIRIES.md](docs/ENQUIRIES.md).

The Phase 8 article lifecycle, safe body format, cover workflow, cache behavior, and
central site settings are documented in
[docs/EDITORIAL_AND_SETTINGS.md](docs/EDITORIAL_AND_SETTINGS.md).

The Phase 9 security, accessibility, responsive, performance, state, and dependency
review is documented in [docs/HARDENING.md](docs/HARDENING.md).

The Phase 10 environment matrix, Supabase/Vercel sequence, release checks,
monitoring, rollback, and handoff procedure are documented in
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

The downloadable offer document, its two sources, and the embedded font and
artwork pipeline are documented in [docs/OFFER_PDF.md](docs/OFFER_PDF.md).

Generated product imagery is documented in
[docs/IMAGE_ASSETS.md](docs/IMAGE_ASSETS.md).

The full product specification is maintained separately as `VERIDIAN_MOTO_PROJECT_SPEC.md`.
