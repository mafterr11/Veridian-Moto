# Offer PDF

A visitor can download their configuration as a branded commercial offer. The
document is rendered server-side and is never assembled in the browser, so the
prices it states always come from the authoritative catalogue.

## Two sources, one document

| Route                         | Source of truth                | Needs the database |
| ----------------------------- | ------------------------------ | ------------------ |
| `POST /api/oferta`            | The visitor's live selections  | No                 |
| `GET /api/oferta/[reference]` | A saved configuration snapshot | Yes                |

Both routes end in the same renderer, so identical selections produce identical
documents.

### Live configuration — `POST /api/oferta`

The body carries only `modelSlug` and the configurator `state`; the server loads
the catalogue, re-runs `evaluateConfiguration`, and prices every line itself. A
tampered payload cannot change what the document says — it can only be rejected.

This route deliberately does not touch `configuration_snapshots`. When the
database is unreachable, `getPublicConfigurator` falls back to the checked-in
demo catalogue and the visitor still gets their offer. Nothing is persisted and
the payload contains no personal data.

### Saved configuration — `GET /api/oferta/[reference]`

The snapshot is authoritative for names and prices, so a later catalogue edit
never rewrites a document a visitor already received. Choices the published
catalogue has since dropped are still listed, marked as historic, and the
document carries a warning block.

The preview artwork is re-rendered from the _current_ catalogue by mapping the
snapshot's stable `groupKey:choiceCode` pairs back onto choice identifiers. If a
choice no longer resolves it is skipped, which degrades the artwork rather than
the document.

## Rendering

`@react-pdf/renderer` builds an A4 document from `src/lib/pdf/offer-document.tsx`.
Typical configurations produce two pages: prices and total on the first, next
steps, standard equipment, dealer details and the legal notice on the second.
Larger configurations flow naturally.

### Fonts

The PDF standard fonts cannot be used: their WinAnsi encoding has no U+0219 or
U+021B, so Romanian `ș` and `ț` would render as blanks. Fontsource ships only
WOFF/WOFF2, which the PDF font parser does not read.

Subset TTFs are therefore committed under `src/lib/pdf/fonts/`, built by
`node scripts/build-pdf-fonts.mjs` (needs Python with `fonttools` and network
access). The script downloads Barlow Condensed and Manrope from Google Fonts,
pins static instances of Manrope's variable axis, subsets to Latin and Latin
Extended-A/B, and fails if any required Romanian glyph is missing. The OFL
licences sit alongside the fonts.

### Preview artwork

`renderConfiguredMotorcycle` flattens the configurator's layered preview —
the same base and overlays `resolveConfigurationVisuals` returns for the screen —
into a single JPEG, so the document shows the motorcycle as configured rather
than a generic photograph.

Layers are read from `public/` or, once an administrator uploads a replacement,
fetched from Supabase Storage. Database-provided paths are contained to the
public folder before being read. When no artwork resolves the document renders
without it instead of failing.

Both the fonts and the configurator imagery are reached through the filesystem
rather than an import, so `next.config.ts` traces them explicitly through
`outputFileTracingIncludes`. Without those entries the routes build cleanly and
then fail at runtime with a missing font.

## Rate limiting

Both routes call `enforcePublicActionRateLimitsBestEffort`, which applies the
usual per-address limit but never lets an unreachable database block a
read-only document. An exceeded limit is still enforced and answered with 429.

## Where it appears

The download serves the visitor, who wants to take their configuration away. The
attachment serves VERIDIAN, who wants to forward an offer later.

- The configurator's summary step, next to "Salvează și cere ofertă". It stays
  available when saving fails, which is what the failure message points to.
- `/configuratie/[reference]`, next to the enquiry link.
- Attached to the Resend notification for every enquiry that carries a
  configuration, alongside a permanent link to the same document. See
  [docs/ENQUIRIES.md](ENQUIRIES.md).
- `/atelier/solicitari`, next to each configuration enquiry.

## Related failure mode

Saving a configuration writes to the database and therefore cannot use the
fallback above. Supabase's pooler stops a tenant's pool while it is idle and
restarts it on the next connection, so rare public writes were failing with
`CONNECT_TIMEOUT` before the connection settings gained enough headroom. See
`src/db/transient.ts` and `docs/DEPLOYMENT.md`.
