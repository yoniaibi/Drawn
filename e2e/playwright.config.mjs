import { defineConfig } from '/opt/node22/lib/node_modules/@playwright/test/index.mjs';

export default defineConfig({
  testDir: '.',
  timeout: 20000,
  retries: 1,
  reporter: [['list'], ['json', { outputFile: '/tmp/pw-results.json' }]],
  use: {
    baseURL: 'http://localhost:8100',
    headless: true,
    viewport: { width: 390, height: 844 },
  },
});
