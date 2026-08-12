# Generated image assets

The motorcycle and accessory images were generated specifically for VERIDIAN
Moto with the built-in image generation workflow and then converted to optimized
WebP files for the site. They do not use photography from a real manufacturer or
retailer.

## Shared prompt direction

- Use case: photorealistic motorcycle product mockup or campaign image
- Brand: fictional VERIDIAN Moto
- Visual language: mechanically plausible, modern, attainable, dark technical
  surfaces with restrained Veridian green accents
- Framing: full motorcycle visible in a three-quarter view; wheels not cropped
- Exclusions: no rider, text, lettering, logo, watermark, fantasy engineering,
  or recognizable real production model
- Avoided references: BMW, CFMoto, Kawasaki, Ducati, KTM, Honda, Yamaha, Suzuki,
  Triumph, Aprilia, Royal Enfield, Zero, and LiveWire

## Asset-specific prompts

| File                            | Prompt subject and setting                                                                                                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `terran-900-rally.webp`         | Flagship graphite/veridian adventure motorcycle on a wet volcanic mountain road at blue hour; ultra-wide hero composition with negative space on the left.                       |
| `terran-900-rally-glacier.webp` | Precise edit of the flagship render that changes only the painted green panels to Glacier White pearl; all geometry, lighting, reflections, camera and scenery remain fixed.     |
| `terran-900-rally-ember.webp`   | Precise edit of the flagship render that changes only the painted green panels to deep Ember Red metallic; all geometry, lighting, reflections, camera and scenery remain fixed. |
| `terran-650.webp`               | Accessible midweight adventure motorcycle in graphite and Dune Sand, photographed in a dark stone-floor studio.                                                                  |
| `apex-675-r.webp`               | Road-usable middleweight sport motorcycle in obsidian and restrained Veridian, photographed in a dark graphite studio.                                                           |
| `apex-900-rr.webp`              | Halo sport motorcycle in obsidian and Ember Red, photographed with precise pit-garage-inspired studio lighting.                                                                  |
| `rift-700.webp`                 | Compact modern roadster in graphite and Veridian, photographed beneath clean concrete architecture at dawn.                                                                      |
| `meridian-900-gt.webp`          | Glacier White sport tourer with integrated panniers on a mountain pass at first light.                                                                                           |
| `foundry-800.webp`              | Modern-classic roadster with machined details and a brown-black bench seat in a warm workshop courtyard.                                                                         |
| `volt-e2.webp`                  | Believable near-term electric commuter motorcycle in Glacier White and graphite in a contemporary European plaza.                                                                |

The source prompts required realistic suspension, brakes, materials, and
proportions. Each model was prompted separately so the silhouettes remain
distinct instead of producing recoloured duplicates.

The two Terran configurator variants are deliberate exceptions: aligned colour
edits are required so switching finish does not make the motorcycle jump between
different compositions.

## Layered Terran configurator pilot

The Terran 900 Rally configurator uses a second, non-destructive set of aligned
assets. The original catalogue and campaign images remain unchanged.

The three `*-configurator-*-v2.webp` bases preserve the same 1672 × 941 camera and
scene. Compared with the original variants, the selected finish covers the tank,
upper and lower side fairings, radiator shrouds, tail panels, and a restrained
section of the front fender. This makes each colour readable without changing the
motorcycle geometry or mechanical surfaces.

The files under `public/images/configurator/terran-900-rally/` are transparent
1672 × 941 WebP overlays aligned to the same front three-quarter canvas:

| File                                         | Selected option         |
| -------------------------------------------- | ----------------------- |
| `seat-comfort-front-three-quarter.webp`      | Comfort seat            |
| `engine-bars-front-three-quarter.webp`       | Engine protection bars  |
| `tall-screen-front-three-quarter.webp`       | Touring windscreen      |
| `seat-low-front-three-quarter.webp`          | Low seat                |
| `radiator-guard-front-three-quarter.webp`    | Radiator guard          |
| `rally-protection-front-three-quarter.webp`  | Rally engine protection |
| `luggage-rack-front-three-quarter.webp`      | Modular luggage rack    |
| `aluminium-cases-front-three-quarter.webp`   | Aluminium side cases    |
| `soft-bags-front-three-quarter.webp`         | Adventure soft bags     |
| `top-case-front-three-quarter.webp`          | 42 L top case           |
| `passenger-comfort-front-three-quarter.webp` | Passenger comfort kit   |
| `navigation-mount-front-three-quarter.webp`  | Phone/navigation mount  |

The built-in image-generation workflow produced each isolated component on a flat
magenta key background using the original Terran render and the corresponding
accessory product image as references. The installed perspective and cool
blue-hour material response were required explicitly. The repository image helper
then removed the key colour, and deterministic placement normalized every final
overlay to the shared canvas. Temporary composite previews are not shipped.

