const { expect } = require('/opt/node22/lib/node_modules/playwright/test');

async function waitForApp(page) {
  await page.waitForFunction(
    () => document.body.innerText.trim().length > 50 && !document.body.innerText.includes('enable JavaScript'),
    { timeout: 20000 }
  );
}

module.exports = { waitForApp };
