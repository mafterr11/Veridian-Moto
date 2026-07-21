# Catalogue administration

Atelier is the unlinked, protected catalogue studio under `/atelier`. After the
Supabase project, migrations, seed, Auth user, and admin profile are configured,
an administrator can maintain the catalogue without editing source files.

## Recommended workflow

1. Publish the required motorcycle and accessory categories.
2. Create a motorcycle draft and save its identity and key specifications.
3. Add standard-equipment rows and card/hero images.
4. If the configurator is enabled, create groups and choices, choose valid defaults,
   add cross-choice rules, and publish or archive every group used by the model.
5. Run **Publică modelul**. All publication issues are reported together; no partial
   status change occurs.
6. Create stock units and accessories. Keep new accessories as drafts until at
   least one image is attached.

Editing a published motorcycle, its features, configuration, or media returns it
to draft. This prevents unreviewed changes from appearing publicly. Archiving is
used instead of destructive catalogue deletion.

## Motorcycle publication contract

A motorcycle can be published only when it has:

- a published category, name, unique slug, complete summary, and description;
- a valid non-negative base price;
- positive power, torque, wet weight, and seat height;
- at least one `card` image and one `hero` image;
- when configuration is enabled, published groups with coherent selection limits,
  valid defaults, and satisfiable requires/excludes rules;
- no configuration group left in draft.

The validator returns every known issue and publication runs inside the same
database transaction as the final status update.

## Inventory and privacy

Stock records include a stock code, condition, year, mileage, colour, actual price,
status, and optional images. VIN and notes are private administration fields and are
never included in public DTOs. Only `incoming` and `available` units may be marked
public; reserved, sold, and archived units are rejected or hidden.

## Accessories

An accessory has a category, SKU, price, stock state, optional internal quantity,
images, and compatible motorcycle models. A published accessory requires a
published category and at least one attached image. Internal quantity is never
included in public DTOs.

## Images

Upload forms accept JPEG, PNG, WebP, and AVIF files up to 5 MB. The server checks
the declared MIME type and binary signature, rejects unsafe/animated/undersized
input, applies orientation, limits the output to 2400 × 1800, strips metadata, and
stores WebP. Upload and catalogue write authorization are both checked server-side.

Removing an association leaves the media asset in the shared library. This is
deliberate because one asset can be reused by several catalogue records. Storage
garbage collection should be introduced later as an explicit audited maintenance
operation.

## Enquiry inbox

`/atelier/solicitari` is part of the same protected shell but intentionally separate
from catalogue editing. It filters general/configuration enquiries and workflow
status, shows the exact immutable configuration when attached, and stores private
follow-up notes. Email notification is only an alert; the inbox remains the source of
truth. See [ENQUIRIES.md](ENQUIRIES.md) for the public write flow and remaining
production hardening.
