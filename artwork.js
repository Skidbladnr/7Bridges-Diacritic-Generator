/** Outline layout is studio-only. The menu needs only the small Brewtura core + DOM renderer. */
import { FACES } from '@7bridges/brewtura';
const xml = value => String(value).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);
export function layoutArtwork(run, fonts, { size = 96, tracking = 0, align = 'center' } = {}) {
  if (!Number.isFinite(size) || size < 1 || size > 1000 || !Number.isFinite(tracking) || tracking < -0.1 || tracking > 0.5) throw new RangeError('Invalid artwork dimensions');
  const lines = [[]];
  const missing = new Set();
  for (const glyph of run.glyphs) {
    if (glyph.text === '\n') { lines.push([]); continue; }
    const font = fonts.get(glyph.face);
    if (!font) throw new Error(`Font unavailable: ${glyph.face}`);
    const text = glyph.text === '\t' ? '    ' : glyph.text;
    if (!glyph.whitespace) for (const ch of text) if (!font.charToGlyphIndex(ch)) missing.add(ch);
    const fontSize = size * glyph.scale;
    const advance = font.getAdvanceWidth(text, fontSize, { kerning: false });
    lines.at(-1).push({ text, font, size: fontSize, advance, whitespace: glyph.whitespace });
  }
  const widths = lines.map(line => line.reduce((sum, g) => sum + g.advance, 0) + Math.max(0, line.length - 1) * size * tracking);
  const maxWidth = Math.max(1, ...widths);
  const paths = [];
  let minX = 0, minY = 0, maxX = maxWidth, maxY = size * 1.5 + (lines.length - 1) * size * 1.65;
  lines.forEach((line, index) => {
    let x = align === 'center' ? (maxWidth - widths[index]) / 2 : align === 'right' ? maxWidth - widths[index] : 0;
    const y = size * 1.2 + index * size * 1.65;
    for (const glyph of line) {
      if (!glyph.whitespace) {
        const path = glyph.font.getPath(glyph.text, x, y, glyph.size, { kerning: false });
        const bounds = path.getBoundingBox();
        minX = Math.min(minX, bounds.x1); minY = Math.min(minY, bounds.y1);
        maxX = Math.max(maxX, bounds.x2); maxY = Math.max(maxY, bounds.y2);
        // OpenType 2 defaults to flipping standalone paths; preserve our screen coordinates.
        paths.push(path.toPathData({ decimalPlaces: 3, flipY: false }));
      }
      x += glyph.advance + size * tracking;
    }
  });
  const padding = Math.max(12, size * .24);
  return { text: run.text, seed: run.seed, paths, missing: [...missing], x: Math.floor(minX - padding), y: Math.floor(minY - padding), width: Math.ceil(maxX - minX + 2 * padding), height: Math.ceil(maxY - minY + 2 * padding) };
}
export function artworkSVG(art, { foreground = '#22251f', background = '#ecebdf', transparent = true } = {}) {
  if (![foreground, background].every(c => /^#[\da-f]{6}$/i.test(c))) throw new Error('Invalid artwork colour');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${art.width}" height="${art.height}" viewBox="${art.x} ${art.y} ${art.width} ${art.height}" role="img" aria-label="${xml(art.text)}"><title>${xml(art.text)}</title>${transparent ? '' : `<rect x="${art.x}" y="${art.y}" width="${art.width}" height="${art.height}" fill="${background}"/>`}<g fill="${foreground}">${art.paths.map(d => `<path d="${d}"/>`).join('')}</g></svg>`;
}
export function rasterSize(width, height, scale = 2, maxEdge = 4096) {
  const actual = Math.min(scale, maxEdge / width, maxEdge / height, Math.sqrt(16000000 / (width * height)));
  return { width: Math.max(1, Math.round(width * actual)), height: Math.max(1, Math.round(height * actual)), scale: actual };
}
export const faceIds = FACES.map(f => f.id);
