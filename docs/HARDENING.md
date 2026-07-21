# Phase 9 hardening report

This report records the production-shaped review completed on 21 July 2026. It
is an engineering checkpoint for a personal project, not a claim of regulatory
certification or a substitute for testing with the final hosting, database, and
email environments.

## Outcome

No known critical authorization, data-exposure, accessibility, dependency, or
data-integrity issue remains in the reviewed scope. The production build and
local quality gates pass. The Playwright suite exercises public behavior,
security headers, keyboard navigation, responsive overflow, and automated WCAG
rules. The database-backed save-to-enquiry journey remains conditional on a
migrated and seeded test database.

## Verification record

The final local verification completed successfully on 21 July 2026:

- `pnpm check`: formatting, ESLint with zero warnings, generated route types,
  strict TypeScript, 65 Vitest tests across 22 files, Drizzle migration history,
  and a 52-entry production build all passed;
- `pnpm test:e2e`: 14 Playwright tests passed, including the security-header,
  keyboard, LCP-image, accessibility, responsive-overflow, and configurator
  checks;
- one additional end-to-end test was skipped as designed because the disposable
  database credentials were not present;
- `pnpm audit --prod`: no known production dependency vulnerabilities.

## Review matrix

| Area              | Implemented control and verified result                                                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authorization     | Proxy rejection, protected-layout verification, active-profile lookup, email allow-list, and repeated `assertAdmin()` checks at both Server Action and mutation boundaries                                                   |
| Data exposure     | Public queries select published records into narrow DTOs; public inventory excludes VIN and private notes; public configuration snapshots contain no enquiry PII                                                             |
| Browser security  | CSP, HSTS in production, clickjacking protection, MIME sniffing prevention, restrictive referrer and permissions policies, and cross-origin isolation headers                                                                |
| Private caching   | Every `/atelier` response and redirect is private, `no-store`, and `noindex`; public cache tags remain entity-scoped                                                                                                         |
| Public actions    | Bounded Zod schemas, control-character rejection, server-side price verification, honeypot/timing signals, duplicate suppression, and atomic database-backed rate limits                                                     |
| Uploads           | Authentication, 5 MB transport/output limit, allow-listed MIME types, magic-byte verification, 24 MP decode cap, animation rejection, metadata stripping, WebP normalization, and Storage rollback after association failure |
| Data integrity    | Ownership checks prevent cross-model option/rule changes; inventory moves revalidate both models; missing update/archive targets fail explicitly                                                                             |
| Accessibility     | Global visible focus, skip navigation, form error relationships, status announcements, reduced-motion behavior, corrected contrast tokens, and automated WCAG 2 A/AA checks                                                  |
| Responsive layout | Ten public page archetypes checked at 320, 768, and 1440 px with no horizontal overflow; long legal headings can wrap safely                                                                                                 |
| Runtime states    | Public and Atelier loading, error, not-found, and representative empty-data states are explicit; a root error boundary remains available if the app shell fails                                                              |
| Performance       | Above-the-fold images load explicitly, duplicate configurator previews are collapsed, source images total under 1 MB, Next image caching is one day, and sitemap/static-param queries use lightweight index projections      |
| Dependencies      | `pnpm audit --prod` reports no known vulnerabilities; the vulnerable transitive PostCSS range is overridden to 8.5.20                                                                                                        |

## Security boundaries

### Administration

The unlinked `/atelier` location is only a discoverability choice. It grants no
authority. A request must pass signed Supabase claims, the server-only email
allow-list, and an active `admin_profiles` record. Server Actions are direct HTTP
endpoints, so every action validates again, and every server-only administration
mutation independently calls `assertAdmin()`.

The server PostgreSQL connection may use an owner-like role that bypasses RLS.
For that reason, public DAL projection is a required security boundary. The
Supabase Data API remains deny-by-default for anonymous users; the rate-limit
table also has RLS enabled and no Data API policies.

### Response policy

Production responses omit `unsafe-eval`; development retains it for Next.js
tooling. The CSP currently retains `unsafe-inline` for scripts and styles because
the App Router emits inline bootstrapping/structured-data content and several
routes use cached or partially prerendered output. A nonce-based CSP would require
a deliberate rendering/caching redesign and should not be represented as a small
configuration change.

