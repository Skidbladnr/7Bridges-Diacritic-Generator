# Brewtura Studio

The 7 Bridges lettering workshop: an overhaul of the original diacritic/text randomizer.
It creates Brewtura's mixed-face lettering using the existing Vietnamese Futura assets.

## Run

Node 22.12+ is required.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5174. `npm run build` creates a portable `dist/` with relative asset
paths, suitable for static hosting under a subdirectory, including GitHub Pages. Deploy
**dist**, not the unbuilt repository root. `npm run preview` serves the build on port 4174.

## GitHub Pages deployment

`.github/workflows/pages.yml` builds and deploys the site on every push to `main` and can
also be run manually from Actions. Pull requests run the same checks without deploying.
The workflow runs the engine tests and production-browser tests, checks that built HTML
references real bundled assets, and uploads **only `dist/`** to GitHub Pages.

Repository Settings → Pages must use **GitHub Actions** as the publishing source. Serving
the repository root directly cannot work: the source JavaScript contains CSS/package
imports that Vite must bundle first. The Pages artifact preserves relative asset paths
for the `/7Bridges-Diacritic-Generator/` URL. A failed test prevents deployment.

Live site: https://skidbladnr.github.io/7Bridges-Diacritic-Generator/

## The workshop

- Multiline English/Vietnamese text, with NFC normalisation and whole-grapheme handling.
- Calm, Signature and Playful presets, explicit letter case, type size, spacing and alignment.
- Brand palettes and custom lettering/background colours.
- Seeded styles: typing, recolouring and resizing do not randomly reshuffle existing letters.
- Remix, undo/redo, a recoverable Reset, local draft persistence and versioned JSON projects.
- Outlined SVG: portable vector paths with correct bounds and no installed-font dependency.
- PNG: the same artwork rasterised at 1×/2×/3×, with optional transparency and bounded memory.
- GIF: eight sequential, seeded variations on a fixed-size canvas, with progress and cancel.
  GIF uses the selected solid background; SVG/PNG support transparent backgrounds.
- Responsive controls, labelled inputs, native dialog focus/Escape behaviour and reduced motion.
- No runtime CDN dependency; no uploaded text or external text-processing service.

Use Ctrl/⌘+Enter to remix. Outside text fields, Ctrl/⌘+Z and Ctrl/⌘+Shift+Z undo/redo
studio changes. Inside text fields the native editing shortcuts and arrow keys are preserved.

Artwork is limited to 200 graphemes and eight lines. Unsupported glyphs block export with a
specific message. PNG is capped at 4096 px per side / 16 million pixels; GIF at 1600 px per
side and eight frames. Save a project to reproduce or share an exact style.

## Shared engine

[`packages/brewtura`](packages/brewtura/README.md) is the single reusable implementation.
Both this generator and the sibling `7bridges-menu` consume `@7bridges/brewtura` through a
local package dependency. It includes the pure seeded style engine, optional safe DOM
renderer, TypeScript declarations, font manifest and stylesheet. The menu only imports
this small package; it does not load the studio, OpenType parser, GIF encoder or exporter.

`artwork.js`, `exports.js`, `project.js` and `script.js` belong to the studio. The original
unused font collection remains in `fonts/` for reference; only package fonts enter builds.
The original local gif.js encoder and worker are retained and loaded only when exporting GIF.

## Checks

```sh
npm run check                  # engine, real-font/layout and project tests + production build
npx playwright install chromium # first browser-test setup
npm run test:browser           # production-build UI, exports, projects, mobile and keyboard tests
```

Tests cover the full Vietnamese alphabet in all 11 faces, NFC/NFD equivalence, seeded
stability, weight transitions, safe SVG escaping, layout, bounded raster sizes and rejected
project settings. Browser tests exercise actual SVG/PNG/GIF downloads and GIF frame count.
See [verification.md](verification.md) for checks actually executed in this environment.

Font files are reused from the original repository; licensing/approved deployment remains
subject to the existing project handover. No new font rights are implied.
