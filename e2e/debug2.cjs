const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
  });
  const page = await browser.newPage();

  page.on('request', req => {
    if (req.url().includes('.js')) console.log('REQ:', req.url());
  });
  page.on('response', async res => {
    if (res.url().includes('.js')) {
      const ct = res.headers()['content-type'] || '';
      console.log('RES:', res.status(), ct.substring(0, 30), res.url().substring(0, 100));
    }
  });

  // Also check the HTML
  const html = await page.evaluate(async () => {
    const r = await fetch('/');
    return r.text();
  }).catch(() => null);

  await page.goto('http://localhost:8100/');
  await page.waitForTimeout(3000);

  const scripts = await page.evaluate(() => Array.from(document.scripts).map(s => s.src));
  console.log('Script srcs:', scripts);

  await browser.close();
})();
