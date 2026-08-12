# Codex Cloud handoff — configurator 2D

## Scope

- Branch de continuare: `codex/configurator-2d`.
- Scope strict 2D; nu introduce randare 3D.
- Pilotul complet este `Terran 900 Rally`, unghiul
  `front-three-quarter`.
- Nu regenera și nu înlocui asset-urile pilot existente fără o cerere
  explicită și o comparație vizuală.

## Ce este implementat

- Baze complete și aliniate pentru `Veridian Green`, `Glacier White` și
  `Ember Red`.
- Overlay-uri transparente pentru `Șa Comfort`, `Bare protecție motor` și
  `Parbriz Touring`.
- Contractul `ConfiguratorVisualMedia` și resolverul pur
  `resolveConfigurationVisuals`.
- Preview React stratificat, fallback pentru cataloagele legacy, rezumat
  accesibil și highlight la selecție.
- Citirea `configurator_base`/`configurator_overlay` din baza de date și
  legarea media de `optionChoiceId`.
- Editor Atelier pentru legarea media de opțiuni și validare server-side a
  modelului, rolului și stării opțiunii.
- Seed idempotent pentru media pilot.

## Asset-uri pilot

- `public/images/models/terran-900-rally-configurator-veridian-v2.webp`
- `public/images/models/terran-900-rally-configurator-glacier-v2.webp`
- `public/images/models/terran-900-rally-configurator-ember-v2.webp`
- `public/images/configurator/terran-900-rally/seat-comfort-front-three-quarter.webp`
- `public/images/configurator/terran-900-rally/engine-bars-front-three-quarter.webp`
- `public/images/configurator/terran-900-rally/tall-screen-front-three-quarter.webp`

Toate au canvasul `1672 × 941`. Overlay-urile trebuie să păstreze transparența
și aceeași cameră, scară, lumină și poziție ca baza.

## Setup cloud

- Runtime: Node.js 24.
- Package manager: pnpm, conform `packageManager` din `package.json`.
- Setup:

  ```bash
  pnpm install --frozen-lockfile
  ```

- Pentru lucru fără bază de date nu sunt necesare variabile de mediu.
- Nu copia secrete de producție în environment. Dacă un task viitor chiar cere
  DB, folosește numai un proiect staging/disposable cu privilegii minime.
- Internetul agentului rămâne dezactivat implicit; activează-l doar pentru un
  task care îl cere explicit.

## Verificare confirmată la handoff

- `pnpm check`: trecut.
- Vitest: 37 fișiere și 115 teste trecute.
- Drizzle schema check: trecut.
- Next.js production build: trecut.
- Playwright focalizat: culoare → șa → bare motor → parbriz, trecut.
- Viewport mobil 390 px: fără overflow orizontal.

Nu repeta suita completă după schimbări minore. Rulează verificarea cea mai
mică ce poate detecta realist regresia introdusă; păstrează `pnpm check` pentru
un handoff de milestone.

## Următorul obiectiv sigur

1. Citește acest document, `AGENTS.md`, `docs/IMAGE_ASSETS.md` și contractul din
   `src/domain/configurator`.
2. Confirmă că branch-ul conține cele șase asset-uri pilot și preview-ul
   stratificat.
3. Inventariază opțiunile Terran rămase care ar beneficia de un overlay 2D.
4. Propune următorul lot mic, ordonat după impact vizual și posibilitatea de a
   produce asset-uri credibile.
5. Nu genera placeholder-e și nu implementa 3D. Nu modifica prețuri, reguli sau
   salvarea configurației fără cerere explicită.

## Criteriu de continuare

Cloud-ul este pregătit când poate identifica branch-ul corect, contractul
`visualMedia`, cele șase asset-uri pilot și rezultatele verificărilor de mai sus
fără să presupună că are acces la starea locală necomisă.
