import './styles.css';
import { createBrewtura, graphemes } from '@7bridges/brewtura';
import { layoutArtwork, artworkSVG, rasterSize } from './artwork.js';
import { DEFAULTS, PALETTES, parseProject, serializeProject } from './project.js';
import { loadFonts, downloadBlob, filename, pngBlob, gifBlob } from './exports.js';
const $ = id => document.getElementById(id);
const storageKey = '7bridges.brewtura.v1';
let state = { ...DEFAULTS }, fonts, art, busy = false, abort, composition = false;
let history = [], future = [], lastEdit = '', lastEditTime = 0;
try { const saved = localStorage.getItem(storageKey); if (saved) state = parseProject(saved); } catch { /* A corrupt/older draft must never stop the editor. */ }
function message(text = '', error = false) { $('notice').textContent = text; $('notice').classList.toggle('error', error); }
function save() {
  try { localStorage.setItem(storageKey, serializeProject(state)); $('save-status').textContent = 'Saved on this device'; }
  catch { $('save-status').textContent = 'Browser storage unavailable · use Save project'; }
}
function commit(patch, editKey = '') {
  const next = { ...state, ...patch };
  if (JSON.stringify(state) === JSON.stringify(next)) return;
  const now = Date.now();
  if (!editKey || editKey !== lastEdit || now - lastEditTime > 700) { history.push({ ...state }); if (history.length > 80) history.shift(); }
  lastEdit = editKey; lastEditTime = now; future = []; state = next;
  sync(); render(); save();
}
function sync() {
  const mapping = { text: 'text', 'case-mode': 'caseMode', size: 'size', tracking: 'tracking', foreground: 'foreground', background: 'background', format: 'format', scale: 'scale', speed: 'speed' };
  for (const [id, key] of Object.entries(mapping)) if ($(id).value !== String(state[key])) $(id).value = state[key];
  $('transparent').checked = state.transparent;
  $('transparent').disabled = state.format === 'gif';
  $('size-value').value = `${state.size} px`; $('tracking-value').value = `${state.tracking} em`;
  $('character-count').textContent = `${graphemes(state.text).length} / 200`;
  document.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.preset === state.preset)));
  document.querySelectorAll('[data-align]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.align === state.align)));
  document.querySelectorAll('[data-palette]').forEach(button => { const [fg, bg] = PALETTES[button.dataset.palette]; button.setAttribute('aria-pressed', String(fg === state.foreground && bg === state.background)); });
  $('undo').disabled = !history.length; $('redo').disabled = !future.length;
  $('scale-field').hidden = state.format !== 'png'; $('animation-options').hidden = state.format !== 'gif';
  $('download').textContent = busy ? 'Preparing…' : `Download ${state.format.toUpperCase()} ↓`;
  $('export-note').textContent = state.format === 'svg' ? 'Outlined artwork. No font installation needed.' : state.format === 'png' ? 'Crisp artwork, ready to place in your layout.' : '8 frames. Background colour included.';
}
function render() {
  $('artboard').style.background = state.background; $('artboard').style.color = state.foreground;
  if (!fonts) return;
  message();
  art = null;
  if (!state.text.trim()) {
    const empty = document.createElement('p'); empty.textContent = 'Your next good idea starts here.'; empty.className = 'loading'; $('preview').replaceChildren(empty); $('dimensions').textContent = 'ADD SOME WORDS';
  } else {
    const run = createBrewtura(state.text, state); art = layoutArtwork(run, fonts, state);
    // SVG contains only escaped text, validated hex colours, and paths from our local fonts.
    const svg = new DOMParser().parseFromString(artworkSVG(art, state), 'image/svg+xml').documentElement;
    $('preview').replaceChildren(document.importNode(svg, true));
    const dimensions = state.format === 'png' ? rasterSize(art.width, art.height, state.scale) : art;
    $('dimensions').textContent = `${dimensions.width} × ${dimensions.height} ${state.format === 'png' ? 'PX' : 'ARTWORK'}`;
    if (art.missing.length) message(`These characters aren’t in the supplied fonts: ${art.missing.join(' ')}. Use English or Vietnamese lettering to export.`, true);
    else if (state.format === 'png' && dimensions.scale < state.scale) message('PNG resolution is capped at 4096 px per side for reliable downloads. SVG keeps unlimited resolution.');
    else if (state.foreground.toLowerCase() === state.background.toLowerCase()) message('Lettering and background have the same colour. Pick a different colour to see your design.');
  }
  $('download').disabled = busy || !art || art.missing.length > 0;
}
function undo() { if (!history.length) return; future.push(state); state = history.pop(); lastEdit = ''; sync(); render(); save(); }
function redo() { if (!future.length) return; history.push(state); state = future.pop(); lastEdit = ''; sync(); render(); save(); }
function remix() { commit({ seed: crypto.randomUUID() }); }
function readText() {
  if (composition) return;
  const source = $('text').value.replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '');
  const text = graphemes(source).slice(0, 200).join('').split('\n').slice(0, 8).join('\n');
  commit({ text }, 'text');
  if ($('text').value !== text) $('text').value = text;
  if (source !== text && source.normalize('NFC') !== text) message('Keep artwork to 200 characters and 8 lines. The extra text was trimmed.');
}
$('text').addEventListener('compositionstart', () => { composition = true; });
$('text').addEventListener('compositionend', () => { composition = false; readText(); });
$('text').addEventListener('input', readText);
for (const [id, key] of [['case-mode','caseMode'], ['format','format']]) $(id).addEventListener('change', () => commit({ [key]: $(id).value }));
for (const key of ['size', 'tracking', 'scale', 'speed']) $(key).addEventListener('input', () => commit({ [key]: Number($(key).value) }, key));
for (const key of ['foreground', 'background']) $(key).addEventListener('input', () => commit({ [key]: $(key).value }, key));
$('transparent').addEventListener('change', () => commit({ transparent: $('transparent').checked }));
document.querySelectorAll('[data-preset]').forEach(button => button.onclick = () => commit({ preset: button.dataset.preset }));
document.querySelectorAll('[data-align]').forEach(button => button.onclick = () => commit({ align: button.dataset.align }));
document.querySelectorAll('[data-palette]').forEach(button => button.onclick = () => { const [foreground, background] = PALETTES[button.dataset.palette]; commit({ foreground, background }); });
document.querySelectorAll('[data-sample]').forEach(button => button.onclick = () => commit({ text: button.dataset.sample }));
$('remix').onclick = remix; $('undo').onclick = undo; $('redo').onclick = redo;
$('reset').onclick = () => commit({ ...DEFAULTS });
document.addEventListener('keydown', event => {
  if ($('help').open || event.isComposing) return;
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); remix(); }
  const editing = event.target.matches('input, textarea, select, [contenteditable=true]');
  if (!editing && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
});
$('help-button').onclick = () => $('help').showModal();
$('close-help').onclick = $('help-done').onclick = () => $('help').close();
$('help').addEventListener('click', event => { if (event.target === $('help')) { const r = $('help').getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) $('help').close(); } });
$('save-project').onclick = () => { downloadBlob(new Blob([serializeProject(state)], { type: 'application/json' }), `${filename(state.text)}.brewtura.json`); message('Project saved with your exact lettering and settings.'); };
$('open-project').onclick = () => $('project-file').click();
$('project-file').addEventListener('change', async () => {
  const file = $('project-file').files[0]; if (!file) return;
  try { if (file.size > 30000) throw new Error('That file is too large to be a Brewtura project.'); const project = parseProject(await file.text()); commit(project); message('Project opened. Undo returns to your previous design.'); }
  catch (error) { message(error instanceof SyntaxError ? 'That file is not valid JSON. Choose a saved Brewtura project.' : error.message, true); }
  finally { $('project-file').value = ''; }
});
$('cancel-export').onclick = () => abort?.abort();
$('download').onclick = async () => {
  if (busy || !art || art.missing.length) return;
  const snapshot = { ...state }, artwork = art;
  busy = true; abort = new AbortController(); const signal = abort.signal;
  $('export-progress').hidden = false; $('progress').value = 0; sync(); $('download').disabled = true;
  message(`Preparing your ${snapshot.format.toUpperCase()}…`);
  try {
    let blob;
    if (snapshot.format === 'svg') blob = new Blob([artworkSVG(artwork, snapshot)], { type: 'image/svg+xml' });
    else if (snapshot.format === 'png') blob = await pngBlob(artwork, snapshot);
    else blob = await gifBlob(snapshot, fonts, signal, value => { $('progress').value = value; });
    signal.throwIfAborted(); downloadBlob(blob, `${filename(snapshot.text)}.${snapshot.format}`);
    message(`${snapshot.format.toUpperCase()} downloaded. Your lettering is ready to use.`);
  } catch (error) { message(error.name === 'AbortError' ? 'Export cancelled. Your design is safe.' : error.message, error.name !== 'AbortError'); }
  finally { busy = false; abort = null; $('export-progress').hidden = true; sync(); $('download').disabled = !art || art.missing.length > 0; }
};
sync(); save();
try { fonts = await loadFonts(); $('artboard').setAttribute('aria-busy', 'false'); render(); }
catch (error) { $('preview').textContent = 'The fonts couldn’t load. Please reload to try again.'; $('dimensions').textContent = 'FONTS UNAVAILABLE'; $('artboard').setAttribute('aria-busy', 'false'); message(error.message, true); }
