import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:4174', channel: process.env.PLAYWRIGHT_CHANNEL || undefined, headless: true, viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  webServer: { command: 'npm run build && npm run preview -- --strictPort', url: 'http://127.0.0.1:4174', reuseExistingServer: false, timeout: 60000 },
});