HSTS is emitted only in production. Do not deploy that header on a hostname that
cannot remain HTTPS, especially with `includeSubDomains` and `preload` enabled.

### Rate limiting and spam

With a configured database, production also requires a server-only
`RATE_LIMIT_SECRET` of at least 32 characters. Client addresses and email
discriminators are stored only as HMAC-SHA-256 keys:

- enquiries: 5 per address per 15 minutes;
- enquiries: 3 per normalized email per 15 minutes;
- configuration snapshots: 20 per address per 10 minutes.

Counters update atomically and records inactive for 24 hours are removed. The
address resolver accepts the first valid `x-forwarded-for` value and then
`x-real-ip`; deploy only behind infrastructure that overwrites those headers.
The honeypot and elapsed-time check are low-cost signals, not a CAPTCHA. Add an
edge/provider limiter or privacy-conscious challenge if a public launch attracts
automated abuse.

## Accessibility and responsive verification

Automated axe checks run at 360 and 1440 px for the homepage, model listing and
detail, accessories, configurator listing and experience, editorial listing and
detail, contact, and the legal-page template. Only serious and critical WCAG 2
A/AA findings fail the suite. Overflow checks run for the same page archetypes at
320, 768, and 1440 px.

Automation cannot establish complete accessibility. Before a real launch, perform
a manual keyboard-only pass, zoom/reflow testing, and smoke tests with at least
VoiceOver/Safari and NVDA/Firefox or NVDA/Chrome. Confirm Romanian labels with
native speakers and test real validation failures, not only the happy path.

## Performance observations

- Ten checked-in WebP motorcycle assets total approximately 0.99 MB; the largest
  source asset is approximately 140 KiB.
- The largest emitted static JavaScript chunk in this build is approximately
  227 KiB uncompressed and is shared/runtime output, not necessarily a single
  route's transferred payload.
- Public routes use Server Components by default. The configurator, forms, and
  small interactive controls are the principal client boundaries.
- Manrope and Barlow Condensed are self-hosted from pinned Fontsource packages, so
  a clean build does not depend on Google Fonts being reachable.
- LCP candidates use explicit eager loading; other catalogue images remain lazy.
- Database-free builds pre-render 52 route entries successfully.

These measurements are build-artifact observations, not field Core Web Vitals.
Run Lighthouse/WebPageTest and collect real-user telemetry on the final deployment,
where network latency, Supabase Storage, fonts, and the configured database can be
measured honestly.

## Dependency decision

React and React DOM were updated within the supported 19.2 line. The Phase 10
release toolchain moved the runtime and `@types/node` to Node.js 24 LTS because
Node.js 20 is end-of-life. ESLint and TypeScript remain on the project's verified
Next-compatible major lines rather than being changed during the security review.
The PostCSS override is intentional and should be removed once the dependency tree
resolves only a patched version without it.

## Known non-critical limitations

- CSP still permits inline scripts/styles as described above.
- No managed WAF, CAPTCHA, distributed edge limiter, error tracker, or uptime
  monitor is included.
- Privacy retention, export, erasure, and anonymization are not automated.
- A Storage rollback failure reports manual cleanup but cannot guarantee the orphan
  was removed.
- Automated accessibility checks do not replace assistive-technology testing.
- The complete authenticated/database Playwright journey needs a dedicated test
  project and is skipped when `DATABASE_URL` is absent.
- Backup/restore drills and email deliverability are properties of the eventual
  hosted services and were not simulated locally.

## Deployment checklist

1. Apply migration `0003_phase_9_hardening.sql` before accepting public writes.
2. Set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS origin and configure Supabase,
   `ADMIN_EMAIL`, `DATABASE_URL`, and a unique `RATE_LIMIT_SECRET`.
3. Keep `SUPABASE_SERVICE_ROLE_KEY` out of browser and routine runtime environments.
4. Run `pnpm check`, `pnpm audit:prod`, and `pnpm test:e2e` against the release.
5. Run the conditional save/share/enquiry journey against a disposable migrated,
   seeded database.
6. Verify headers, login denial, Storage policies, email delivery, and cache
   invalidation on the deployed origin.
7. Add monitoring, backups, a retention policy, and manual accessibility testing
   before collecting real visitor data.
