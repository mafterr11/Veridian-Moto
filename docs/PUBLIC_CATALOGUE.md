# Public catalogue

Phase 6 connects every commercial public surface to the catalogue managed in
Atelier. Server Components receive narrow public DTOs rather than database rows.

## Published data flow

- `/` reads published models, categories, featured flags, and public inventory.
- `/modele` reads published categories and models, then applies URL-based category,
  availability, and sorting filters.
- `/modele/[slug]` reads one published model with standard equipment, hero/gallery
  media, and public `incoming` or `available` inventory.
- `/accesorii` reads published accessories only when their category is also
  published, plus published compatible model names and the first assigned image.
- `sitemap.xml` obtains model slugs from the same published catalogue query.

If `DATABASE_URL` is absent, the routes use checked-in fictional demo records. Once
a database is configured, errors and empty catalogues are not replaced silently by
demo content.

## Privacy boundary

Public inventory DTOs include stock code, condition, year, mileage, colour, public
price, status, and optional media. They never select or expose VIN or private notes.
Accessory DTOs never select internal quantity. Only explicitly public stock in
`incoming` or `available` state is returned.

## Caching and invalidation

Public queries use `use cache`, a one-hour cache life, and catalogue/entity tags.
Atelier mutations revalidate model, inventory, accessory, and global catalogue tags.
The site can therefore serve prerendered catalogue pages while reflecting reviewed
admin changes without a deployment.

## Search and structured data

Model details generate canonical metadata and Open Graph images from the published
record. Each model renders sanitized `Product` JSON-LD with brand, images, category,
price, and availability. The root layout renders `MotorcycleDealer` JSON-LD.
Dynamic sitemap entries include only models returned by the published DTO boundary.

JSON-LD serialization replaces `<` with its Unicode escape to prevent catalogue text
from becoming executable markup.

## Seed behavior

The idempotent database seed now includes card and hero placements, standard model
features, published accessory categories, accessories, media reuse, and model
compatibility. It does not remove existing administrative content.
