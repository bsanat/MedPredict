import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: { browserName: 'chromium', trace: 'off' },
  projects: [
    { name: 'demo-desktop', testMatch: /demo.spec.ts/, use: { baseURL: 'http://127.0.0.1:4173', viewport: { width: 1440, height: 1200 } } },
    { name: 'demo-mobile', testMatch: /demo.spec.ts/, use: { baseURL: 'http://127.0.0.1:4173', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'api-desktop', testMatch: /api.spec.ts/, use: { baseURL: 'http://127.0.0.1:4174', viewport: { width: 1440, height: 1200 } } },
    { name: 'api-mobile', testMatch: /api.spec.ts/, use: { baseURL: 'http://127.0.0.1:4174', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: [
    { command: 'npm run dev -- --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: false,
      env: { VITE_API_MODE: 'demo', VITE_DEMO_SCENARIO: 'success' } },
    { command: 'npm run dev -- --port 4174 --strictPort', url: 'http://127.0.0.1:4174', reuseExistingServer: false,
      env: { VITE_API_MODE: 'real', VITE_API_BASE_URL: '', VITE_API_TIMEOUT_MS: '1000' } },
  ],
});
