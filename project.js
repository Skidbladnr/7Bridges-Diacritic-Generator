import { ENGINE_VERSION, graphemes, PRESETS } from '@7bridges/brewtura';
export const DEFAULTS = Object.freeze({ text: 'Bia ngon.\nBạn tốt.', seed: '7bridges-17', preset: 'signature', caseMode: 'original', size: 96, tracking: 0, align: 'center', foreground: '#22251f', background: '#ecebdf', transparent: true, format: 'svg', scale: 2, speed: 500 });
export const PALETTES = Object.freeze({ house: ['#22251f', '#ecebdf'], citrus: ['#22251f', '#eeeb77'], sky: ['#22251f', '#a2d3e1'], sunset: ['#fff9e8', '#d95220'], night: ['#fff9e8', '#22251f'] });
export function serializeProject(state) { return JSON.stringify({ app: 'brewtura-studio', version: 1, engineVersion: ENGINE_VERSION, design: state }, null, 2); }
export function parseProject(value) {
  const file = typeof value === 'string' ? JSON.parse(value) : value;
  if (!file || file.app !== 'brewtura-studio' || file.version !== 1 || file.engineVersion !== ENGINE_VERSION) throw new Error('This is not a compatible Brewtura Studio project.');
  const s = file.design;
  if (!s || typeof s.text !== 'string' || s.text.length > 4000 || graphemes(s.text).length > 200 || s.text.split('\n').length > 8 || /[\x00-\x08\x0b-\x1f\x7f]/.test(s.text)
    || typeof s.seed !== 'string' || s.seed.length > 100 || !Object.hasOwn(PRESETS, s.preset)
    || !['original','upper','lower','mixed'].includes(s.caseMode) || !['left','center','right'].includes(s.align)
    || !['svg','png','gif'].includes(s.format) || ![1,2,3].includes(s.scale) || ![250,500,1000,2000].includes(s.speed)
    || typeof s.transparent !== 'boolean' || typeof s.size !== 'number' || !Number.isFinite(s.size) || s.size < 32 || s.size > 160
    || typeof s.tracking !== 'number' || !Number.isFinite(s.tracking) || s.tracking < -.06 || s.tracking > .2
    || ![s.foreground,s.background].every(c => typeof c === 'string' && /^#[\da-f]{6}$/i.test(c))) throw new Error('The project contains invalid settings. Your current design has been kept.');
  return Object.fromEntries(Object.keys(DEFAULTS).map(key => [key, s[key]]));
}
