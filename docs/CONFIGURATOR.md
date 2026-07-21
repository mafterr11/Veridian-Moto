# Configurator architecture

The Phase 7 configurator is active for every initial VERIDIAN motorcycle. The pure
engine in `src/domain/configurator` is shared conceptually by browser interaction,
server verification, seed data, and administration publication checks. It has no
React, Next.js, browser, or database imports.

## Published catalogue

`src/data/queries/public-configurator.ts` constructs a narrow public catalogue from
published models, categories, option groups, choices, rules, features, and media. It
never sends draft choices or administration fields to the browser. The result uses
the same one-hour cache tags as the public model catalogue.

The idempotent seed supplies a complete six-group Terran 900 Rally configuration and
a valid three-group configuration for every other initial model. It creates option
data only when a model has no groups, preserving configurations already edited in
Atelier. Rerun `pnpm db:seed` after applying the migrations to add these fixtures to
an existing project.

When `DATABASE_URL` is absent, all configurators remain explorable with checked-in
demo data. Persistence and enquiry submission deliberately stay disabled because a
local in-memory fallback would misrepresent a saved lead.

## State and selection transaction

Mutable client state contains only the model identifier, selected choice identifiers
grouped by configuration group, and a preview angle. Names, rules, images, and prices
remain catalogue data. The total and feedback are always derived.

Each selection is atomic:

1. Reject unknown or unpublished identifiers.
2. Remove explicitly incompatible selected choices.
3. Replace a single-choice value or enforce a multi-choice limit.
4. Recursively add requirements.
5. Remove dependent choices invalidated by a replacement.
6. Validate the complete draft.
7. Commit only a valid draft; otherwise return the original state.

Publication validation rejects duplicate identifiers, invalid minor-unit prices,
missing defaults, impossible selection limits, missing rule targets, contradictions,
requirements on unpublished choices, and dependency cycles.

## Authoritative save boundary

Browser totals are informational. `saveConfigurationSnapshot` loads the current
published catalogue directly from PostgreSQL without using the public page cache,
validates every posted identifier, executes the engine again, and compares the posted
integer-bani total with its own result. Any stale, altered, unpublished, or invalid
state is rejected before a write.

The accepted transaction copies model identity, group and choice names/codes, base
price, deltas, total, currency, and timestamps into `configuration_snapshots`. Later
catalogue edits therefore cannot rewrite what a visitor submitted.

The saved page separately compares snapshot group keys and choice codes with the
current published catalogue. An archived choice keeps its historical name and price
but receives an “indisponibilă acum” label. This derived flag may change; no stored
snapshot value does.

Public references are 12 characters from a 32-character alphabet: 60 bits of random
space with ambiguous characters removed. They are not database IDs and reveal no
creation order. A configuration URL is intentionally accessible to anyone who has
the link, so it contains no name, email, telephone number, or private notes and is
marked `noindex`.

## Verification

Unit tests cover defaults, pricing, automatic requirements, exclusions, limits,
catalogue validation, client/server total mismatch, historical snapshot stability,
and public-reference formatting. Component tests cover live UI behavior. The
Playwright suite includes all-data-free public behavior plus a complete save/share/
enquiry journey when a migrated and seeded `DATABASE_URL` is provided.
