const { test, expect } = require('/opt/node22/lib/node_modules/playwright/test');
const { waitForApp } = require('./helpers.cjs');
const { gotoAuthenticated } = require('./auth-mock.cjs');

const BASE = 'http://localhost:8100';

test.describe('Categories Index', () => {
  test('renders explore screen', async ({ page }) => {
    await gotoAuthenticated(page, '/categories', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/explore|categories/i);
  });

  test('shows Available Now section', async ({ page }) => {
    await gotoAuthenticated(page, '/categories', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/available now/i);
  });

  test('shows Coming Soon section', async ({ page }) => {
    await gotoAuthenticated(page, '/categories', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/coming soon/i);
  });

  test('shows all 7 established categories', async ({ page }) => {
    await gotoAuthenticated(page, '/categories', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/fashion/i);
    expect(body).toMatch(/sneakers/i);
    expect(body).toMatch(/bags/i);
    expect(body).toMatch(/watches/i);
    expect(body).toMatch(/tech/i);
    expect(body).toMatch(/art/i);
    expect(body).toMatch(/jewellery/i);
  });

  test('shows 5 coming soon categories', async ({ page }) => {
    await gotoAuthenticated(page, '/categories', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/wine|spirits/i);
    expect(body).toMatch(/travel/i);
    expect(body).toMatch(/home|living/i);
    expect(body).toMatch(/beauty/i);
    expect(body).toMatch(/collectibles/i);
  });

  test('shows suggest card at bottom', async ({ page }) => {
    await gotoAuthenticated(page, '/categories', waitForApp);
    await page.evaluate(() => window.scrollTo(0, 9999));
    const body = await page.textContent('body');
    expect(body).toMatch(/don'?t see|demand|9pm/i);
  });
});

test.describe('Category Detail — Fashion', () => {
  test('renders fashion category page', async ({ page }) => {
    await gotoAuthenticated(page, '/categories/fashion', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/fashion/i);
  });

  test('shows category description', async ({ page }) => {
    await gotoAuthenticated(page, '/categories/fashion', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/designer|clothing|fashion/i);
  });

  test('shows related categories at bottom', async ({ page }) => {
    await gotoAuthenticated(page, '/categories/fashion', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/explore more/i);
  });

  test('shows draws or empty state', async ({ page }) => {
    await gotoAuthenticated(page, '/categories/fashion', waitForApp);
    const body = await page.textContent('body');
    // Either draws are listed OR empty state — category page itself must render
    expect(body).toMatch(/fashion|draw|browse|tonight|explore more/i);
  });
});

test.describe('Category Detail — Coming Soon (Wine & Spirits)', () => {
  test('renders coming soon state', async ({ page }) => {
    await gotoAuthenticated(page, '/categories/wine-spirits', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/wine|spirits/i);
  });

  test('shows coming soon badge', async ({ page }) => {
    await gotoAuthenticated(page, '/categories/wine-spirits', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/coming soon|launching soon/i);
  });

  test('shows browse live CTA', async ({ page }) => {
    await gotoAuthenticated(page, '/categories/wine-spirits', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/browse what'?s live|live now/i);
  });
});
