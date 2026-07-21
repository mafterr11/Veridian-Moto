# Deployment and operations

VERIDIAN Moto targets Vercel for the Next.js application and Supabase for
PostgreSQL, Auth, and Storage. The repository requires no `vercel.json`: Vercel
detects Next.js and provides framework-aware builds, Functions, image optimization,
and cache behavior without custom platform configuration.

This is a production-shaped personal project. It can begin on the providers'
free/hobby offerings, but quotas and acceptable-use terms can change. Check the
current provider limits before collecting real traffic or personal data.

## Supported release toolchain

- Node.js 24 LTS, selected by `.nvmrc` and `package.json`;
- pnpm 11.7.0 through the `packageManager` field;
- Next.js 16 App Router;
- a Supabase project;
- a Vercel project connected to the source repository.

Run this before preparing a release:

```bash
pnpm install --frozen-lockfile
pnpm release:check
```

The GitHub Actions quality workflow runs the same static/unit/build gate, the
production dependency audit, and the database-free Playwright suite on `main` and
pull requests.

The repository-side Phase 10 verification completed on 21 July 2026 with 70 Vitest
tests across 24 files, a successful 53-route production build, 14 passing public
Playwright checks, one intentionally skipped database-dependent journey, a passing
local deployment smoke test, and no known production dependency vulnerabilities.

## Environment ownership

| Variable                               | Vercel production | Trusted setup machine | Notes                                                             |
| -------------------------------------- | ----------------- | --------------------- | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                  | Required          | Required              | Canonical HTTPS origin, with no trailing path                     |
| `NEXT_PUBLIC_SUPABASE_URL`             | Required          | Required              | Supabase project HTTPS URL                                        |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Required          | Required              | Browser-safe publishable key                                      |
| `DATABASE_URL`                         | Required          | Required              | Supabase transaction-pooler URL, normally port 6543               |
| `ADMIN_EMAIL`                          | Required          | Required              | Exact normalized email allowed into Atelier                       |
| `RATE_LIMIT_SECRET`                    | Required          | Required              | Unique random value of at least 32 characters                     |
| `RESEND_API_KEY`                       | Optional          | Optional              | Configure all three Resend values or none                         |
| `RESEND_FROM_EMAIL`                    | Optional          | Optional              | Sender on a verified domain                                       |
| `ENQUIRY_NOTIFICATION_EMAIL`           | Optional          | Optional              | Private notification destination                                  |
| `MIGRATION_DATABASE_URL`               | No                | Required for rollout  | Direct/session connection used by Drizzle migrations              |
| `SUPABASE_SERVICE_ROLE_KEY`            | No                | Admin bootstrap only  | Remove locally after `pnpm db:admin`; never expose to the browser |

Generate the rate-limit key with a password manager or a cryptographically secure
tool, for example `openssl rand -base64 32`. Do not reuse a key from another
application.

`pnpm env:check:production` validates the current `.env.local` without printing
secret values. It also warns when provisioning-only credentials are present so they
are not copied into Vercel.

## One-time Supabase setup

1. Create the project and record its project URL and publishable key.
2. In **Connect**, copy two PostgreSQL URLs:
   - transaction pooler for `DATABASE_URL`, used by the serverless runtime;
   - direct connection for `MIGRATION_DATABASE_URL`, used from the trusted setup
     machine. If that machine cannot reach the IPv6 direct endpoint, use the
     supported session-pooler alternative for migration tooling.
3. Copy `.env.example` to `.env.local` and add the setup values.
4. Apply all checked-in migrations, including Storage/RLS policy migrations:

   ```bash
   pnpm db:migrate
   ```

5. Seed the fictional catalogue and editorial content:

   ```bash
   pnpm db:seed
   ```

6. Disable public Auth sign-up and create one email/password user in the Supabase
   Authentication dashboard. Use the exact `ADMIN_EMAIL` value.
7. Add `SUPABASE_SERVICE_ROLE_KEY` only to `.env.local`, run:

   ```bash
   pnpm db:admin
   ```

