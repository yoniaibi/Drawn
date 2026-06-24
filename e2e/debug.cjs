const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
  });
  const page = await browser.newPage();

  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));

  await page.goto('http://localhost:8100/');
  await page.waitForTimeout(5000);

  const title = await page.title();
  const body = await page.textContent('body');
  const scripts = await page.evaluate(() => document.scripts.length);

  console.log('Title:', title);
  console.log('Scripts:', scripts);
  console.log('Body (first 500):', body.substring(0, 500));

  await browser.close();
})();
