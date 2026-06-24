const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
  });
  const page = await browser.newPage();

  for (const url of ['/grand-draw/live', '/grand-draw/winner', '/notifications', '/wallet', '/account/settings']) {
    await page.goto('http://localhost:8100' + url);
    await page.waitForFunction(
      () => document.body.innerText.trim().length > 50 && !document.body.innerText.includes('enable JavaScript'),
      { timeout: 10000 }
    ).catch(() => {});
    const body = await page.textContent('body');
    const preview = body.replace(/\s+/g, ' ').substring(0, 150);
    console.log(url + ':', preview);
  }

  await browser.close();
})();
