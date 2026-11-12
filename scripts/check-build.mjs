import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

// Fail deployment if source HTML or missing assets slip into the Pages artifact.
const root = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
assert.match(html, /<link[^>]+rel="stylesheet"[^>]+href="\.\/assets\//);
assert.match(html, /<script[^>]+src="\.\/assets\//);
assert.doesNotMatch(html, /src="\.\/script\.js"/);
const assets = [...html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)].map(match => match[1]);
for (const asset of assets) await access(new URL(asset, root));
console.log(`Built HTML references ${assets.length} existing assets, including bundled CSS and JavaScript.`);
