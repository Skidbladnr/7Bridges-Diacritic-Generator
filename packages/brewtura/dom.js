import { FACES } from './index.js';
/** Render inside an existing semantic heading. No HTML interpolation or global styles. */
export function renderBrewtura(target, run, { tracking = 0 } = {}) {
  if (!Number.isFinite(tracking) || tracking < -0.1 || tracking > 0.5) throw new RangeError('Tracking must be between -0.1 and 0.5 em');
  const doc = target.ownerDocument;
  const visual = doc.createElement('span');
  visual.className = 'brewtura';
  visual.setAttribute('role', 'img');
  visual.setAttribute('aria-label', run.text);
  Object.assign(visual.style, { whiteSpace: 'pre-wrap', fontWeight: '400', fontStyle: 'normal', fontSynthesis: 'none', letterSpacing: '0', overflowWrap: 'anywhere' });
  for (const glyph of run.glyphs) {
    if (glyph.text === '\n') { visual.append(doc.createElement('br')); continue; }
    const span = doc.createElement('span');
    span.textContent = glyph.text;
    span.setAttribute('aria-hidden', 'true');
    const face = FACES.find(f => f.id === glyph.face);
    Object.assign(span.style, { fontFamily: `"${face.family}", sans-serif`, fontSize: `${glyph.scale}em`, letterSpacing: `${tracking / glyph.scale}em` });
    visual.append(span);
  }
  target.replaceChildren(visual);
  return visual;
}
