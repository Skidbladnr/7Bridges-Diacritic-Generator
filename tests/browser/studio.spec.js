import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const ready = async page => { await page.goto('/'); await expect(page.locator('#preview svg')).toBeVisible(); await expect(page.locator('#download')).toBeEnabled(); };
const paths = page => page.locator('#preview g').innerHTML();

test('Vietnamese, remix, undo, persistence and keyboard editing', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await ready(page);
  await page.locator('#text').fill('Ha\u0300 No\u0323\u0302i & Bạn');
  await expect(page.locator('#preview svg')).toHaveAttribute('aria-label', 'Hà Nội & Bạn');
  const before = await paths(page);
  await page.locator('#remix').click(); expect(await paths(page)).not.toBe(before);
  await page.locator('#undo').click(); expect(await paths(page)).toBe(before);
  await page.reload(); await expect(page.locator('#preview svg')).toBeVisible(); expect(await paths(page)).toBe(before);
  const tracking = await page.locator('#tracking').inputValue();
  await page.locator('#text').focus(); await page.keyboard.press('ArrowLeft');
  expect(await page.locator('#tracking').inputValue()).toBe(tracking);
  expect(errors).toEqual([]);
});

test('SVG and PNG download correctly; saved projects reopen the exact design', async ({ page }) => {
  await ready(page);
  await page.locator('#text').fill('Hội An & Hà Nội');
  const before = await paths(page);
  let event = page.waitForEvent('download'); await page.locator('#download').click();
  let download = await event; const svg = await readFile(await download.path(), 'utf8');
  expect(svg).toContain('<path'); expect(svg).toContain('&amp;'); expect(svg).not.toContain('<text');
  await page.locator('#format').selectOption('png');
  event = page.waitForEvent('download'); await page.locator('#download').click(); download = await event;
  const png = await readFile(await download.path()); expect(png.subarray(1,4).toString()).toBe('PNG');
  event = page.waitForEvent('download'); await page.locator('#save-project').click(); const project = await event; const projectPath = await project.path();
  await page.locator('#remix').click(); expect(await paths(page)).not.toBe(before);
  await page.locator('#project-file').setInputFiles(projectPath);
  await expect(page.locator('#notice')).toContainText('Project opened'); expect(await paths(page)).toBe(before);
});

test('bounded GIF export runs the worker and downloads an animation', async ({ page }) => {
  await ready(page); await page.locator('#text').fill('Bia'); await page.locator('#format').selectOption('gif');
  await expect(page.locator('#transparent')).toBeDisabled();
  const event = page.waitForEvent('download'); await page.locator('#download').click();
  const file = await event; const bytes = await readFile(await file.path());
  expect(bytes.subarray(0,6).toString()).toBe('GIF89a');
  // Graphics Control Extensions occur once per frame in gif.js output.
  let frames = 0; for (let i=0; i<bytes.length-3; i++) if (bytes[i]===0x21 && bytes[i+1]===0xf9 && bytes[i+2]===0x04) frames++;
  expect(frames).toBe(8); await expect(page.locator('#download')).toBeEnabled();
});

test('empty input, missing glyphs and invalid projects never export silently', async ({ page }) => {
  await ready(page); await page.locator('#text').fill(''); await expect(page.locator('#download')).toBeDisabled();
  await page.locator('#text').fill('🍺'); await expect(page.locator('#notice')).toContainText('aren’t in the supplied fonts'); await expect(page.locator('#download')).toBeDisabled();
  await page.locator('#text').fill('Hà Nội');
  await page.locator('#project-file').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"app":"wrong"}') });
  await expect(page.locator('#notice')).toContainText('not a compatible'); await expect(page.locator('#text')).toHaveValue('Hà Nội');
});

test('phone and tablet layouts fit without horizontal overflow; guide is keyboard accessible', async ({ page }) => {
  await ready(page);
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({width, height:900});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('#preview svg')).toBeVisible();
  }
  await page.locator('#help-button').click(); await expect(page.locator('#help')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.locator('#help')).not.toBeVisible();
  await expect(page.locator('#help-button')).toBeFocused();
});
