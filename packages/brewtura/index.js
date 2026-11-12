/** Pure, versioned lettering engine. No DOM, timers, global randomness or app state. */
export const ENGINE_VERSION = 1;
export const FACES = Object.freeze([
  ['light', 'Light', 300, false], ['light-oblique', 'LightOblique', 300, true],
  ['book', 'Book', 400, false], ['book-oblique', 'BookOblique', 400, true],
  ['regular', 'Regular', 500, false],
  ['heavy', 'Heavy', 600, false], ['heavy-oblique', 'HeavyOblique', 600, true],
  ['bold', 'Bold', 700, false], ['bold-oblique', 'BoldOblique', 700, true],
  ['extra-bold', 'ExtraBold', 800, false], ['extra-bold-oblique', 'ExtraBoldOblique', 800, true],
].map(([id, suffix, weight, oblique]) => Object.freeze({
  id, family: `Brewtura ${id}`, file: `SFUFutura${suffix}.TTF`, weight, oblique,
})));
export const PRESETS = Object.freeze({
  calm: Object.freeze({ variation: 0.05, oblique: false, minWeight: 400, maxWeight: 700 }),
  signature: Object.freeze({ variation: 0.13, oblique: true, minWeight: 300, maxWeight: 800 }),
  playful: Object.freeze({ variation: 0.23, oblique: true, minWeight: 300, maxWeight: 800 }),
});
const segmenter = new Intl.Segmenter('vi', { granularity: 'grapheme' });
export function graphemes(text) {
  return Array.from(segmenter.segment(String(text).normalize('NFC')), ({ segment }) => segment);
}
function randomFrom(seed) {
  let state = 2166136261;
  for (const ch of String(seed)) { state ^= ch.codePointAt(0); state = Math.imul(state, 16777619); }
  return () => {
    state += 0x6D2B79F5;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
/** Stable for identical text, seed and options. Changing size/colour never remixes. */
export function createBrewtura(text, options = {}) {
  const preset = options.preset ?? 'signature';
  const caseMode = options.caseMode ?? 'original';
  if (!Object.hasOwn(PRESETS, preset)) throw new RangeError('Unknown Brewtura preset');
  if (!['original', 'upper', 'lower', 'mixed'].includes(caseMode)) throw new RangeError('Unknown case mode');
  const seed = String(options.seed ?? '7bridges');
  const settings = PRESETS[preset];
  const source = String(text).replace(/\r\n?/g, '\n').normalize('NFC');
  const transformed = caseMode === 'upper' ? source.toLocaleUpperCase('vi') : caseMode === 'lower' ? source.toLocaleLowerCase('vi') : source;
  const random = randomFrom(seed);
  let previousWeight = 500;
  let first = true;
  const glyphs = graphemes(transformed).map((original, index) => {
    if (/^\s+$/u.test(original)) {
      if (original === '\n') first = true;
      return { index, text: original, face: 'regular', scale: 1, whitespace: true };
    }
    const text = caseMode === 'mixed' ? (random() < 0.5 ? original.toLocaleUpperCase('vi') : original.toLocaleLowerCase('vi')) : original;
    const choices = FACES.filter(face => face.weight >= settings.minWeight && face.weight <= settings.maxWeight
      && (settings.oblique || !face.oblique) && (!first || (face.weight > 300 && face.weight < 800))
      && Math.abs(face.weight - previousWeight) <= 200);
    const face = choices[Math.floor(random() * choices.length)];
    previousWeight = face.weight;
    first = false;
    const scale = Math.round((1 + (random() * 2 - 1) * settings.variation) * 1000) / 1000;
    return { index, text, face: face.id, scale, whitespace: false };
  });
  return { version: ENGINE_VERSION, source, text: glyphs.map(g => g.text).join(''), seed, preset, caseMode, glyphs };
}
