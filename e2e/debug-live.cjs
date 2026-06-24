const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  const errors = [];
  const logs = [];
  const requests = [];

  page.on('console', m => logs.push(`[${m.type()}] ${m.text().substring(0, 200)}`));
  page.on('pageerror', e => errors.push(e.message.substring(0, 200)));
  page.on('response', r => {
    if (r.status() >= 400) requests.push(`${r.status()} ${r.url().substring(0, 100)}`);
  });

  await page.goto('https://yoniaibi.github.io/Drawn/webapp/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(8000);

  const body = await page.textContent('body');

  console.log('=== BODY (first 500) ===');
  console.log(body.replace(/\s+/g, ' ').substring(0, 500));
  console.log('\n=== ERRORS ===');
  errors.forEach(e => console.log(e));
  console.log('\n=== CONSOLE LOGS (first 20) ===');
  logs.slice(0, 20).forEach(l => console.log(l));
  console.log('\n=== FAILED REQUESTS ===');
  requests.forEach(r => console.log(r));

  await browser.close();
})();
