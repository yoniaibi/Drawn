const { defineConfig, devices } = require('/opt/node22/lib/node_modules/playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.cjs',
  timeout: 30000,
  retries: 1,
  reporter: [['list'], ['json', { outputFile: '/tmp/pw-results.json' }]],
  use: {
    baseURL: 'http://localhost:8100',
    headless: true,
    viewport: { width: 390, height: 844 },
    launchOptions: {
      executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    },
  },
});
