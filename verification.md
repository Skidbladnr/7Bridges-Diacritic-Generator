# Verification — 2026-11-12

Implemented on `feat/brewtura-studio`. This branch does not deploy or alter the live site.

Executed successfully:
- 15 Node tests covering Unicode, deterministic styling, all Vietnamese letters in every
  supplied face, outlined SVG construction/escaping, layout, raster bounds and project validation.
- Vite production build with all local font assets and GIF encoder/worker.
- Sibling menu: existing 25 tests, strict TypeScript checking, preview build and component build.

Browser access recovered before the update was committed. All five production-build
Playwright tests passed using the installed Chrome channel (`PLAYWRIGHT_CHANNEL=chrome
npm run test:browser`). These exercised Vietnamese text, remix/undo, refresh persistence,
real SVG/PNG/GIF downloads, eight GIF frames, project reopening, rejected input, mobile
horizontal overflow at 360/390/768/1440 px and dialog focus. Test assertions are verified;
a separate visual design review and testing on physical devices are still advisable.

The default test configuration uses Playwright Chromium. To reproduce with an installed
Chrome, set `PLAYWRIGHT_CHANNEL=chrome`; otherwise first run `npx playwright install chromium`.

The menu component build now also produces `7bridges-menu.css`, with the font resources
embedded. Host that stylesheet alongside `7bridges-elements.js` and include it in the host
document. The preview entry imports it automatically. Wix has not been deployed or exercised.
