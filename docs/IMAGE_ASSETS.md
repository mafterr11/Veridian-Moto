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
