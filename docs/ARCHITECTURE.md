# Architecture

## Principles

1. Server Components are the default.
2. Client Components are narrow interaction boundaries.
3. Database reads and writes live behind a server-only data-access layer.
4. Public UI receives minimal DTOs, never raw private records.
5. Server Actions authenticate, validate, delegate, and return typed results.
6. Prices and compatibility are recalculated on the server.
7. Public catalogue data uses grouped cache tags; admin/session content is dynamic and uncached.
8. shadcn/ui provides accessible primitives, while high-identity public components remain custom.

## Planned source boundaries

| Directory                     | Responsibility                                          |
| ----------------------------- | ------------------------------------------------------- |
| `src/app`                     | Routes, layouts, metadata, loading/error boundaries     |
| `src/components/ui`           | Owned shadcn/ui primitives                              |
| `src/components/layout`       | Site and admin shells                                   |
| `src/components/marketing`    | Homepage and editorial presentation                     |
| `src/components/catalogue`    | Models, specifications, inventory, accessories          |
| `src/components/configurator` | Configurator interaction UI                             |
| `src/components/admin`        | Administration UI                                       |
| `src/data`                    | Server-only queries, mutations, and DTOs                |
| `src/domain`                  | Pure pricing, rules, compatibility, and inventory logic |
| `src/db`                      | Drizzle schema, connection factory, and seed commands   |
| `drizzle`                     | Generated and custom versioned SQL migrations           |
| `src/lib`                     | Infrastructure adapters and shared utilities            |

Directories are created when their first real module is introduced. Empty architectural theatre is not committed.

## Dependency direction

- Route/components may call domain and data modules.
- Data modules may call database and infrastructure adapters.
- Domain modules stay framework-independent and testable.
- Database and infrastructure modules never import UI.
- Client Components never import server-only data, secrets, or database modules.

## Runtime boundaries

- `src/db/connection.ts` creates a connection only from an explicit URL and is
  shared by server runtime and local database commands.
- `src/db/client.ts` is marked `server-only`, owns runtime access to `DATABASE_URL`,
  and creates the pooled singleton lazily.
- The serverless PostgreSQL pool is deliberately limited to one connection per
  warm function. Related reads run sequentially, so the first failed statement
  stops the workload instead of leaving more statements queued behind it.
- `src/data/queries` filters publication state and projects safe public DTOs. A
  configured database error is surfaced rather than silently replaced by demo data.
- `src/data/auth` verifies signed claims, the email allow-list, and the active
  database profile. Server Actions and server-only mutations both authorize writes.
- `proxy.ts` refreshes the Supabase session and rejects obvious unauthorized
  administration requests, but it is not the final authorization layer.
- `src/domain/admin` owns pure form and publication invariants. Publication is one
  transaction: all issues are collected before the model status changes.
- `src/data/mutations/admin-media.ts` validates and normalizes images before Storage
  upload, records metadata and placement transactionally, and removes an uploaded
  object if database association fails.
- Phase 6 public routes read only from `src/data/queries/public-models.ts` and
  `public-accessories.ts`. These queries enforce publication state, project narrow
  DTOs, cache their data for one hour with `unstable_cache`, and carry grouped tags
  for admin invalidation. The public route group is request-rendered; production
  builds never enumerate dynamic slugs or require a live database.
- `public-configurator.ts` reads the published configuration for page rendering.
  Snapshot writes deliberately reload the same records through an uncached mutation
  query before running the pure engine, so a stale browser cannot preserve an old
  price or unpublished choice.
- Public configuration pages query only immutable snapshot fields. Contact PII is
  stored separately in `inquiries` and is selected only after `assertAdmin()` in the
  protected inbox data layer.
- Public Server Actions validate hostile input before delegating. Admin Server
  Actions and their mutations each authorize independently because a Server Action
  is a direct HTTP endpoint, not an implicit trust boundary.
- The enquiry database insert commits before the optional Resend adapter runs. This
  makes PostgreSQL authoritative and prevents an email outage from losing a lead.
- `public-editorial.ts` exposes only published articles whose publication time has
  arrived. The protected preview uses a separate authenticated query, while the body
  renderer accepts a conservative Markdown-style subset and never emits raw HTML.
- `public-site-settings.ts` owns the cached public contact and SEO projection. A
  singleton settings mutation invalidates the shared tag so the layout, footer,
  contact page, and metadata converge without coupling those components to Drizzle.
- The root layout is infrastructure-free. Database-backed metadata and dealer
  structured data live only in the public layout, so Auth/database failures can
  still reach a finite Atelier error or login page.
- Persisted social URLs are filtered to supported HTTP(S) destinations again at the
  public projection boundary, so legacy or manually altered data cannot create an
  unsafe footer link.
- `public-action-rate-limit.ts` derives HMAC request keys and delegates to an atomic
  PostgreSQL counter. Raw client addresses are not persisted and the rate-limit
  table has no Data API policies.
- `security-headers.ts` centralizes the browser response policy. Proxy responses add
  stricter private/no-store and noindex directives for every Atelier route.
- The checked-in demo catalogue is selected only when `DATABASE_URL` is absent. A
  configured database returning no rows is treated as an intentionally empty public
  catalogue; database failures are surfaced.

## Quality gate

Every meaningful milestone must pass formatting, linting, typechecking, relevant
tests, migration consistency, and a production build. Configurator, authorization,
accessibility, and responsive work also require focused Playwright regression tests.
The production dependency audit remains a separate networked command rather than an
offline `pnpm check` step.
