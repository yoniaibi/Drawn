const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:8100/categories');
  await page.waitForFunction(
    () => document.body.innerText.trim().length > 50 && !document.body.innerText.includes('enable JavaScript'),
    { timeout: 15000 }
  ).catch(() => {});
  const body = await page.textContent('body');
  console.log('Categories body (first 300):', body.substring(0, 300));

  await page.goto('http://localhost:8100/categories/fashion');
  await page.waitForFunction(
    () => document.body.innerText.trim().length > 50 && !document.body.innerText.includes('enable JavaScript'),
    { timeout: 15000 }
  ).catch(() => {});
  const body2 = await page.textContent('body');
  console.log('Fashion body (first 300):', body2.substring(0, 300));

  await browser.close();
})();
