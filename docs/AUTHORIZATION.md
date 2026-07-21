# Administration authorization

`/atelier` is intentionally absent from public navigation and excluded from search
indexing. That reduces accidental discovery; it is not considered a security
control.

Every Atelier response and redirect also receives private `no-store` caching and an
`X-Robots-Tag` noindex policy. These prevent shared-cache or search leakage but do
not replace authorization.

## Required identity

An administrator must satisfy all of the following:

1. Supabase has verified a current email/password session.
2. The signed access-token claims contain a subject and email.
3. The normalized email exactly matches server-only `ADMIN_EMAIL`.
4. `admin_profiles` contains the same Auth UUID with role `admin` and `is_active`.

There is no public sign-up flow and no customer-account system.

## Enforcement layers

### 1. Next.js Proxy

`src/proxy.ts` runs on `/atelier/:path*`. It refreshes Supabase SSR cookies with
`getClaims()`, rejects missing or non-allow-listed sessions, and fails closed when
infrastructure is incomplete. This is an optimistic early check only.

### 2. Protected server layout

The protected route group calls `getAdminAuthState()`. It validates claims again and
requires the active database profile before rendering the administration shell.

### 3. Mutation boundary

Every administration Server Action validates its Zod input and calls `assertAdmin()`
before delegating. The server-only mutation checks `assertAdmin()` again at the data
boundary. This includes enquiry status and private-note updates. A hidden route,
client state, Proxy check, or rendered admin shell never authorizes a mutation.

### 4. Database RLS

The `public.is_admin()` database predicate checks `auth.uid()` against the active
profile. Authenticated administrators receive RLS policies across managed tables;
everyone else receives no Data API access. The catalogue Storage bucket likewise
permits writes only when `public.is_admin()` succeeds. Service-role credentials
bypass RLS and therefore belong only in controlled server or provisioning contexts.

## Failure behavior

- Missing Supabase, database, or allow-list configuration: login explains setup and
  protected routes redirect there.
- Missing/expired claims: redirect to login.
- Wrong email or inactive/missing profile: deny access on a finite status page,
  with an explicit sign-out action and no redirect loop.
- Database outage: redirect the already authenticated administrator to
  `/atelier/indisponibil`; Auth outages fail closed at login. Neither condition
  renders an open admin experience or an indefinitely streamed loader.

Authentication errors shown before successful sign-in are generic to avoid exposing
which addresses exist. An authenticated allow-listed user may receive the actionable
message that their profile still needs provisioning.

The public contact and configuration-save actions are intentionally unauthenticated,
but they receive no administration capability. They validate bounded input and can
only insert a new immutable snapshot or enquiry through narrowly scoped server-only
functions; they cannot read PII, update catalogue records, or choose stored prices.

The public DTO regression tests explicitly reject VIN and private-note properties.
Public database queries select only published fields instead of selecting whole rows
and deleting private keys afterward.