The expanded local set follows the same workflow. Each component is generated
as an isolated installed part on a flat magenta key, converted to alpha WebP,
then cropped and positioned deterministically on the shared canvas. Existing
accessory catalogue renders are used as material and construction references
where one exists.

Technology packages remain intentionally non-visual: their selectable features
are software, sensor and control changes that do not justify inventing exterior
hardware. Physical choices with a layer are labelled `Vizibil în imagine` in
the configurator.

## Full 2D configurator set

The layered renderer is enabled for all eight catalogue models. Terran 900 Rally
keeps its dedicated 1672 × 941 set; every other model uses an aligned 1448 × 1086
front-three-quarter canvas under `public/images/configurator/<model-slug>/`.

Each of the seven additional models has three selectable finish bases and five
transparent physical-option overlays:

| File pattern                               | Visual selection |
| ------------------------------------------ | ---------------- |
| `color-signature-front-three-quarter.webp` | Signature finish |
| `color-graphite-front-three-quarter.webp`  | Graphite Black   |
| `color-glacier-front-three-quarter.webp`   | Glacier White    |
| `seat-comfort-front-three-quarter.webp`    | Comfort seat     |
| `seat-low-front-three-quarter.webp`        | Low seat         |
| `touring-pack-front-three-quarter.webp`    | Touring screen   |
| `luggage-set-front-three-quarter.webp`     | Luggage system   |
| `urban-pack-front-three-quarter.webp`      | Guards and mount |

Where the original catalogue render already represents one selectable finish,
that source image is reused as the aligned base instead of duplicating it.

The built-in image-generation edit mode produced the finish variants with a
strict preservation prompt: keep camera, motorcycle geometry, wheels, lighting,
reflections and background unchanged; repaint only the existing factory-painted
body panels; make the selected Signature green, Graphite Black or Glacier White
finish broad and immediately readable. Accessory sprites used a component render
prompt: one mechanically plausible, unbranded part or kit, matching the model
family and front-three-quarter perspective, isolated on a uniform magenta key,
with no motorcycle, rider, lettering, watermark, floor or shadow. The shared
image helper converted those renders to alpha, after which deterministic placement
normalized them to each model canvas.

## Accessory image set

All 12 accessory renders use a consistent 3:2, 1536 × 1024 product-photography
format. The prompt set required a single physically plausible product or kit,
dark workshop/studio surfaces, controlled rim light, a restrained Veridian green
accent and sufficient separation between black parts and the background. Text,
logos, watermarks, motorcycles, riders, hands, packaging claims and recognizable
third-party designs were excluded.

| File                                | Prompt subject                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `set-cutii-laterale-aluminium.webp` | Matched pair of brushed-aluminium adventure side cases with black corner protection and mounting hardware.  |
| `sa-comfort-touring.webp`           | Anatomical black touring seat with progressive foam volume, grippy panels and restrained green stitching.   |
| `bare-protectie-motor.webp`         | Symmetrical black tubular-steel engine protection system with model-specific brackets and fasteners.        |
| `suport-telefon-navigatie.webp`     | Machined-aluminium vibration-isolated phone/navigation mount with articulated arm and protected USB-C lead. |
| `top-case-42l.webp`                 | Compact 42 L black top case with reinforced aluminium lid panel, lock and dedicated mounting plate.         |
| `stand-paddock-spate.webp`          | Adjustable rear paddock stand with small wheels and both spool and swingarm adapters.                       |
| `mansoane-incalzite-touring.webp`   | Matched heated-grip kit with compact five-level controller and neatly arranged wiring.                      |
| `proiectoare-led-adventure.webp`    | Pair of round LED auxiliary lights with stone guards, brackets, relay, switch and complete harness.         |
| `parbriz-touring-reglabil.webp`     | Light-smoke impact-resistant touring windscreen with height-adjustment rails and fasteners.                 |
| `geanta-rezervor-12l.webp`          | Structured expandable 12 L tank bag with quick-release ring, rain cover and organized pockets.              |
| `kit-reparatie-compresor.webp`      | Open hard case containing a compact 12 V compressor, gauge and tubeless puncture tools.                     |
| `scut-motor-aluminiu.webp`          | Brushed 4 mm aluminium skid plate with reinforced folds, drainage openings, brackets and hardware.          |

Production paths: `public/images/accessories/*.webp`. The optimized files range
from approximately 26 KB to 93 KB and preserve the generated 1536 × 1024 canvas.

## Administration upload boundary

Atelier accepts JPEG, PNG, WebP, and AVIF files up to 5 MB. The server verifies
declared MIME type against magic bytes, rejects animated input, caps decode work at
24 megapixels, requires at least 320 × 240 px, auto-rotates, strips metadata, limits
output to 2400 × 1800 px, and writes WebP. The normalized output must also remain
under 5 MB.

Storage upload happens before the database association transaction. If association
fails, the object is removed; if that cleanup also fails, the administrator receives
an explicit warning that manual Storage cleanup may be required.
