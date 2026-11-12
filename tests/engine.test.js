import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrewtura, graphemes, FACES } from '@7bridges/brewtura';
import { DEFAULTS, serializeProject, parseProject } from '../project.js';

test('NFC and decomposed Vietnamese produce identical complete graphemes and styling', () => {
  const text = 'Hà Nội · Bình Dương · Sài Gòn · Đắk Lắk · Ắ ẵ ễ ộ ự';
  assert.deepEqual(createBrewtura(text), createBrewtura(text.normalize('NFD')));
  assert.equal(createBrewtura(text).text, text);
  assert.deepEqual(graphemes('a\u0306\u0301👨‍👩‍👦🇻🇳'), ['ắ','👨‍👩‍👦','🇻🇳']);
});
test('seeded lettering is stable and a different seed creates a new design', () => {
  const text = 'GOOD BEER. GREAT COMPANY.';
  const a = createBrewtura(text, { seed: 'saved-design' });
  assert.deepEqual(a, createBrewtura(text, { seed: 'saved-design' }));
  assert.notDeepEqual(a.glyphs, createBrewtura(text, { seed: 'new-design' }).glyphs);
  assert.deepEqual(a.glyphs, createBrewtura(text, { seed: 'saved-design', size: 140, foreground: '#ffffff' }).glyphs);
});
test('appending text retains existing lettering rather than remixing every character', () => {
  const before = createBrewtura('Hà Nội').glyphs;
  assert.deepEqual(createBrewtura('Hà Nội taproom').glyphs.slice(0, before.length), before);
});
test('case controls preserve Vietnamese marks and explicit whitespace', () => {
  assert.equal(createBrewtura('  Đặng\nHội\tAn  ', { caseMode: 'upper' }).text, '  ĐẶNG\nHỘI\tAN  ');
  assert.equal(createBrewtura('ĐẶNG', { caseMode: 'lower' }).text, 'đặng');
  assert.equal(createBrewtura('a\r\nb\rc').text, 'a\nb\nc');
  assert.deepEqual(createBrewtura('').glyphs, []);
});
test('first visible letter has a moderate weight and adjacent weights transition smoothly', () => {
  for (let seed = 0; seed < 100; seed++) {
    const run = createBrewtura('  Bia ngon.\nBạn tốt.', { seed });
    let first = true, previous = 500;
    for (const glyph of run.glyphs) {
      if (glyph.text === '\n') first = true;
      if (glyph.whitespace) continue;
      const face = FACES.find(f => f.id === glyph.face);
      if (first) assert.ok(face.weight > 300 && face.weight < 800);
      assert.ok(Math.abs(face.weight - previous) <= 200);
      assert.ok(glyph.scale >= .87 && glyph.scale <= 1.13);
      previous = face.weight; first = false;
    }
  }
});
test('calm uses upright faces and tighter size variation', () => {
  for (const glyph of createBrewtura('Thực đơn taproom · 7 Bridges', { preset: 'calm' }).glyphs) {
    assert.equal(FACES.find(f => f.id === glyph.face).oblique, false);
    assert.ok(glyph.scale >= .95 && glyph.scale <= 1.05);
  }
});
test('unsupported engine controls fail clearly', () => {
  assert.throws(() => createBrewtura('test', { preset: '__proto__' }), RangeError);
  assert.throws(() => createBrewtura('test', { caseMode: 'random' }), RangeError);
});
test('project round trip recreates the exact lettering', () => {
  const state = { ...DEFAULTS, seed: 'abc-123', text: 'Đặng & Bạn <3', tracking: -.03, caseMode: 'mixed' };
  const restored = parseProject(serializeProject(state));
  assert.deepEqual(restored, state);
  assert.deepEqual(createBrewtura(state.text, state), createBrewtura(restored.text, restored));
});
test('project import rejects invalid settings and incompatible engine versions', () => {
  for (const patch of [{ size: NaN }, { size: 5000 }, { tracking: -.5 }, { foreground: 'url(https://example.com)' }, { text: 'a'.repeat(201) }, { text: '\n'.repeat(8) }, { text: 'a\u0000b' }, { preset: '__proto__' }, { transparent: 'yes' }, { scale: 100 }, { seed: {} }]) {
    assert.throws(() => parseProject(serializeProject({ ...DEFAULTS, ...patch })));
  }
  const wrong = JSON.parse(serializeProject(DEFAULTS)); wrong.engineVersion = 99;
  assert.throws(() => parseProject(wrong));
  assert.throws(() => parseProject('{broken'));
});
