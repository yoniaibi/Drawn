const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { setupAuthMock } = require('./auth-mock.cjs');

async function waitForApp(page) {
  await page.waitForFunction(
    () => document.body.innerText.trim().length > 50 && !document.body.innerText.includes('enable JavaScript'),
    { timeout: 20000 }
  );
}

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
  });

  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('ERR:', m.text().substring(0, 120)); });

  await setupAuthMock(page);
  await page.goto('http://localhost:8100/');
  await waitForApp(page);

  // Wait a bit for auth redirect to happen
  await page.waitForTimeout(3000);

  const url = page.url();
  const body = await page.textContent('body');
  console.log('Final URL:', url);
  console.log('Body preview:', body.replace(/\s+/g, ' ').substring(0, 400));

  await browser.close();
})();
