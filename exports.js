import { parse } from 'opentype.js';
import { createBrewtura, FACES } from '@7bridges/brewtura';
import { layoutArtwork, artworkSVG, rasterSize } from './artwork.js';
const urls = import.meta.glob('./packages/brewtura/fonts/*.TTF', { query: '?url', import: 'default', eager: true });
export async function loadFonts() {
  return new Map(await Promise.all(FACES.map(async face => {
    const response = await fetch(urls[`./packages/brewtura/fonts/${face.file}`]);
    if (!response.ok) throw new Error(`Could not load ${face.id}. Reload to try again.`);
    return [face.id, parse(await response.arrayBuffer())];
  })));
}
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}
export function filename(text) { return (text.normalize('NFD').replace(/\p{Mark}/gu, '').replace(/[đĐ]/g, 'd').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 48) || 'brewtura').toLowerCase(); }
async function drawSVG(canvas, svg, x = 0, y = 0, width = canvas.width, height = canvas.height) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error('The artwork could not be rasterised. Try SVG instead.')); image.src = url; });
    canvas.getContext('2d').drawImage(image, x, y, width, height);
  } finally { URL.revokeObjectURL(url); }
}
export async function pngBlob(art, state) {
  const dimensions = rasterSize(art.width, art.height, state.scale);
  const canvas = document.createElement('canvas'); Object.assign(canvas, { width: dimensions.width, height: dimensions.height });
  await drawSVG(canvas, artworkSVG(art, state));
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG export failed. Try a smaller type size.')), 'image/png'));
}
let gifLibrary;
function loadGIF() {
  if (!gifLibrary) gifLibrary = new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = new URL('./scripts/gif.js', import.meta.url).href;
    script.onload = resolve; script.onerror = () => { gifLibrary = undefined; script.remove(); reject(new Error('GIF encoder could not load. Reload and try again.')); };
    document.head.append(script);
  });
  return gifLibrary;
}
export async function gifBlob(state, fonts, signal, progress) {
  await loadGIF(); signal.throwIfAborted();
  const frames = Array.from({ length: 8 }, (_, i) => layoutArtwork(createBrewtura(state.text, { ...state, seed: i === 0 ? state.seed : `${state.seed}-frame-${i}` }), fonts, state));
  if (frames.some(frame => frame.missing.length)) throw new Error('Some characters are unavailable in an animation font. Please use English or Vietnamese text.');
  const width = Math.max(...frames.map(f => f.width)), height = Math.max(...frames.map(f => f.height));
  const dimensions = rasterSize(width, height, 1, 1600);
  const gif = new window.GIF({ workers: 2, quality: 10, width: dimensions.width, height: dimensions.height, repeat: 0, workerScript: new URL('./scripts/gif.worker.js', import.meta.url).href });
  for (let index = 0; index < frames.length; index++) {
    signal.throwIfAborted();
    const canvas = document.createElement('canvas'); canvas.width = dimensions.width; canvas.height = dimensions.height;
    const context = canvas.getContext('2d'); context.fillStyle = state.background; context.fillRect(0, 0, canvas.width, canvas.height);
    const frame = frames[index];
    // Every frame has the same canvas dimensions. Centre smaller artwork without stretching.
    const w = frame.width * dimensions.scale, h = frame.height * dimensions.scale;
    await drawSVG(canvas, artworkSVG(frame, { ...state, transparent: true }), (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    gif.addFrame(canvas, { copy: true, delay: state.speed }); progress((index + 1) / frames.length * 40);
  }
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const cleanup = () => { clearTimeout(timeout); signal.removeEventListener('abort', cancel); [...gif.activeWorkers, ...gif.freeWorkers].forEach(worker => worker.terminate()); };
    const cancel = () => { gif.abort(); cleanup(); reject(new DOMException('Export cancelled', 'AbortError')); };
    const timeout = setTimeout(() => { gif.abort(); cleanup(); reject(new Error('GIF encoding timed out. Try a shorter line of text.')); }, 45000);
    signal.addEventListener('abort', cancel, { once: true });
    gif.on('progress', value => progress(40 + value * 60));
    gif.on('finished', blob => { cleanup(); resolve(blob); });
    try { gif.render(); } catch (error) { cleanup(); reject(error); }
  });
}
