import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import opentype from 'opentype.js';
import { createBrewtura, FACES } from '@7bridges/brewtura';
import { layoutArtwork, artworkSVG, rasterSize } from '../artwork.js';
const { parse } = opentype;
const fonts = new Map(FACES.map(face => {
  const bytes = readFileSync(new URL(`../packages/brewtura/fonts/${face.file}`, import.meta.url));
  return [face.id, parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))];
}));
test('all supplied faces cover the complete Vietnamese alphabet and stacked tone marks', () => {
  const text = 'aàáảãạăằắẳẵặâầấẩẫậeèéẻẽẹêềếểễệiìíỉĩịoòóỏõọôồốổỗộơờớởỡợuùúủũụưừứửữựyỳýỷỹỵđ';
  for (const face of FACES) for (const ch of text + text.toLocaleUpperCase('vi')) assert.ok(fonts.get(face.id).charToGlyphIndex(ch), `${face.id}: ${ch}`);
});
test('outlined SVG preserves accents, uses real bounds, and has no font dependency', () => {
  const run = createBrewtura('ĐẮK LẮK\nHội An & Hà Nội');
  const art = layoutArtwork(run, fonts);
  const svg = artworkSVG(art);
  assert.deepEqual(art.missing, []);
  assert.ok(art.width > 0 && art.height > 200);
  assert.match(svg, /<path d=/); assert.doesNotMatch(svg, /<text|@font-face|font-family|NaN|undefined/);
  assert.match(svg, /Hội An &amp; Hà Nội/);
  assert.equal(art.paths.length, run.glyphs.filter(g => !g.whitespace).length);
});
test('SVG escapes untrusted source text and validates colours', () => {
  const art = layoutArtwork(createBrewtura('<script>alert("x")</script>'), fonts);
  const svg = artworkSVG(art);
  assert.doesNotMatch(svg, /<script>/); assert.match(svg, /&lt;script&gt;/);
  assert.throws(() => artworkSVG(art, { foreground: '" onload="x' }));
});
test('unsupported characters are reported, never silently exported as valid lettering', () => {
  const art = layoutArtwork(createBrewtura('Bia 🍺 中文'), fonts);
  assert.ok(art.missing.includes('🍺')); assert.ok(art.missing.includes('中'));
});
test('line breaks, tracking and alignment affect layout predictably', () => {
  const run = createBrewtura('Hội An\nBia');
  const base = layoutArtwork(run, fonts, { align: 'left' });
  assert.ok(layoutArtwork(run, fonts, { tracking: .2 }).width > base.width);
  assert.notDeepEqual(base.paths, layoutArtwork(run, fonts, { align: 'right' }).paths);
  assert.ok(layoutArtwork(run, fonts, { size: 160 }).height > base.height);
  assert.doesNotMatch(artworkSVG(base, { transparent: true }), /<rect/);
  assert.match(artworkSVG(base, { transparent: false }), /<rect/);
});
test('raster allocation is bounded for long text and high resolution requests', () => {
  for (const [w,h] of [[400,300], [40000,20000], [1,100000]]) {
    const size = rasterSize(w,h,3);
    assert.ok(size.width <= 4096 && size.height <= 4096);
    assert.ok(size.width * size.height <= 16000000);
    assert.ok(size.width > 0 && size.height > 0);
  }
  assert.deepEqual(rasterSize(400,300,2), {width:800,height:600,scale:2});
});