8. Remove the service-role value when provisioning has succeeded.
9. Set the Supabase Auth site URL to the canonical production origin. Keep any
   redirect allow-list limited to origins actually used by the project.

The seed and admin commands are idempotent where practical. They can be rerun after
a migration without overwriting administrator-authored site settings.

## Vercel setup and first release

1. Import the source repository into Vercel and keep the detected Next.js defaults.
2. Add only the values marked **Vercel production** in the table above. Secret
   variables belong in project settings, never in source or a committed `.env`.
3. Keep preview deployments database-free unless a separate preview Supabase project
   exists. Without `DATABASE_URL`, the public site deliberately uses its checked-in
   demo catalogue and Atelier remains closed. This prevents a preview branch from
   changing production data at no extra cost.
4. Deploy once. If the final `*.vercel.app` origin was not known in advance, set
   `NEXT_PUBLIC_APP_URL` to that canonical HTTPS origin and redeploy. Environment
   changes apply only to new deployments.
5. If a custom domain is added later, update `NEXT_PUBLIC_APP_URL`, the Supabase Auth
   site URL/redirect allow-list, and any verified Resend sender configuration, then
   create a new production deployment.

Do not run database migrations from the Vercel build command. A failed application
deployment must not leave schema changes half-coordinated with an old release.

## Release order

For each schema-changing release:

1. Review the generated migration and create a database backup/export appropriate
   to the Supabase plan.
2. Run `pnpm release:check` against the exact source to be released.
3. Apply backward-compatible migrations from the trusted setup environment with
   `pnpm db:migrate`.
4. Run `pnpm db:seed` only when the release intentionally adds seed content.
5. Deploy the application.
6. Run the automated smoke checks:

   ```bash
   pnpm smoke:production -- https://your-production-origin.example
   ```

7. Complete the authenticated manual checks below.

Schema changes should use expand/migrate/contract sequencing when an old and new
deployment may overlap. Never edit or delete an already-applied migration.

## Post-deployment verification

Automated smoke checks verify:

- homepage and model-catalogue availability;
- CSP, clickjacking, MIME-sniffing, and referrer headers;
- the non-cacheable `/api/health` liveness endpoint;
- unauthenticated Atelier redirection plus its private/noindex policy.

Manual checks still required:

1. Open `/atelier/login`, sign in as the configured administrator, and confirm a
   different account is rejected.
2. Create a harmless draft record, upload a small WebP/JPEG image, then archive the
   draft.
3. Save and reopen one configuration reference.
4. Submit one contact enquiry and confirm it appears in `/atelier/solicitari`.
5. If Resend is configured, confirm delivery and reply-to behavior.
6. Inspect the sitemap, robots response, legal pages, social links, and canonical
   production URLs.
7. Test the mobile menu, configurator, and contact validation from a real phone.

## Monitoring and incident response

- Monitor `GET /api/health` for liveness. It intentionally does not query the
  database or reveal configuration details.
- Use Vercel runtime logs and Supabase logs/connection metrics when public routes
  fail. Do not log form payloads, tokens, connection strings, or enquiry PII.
- A database outage should surface as an error when a database is configured; it
  must not silently switch production to demo data.
- If a deployment is faulty but the schema remains compatible, promote/redeploy the
  previous Vercel release and investigate offline.
- Database migrations are forward-only. Restore from a verified backup only for a
  genuine data-loss event; otherwise add a corrective migration.
- Rotate a leaked secret in the provider first, update the affected Vercel variable,
  and redeploy. Environment changes do not modify already-created deployments.

## Handoff acceptance

A fresh maintainer should be able to complete the project handoff by following this
order:

1. README local setup;
2. `docs/DATABASE.md` and `docs/AUTHORIZATION.md` for the data/auth model;
3. this deployment guide for environment ownership and release order;
4. `docs/HARDENING.md` for residual risks and pre-public-launch work.

The codebase is release-ready without provider credentials. A public deployment is
not considered verified until the production smoke and authenticated manual checks
have been performed against the actual origin.

## Primary references

- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Supabase PostgreSQL connection modes](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Node.js release schedule](https://nodejs.org/en/about/previous-releases)
