# Generated image assets

The eight motorcycle images were generated specifically for VERIDIAN Moto with
the built-in image generation workflow and then converted to optimized WebP
files for the site. They do not use photography from a real manufacturer.

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

## Administration upload boundary

Atelier accepts JPEG, PNG, WebP, and AVIF files up to 5 MB. The server verifies
declared MIME type against magic bytes, rejects animated input, caps decode work at
24 megapixels, requires at least 320 × 240 px, auto-rotates, strips metadata, limits
output to 2400 × 1800 px, and writes WebP. The normalized output must also remain
under 5 MB.

Storage upload happens before the database association transaction. If association
fails, the object is removed; if that cleanup also fails, the administrator receives
an explicit warning that manual Storage cleanup may be required.
