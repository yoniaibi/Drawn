const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
    args: ['--disable-web-security'],
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  const errors = [];
  const logs = [];
  const failedReqs = [];

  page.on('console', m => logs.push(`[${m.type()}] ${m.text().substring(0, 300)}`));
  page.on('pageerror', e => errors.push(e.message.substring(0, 300)));
  page.on('response', r => {
    if (r.status() >= 400) failedReqs.push(`${r.status()} ${r.url().substring(0, 120)}`);
  });

  await page.goto('http://localhost:8100/', { waitUntil: 'load' });

  // Wait 10s to see what happens
  await page.waitForTimeout(10000);

  const body = await page.textContent('body');

  console.log('=== BODY ===');
  console.log(body.replace(/\s+/g, ' ').substring(0, 600));
  console.log('\n=== JS ERRORS ===');
  errors.forEach(e => console.log(e));
  console.log('\n=== CONSOLE (all) ===');
  logs.forEach(l => console.log(l));
  console.log('\n=== FAILED REQUESTS ===');
  failedReqs.forEach(r => console.log(r));

  await browser.close();
})();
