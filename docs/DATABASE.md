# Database foundation

## Technology and connection mode

VERIDIAN uses Supabase PostgreSQL, Drizzle ORM, and checked-in SQL migrations.
The runtime connection should be the Supabase **transaction pooler** URL. The
Postgres.js driver is configured with `prepare: false`, which is required for that
pooling mode. It also enforces TLS, skips the unnecessary custom-type discovery
round trip, keeps one short-lived connection per warm function, and applies finite
connect, statement, transaction-idle, and lock timeouts.

Migration tooling should use a separate direct PostgreSQL connection through
`MIGRATION_DATABASE_URL`. Drizzle falls back to `DATABASE_URL` for local/test
databases, but production rollouts should keep direct migration credentials out of
the Vercel runtime. Supabase recommends its direct endpoint for migrations and the
transaction pooler for temporary serverless application clients.

The schema lives in `src/db/schema/index.ts`. Generated and custom migrations live
in `drizzle/`; migrations are reviewed and committed before they are applied.
`drizzle-kit push` is intentionally not part of the workflow.

## Initial project setup

1. Create a Supabase project on the free tier.
2. Copy `.env.example` to `.env.local`.
3. Add the project URL, publishable key, transaction-pooler `DATABASE_URL`, direct
   `MIGRATION_DATABASE_URL`, and the intended administrator email.
4. Verify the runtime connection with `pnpm db:doctor`. It performs read-only
   connectivity, schema, and lock-wait checks without printing credentials.
5. Apply the schema with `pnpm db:migrate`.
6. Load the fictional catalogue with `pnpm db:seed`.
7. Create the matching email/password user in Supabase Authentication. Keep public
   sign-up disabled.
8. Add the service-role key locally, run `pnpm db:admin`, then remove that key from
   any environment that does not need administrative provisioning.

The commands are idempotent where practical: catalogue records are upserted by
their stable slugs and the admin profile by the Auth user UUID. The configurator seed
creates options only when a model has none. Editorial posts are inserted only when
their slug is absent, and the singleton site-settings seed never overwrites existing
values. Rerunning the seed therefore preserves administrator-authored content.

Migration `0002_catalogue_storage.sql` creates the public `catalogue` Storage
bucket and its authenticated-admin write policies. Apply all migrations before
using image uploads in Atelier.

Migration `0003_phase_9_hardening.sql` adds the atomic public-action counter. It has
a composite scope/key primary key, positive-count constraint, cleanup index, RLS,
and no Data API policies. Apply it before enabling database-backed public forms in a
Phase 9 deployment.

## Schema workflow

After an intentional schema edit:

```bash
pnpm db:generate
pnpm db:check
```

Review the generated SQL and any security implications before running:

```bash
pnpm db:migrate
```

Never edit an already-applied migration. Add a new migration so every environment
has the same history.

Do not run `pnpm db:migrate` from the Vercel build step. Apply reviewed,
backward-compatible migrations before deploying the matching application and keep
the migration credential in the trusted release environment.

## Public read boundary

Every public-schema table has RLS enabled. The migration deliberately creates no
anonymous table policies. This matters because several rows mix publishable data
with private columns such as VIN, internal quantity, administrative notes, and
enquiry PII; row policies alone do not hide individual columns.

The website reads through the server-only DAL instead. Public queries:

- require published models and categories;
- count only inventory marked public;
- select only fields needed by the UI;
- map database records into explicit DTOs;
- never return VINs, internal quantities, notes, or enquiry data.

The direct PostgreSQL connection can run with an owner-like role that bypasses RLS,
so filtering and projection in the DAL are required security boundaries, not merely
an optimization. Supabase Data API access remains deny-by-default for anonymous and
non-admin users.

## Local fallback

When `DATABASE_URL` is absent, public model-list reads use the checked-in fictional
catalogue so the portfolio remains runnable without a subscription. This fallback
is never used after a configured database throws an error, and it never opens the
administration area.

## Money, history, and deletion

- Money is stored as integer minor units with a three-letter currency.
- Non-negative and selection-limit invariants are database constraints.
- Configuration snapshots copy names and prices so later catalogue edits cannot
  rewrite history.
- Public snapshot references are random and nonsequential; snapshot rows never
  contain enquiry contact fields.
- Enquiries reference snapshots by internal UUID and keep their privacy-policy
  version, acknowledgement time, workflow status, and private administration notes.
- Public rate-limit keys are HMAC digests rather than raw addresses or emails; stale
  counters are removed after 24 hours during normal counter transactions.
- Catalogue records should be archived. Foreign keys are restrictive except where
  a historical snapshot or inquiry intentionally survives with a nullable link.

## Catalogue media

Media metadata is stored in `media_assets`; placement tables associate an asset
with a motorcycle, stock unit, or accessory. Removing a placement does not delete
the shared asset or Storage object, so another placement cannot be broken
accidentally. Uploaded files are limited to 5 MB and accepted only as JPEG, PNG,
WebP, or AVIF. The server verifies the file signature, decodes it with a pixel
limit, strips metadata, constrains dimensions, and writes a normalized WebP.

The bucket is public because these are catalogue images. Public URL access is
therefore intentional; upload, update, and delete operations still require an
authenticated active administrator through Storage RLS.
