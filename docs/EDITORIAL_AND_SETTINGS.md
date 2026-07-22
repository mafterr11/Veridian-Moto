# Editorial content and site settings

## Public behavior

`/descopera` reads only posts with status `published`, a publication timestamp that
has arrived, a valid category, and an assigned cover. Filters are URL-backed and the
detail route supplies canonical metadata, Open Graph values, and Article JSON-LD.
When no database is configured, the same routes use the checked-in fictional article
set so local demos remain complete.

Article bodies use a deliberately small Markdown-style format: level-two and
level-three headings, paragraphs, block quotes, and unordered lists. Inline emphasis
markers are reduced to plain text, links keep their label but not their destination,
and raw HTML is removed. This is a presentation format, not a general HTML editor.

## Atelier workflow

`/atelier/descopera` allows an active administrator to:

- create or edit editorial categories;
- create draft, published, scheduled, and archived articles;
- select an existing media asset or upload a normalized cover;
- set the featured flag and article-specific SEO fields;
- open an authenticated preview before publication.

Publishing requires a cover. A future publication timestamp keeps the post out of
public queries until that time. Archiving preserves the record and its relationships.
Uploading a replacement cover returns the article to draft so the changed presentation
must be reviewed deliberately.

The editor uses UTC for scheduled timestamps. A production deployment can add an
explicit dealership timezone later if editors need local-time conversion.

## Site settings

`/atelier/setari` manages the singleton public settings record: email, phone, address,
seven-day opening hours, optional Instagram/YouTube/Facebook URLs, and default SEO.
Those values feed the root metadata and organization structured data, footer, and
contact page. Checked-in defaults are used only when the database is not configured or
before the singleton has been seeded.

## Cache and trust boundaries

Public editorial and site-settings queries use one-hour cache profiles with explicit
tags. Successful admin mutations revalidate the shared listing/settings tags and the
affected article slug. Admin reads are uncached and require `assertAdmin()`; mutations
repeat authorization and server-side Zod validation. Client-provided publication
state, media IDs, and scheduling values are never written without database checks.

## Seed behavior

`pnpm db:seed` upserts the fictional categories and six complete demo articles by
stable slug. This allows a content release to refresh existing demo databases. It
reuses catalogue media as article covers and preserves site settings plus any post
created under a different slug. Administrator edits made directly to one of the six
checked-in demo slugs are intentionally replaced on the next seed run.
