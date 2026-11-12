# @7bridges/brewtura

A small ESM package for the mixed-face lettering used by 7 Bridges. The core has no
runtime dependencies, DOM access, timers, storage or global randomness. The optional
DOM renderer and local font stylesheet are separate entry points. TypeScript declarations
are included. Requires a modern runtime with `Intl.Segmenter` (Node 22+, current browsers).

```js
import { createBrewtura } from '@7bridges/brewtura';
import { renderBrewtura } from '@7bridges/brewtura/dom';
import '@7bridges/brewtura/fonts.css';

const run = createBrewtura('Hà Nội', {
  seed: 'hanoi-heading-v1',
  preset: 'signature', // calm | signature | playful
  caseMode: 'original', // original | upper | lower | mixed
});
renderBrewtura(document.querySelector('h1'), run, { tracking: 0 });
```

`createBrewtura` returns a serializable run with `source`, displayed `text`, `seed`,
`preset`, `caseMode`, `version` and `glyphs`. Each glyph has a complete grapheme,
face ID, relative size and whitespace flag. Source text is normalised to NFC; Vietnamese
marks and emoji sequences remain intact. Font coverage is a separate concern: the
supplied faces support English and Vietnamese, not arbitrary scripts or emoji.

Use the same seed and options to reproduce a design across refreshes. Appending letters
preserves earlier choices. Changing colour, display size or tracking does not remix the
run. First letters avoid extreme weights; consecutive weights differ by at most two steps.
Case changes are explicit; `original` never alters the user's case or accents.

The DOM renderer uses text nodes, relative font sizes and an accessible full-text label.
Call it inside a semantic heading; it replaces that target's children. `tracking` is in em,
from -0.1 to 0.5. It does not register fonts: import the CSS once in the host document,
including when rendering inside a shadow root. Each supplied font is registered at normal
weight/style because weight and obliqueness are already built into the individual faces.
This prevents synthetic bolding and skewing.

## Sharing

The generator is the source of truth for this package. The sibling menu installs it with:

```sh
npm install ../7Bridges-Diacritic-Generator/packages/brewtura
```

For independently checked-out projects, use `npm pack` here and install the generated
archive, or publish this package to the team's private registry. Do not copy the engine
into either application's source. The JavaScript engine and renderer total approximately
6 KB unminified; the optional font assets are larger and separate.

`ENGINE_VERSION` identifies the style algorithm. Preserve version 1 behaviour for saved
projects; bump it and provide migration/version handling before changing that algorithm.
The TTF files originate in this repository's existing `fonts/futuraVn` directory. No font
licence is granted by the package; existing deployment/font approval requirements apply.
