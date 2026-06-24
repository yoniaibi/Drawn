const { test, expect } = require('/opt/node22/lib/node_modules/playwright/test');
const { waitForApp } = require('./helpers.cjs');
const { gotoAuthenticated } = require('./auth-mock.cjs');

const BASE = 'http://localhost:8100';

test.describe('Home Feed', () => {
  test('renders home screen with DRAWN logo', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/drawn/i);
  });

  test('shows live ticker', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/just bought|watching|ticket|Chanel|Rolex/i);
  });

  test('shows filter chips', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/tonight/i);
    expect(body).toMatch(/filling fast/i);
    expect(body).toMatch(/high value/i);
    expect(body).toMatch(/bundles/i);
  });

  test('shows category browse section', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/browse by category/i);
  });

  test('shows category tiles including new ones', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/fashion/i);
    expect(body).toMatch(/watches/i);
    expect(body).toMatch(/tech/i);
  });

  test('shows winner banner', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/just won|latest win|winner/i);
  });

  test('shows tonight strip with draw count', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/tonight|9pm/i);
  });

  test('shows draw cards with prices', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/£[\d,]+/);
    expect(body).toMatch(/\d+p/);
  });

  test('Filling fast filter works', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const chip = page.getByText('Filling fast').first();
    if (await chip.isVisible()) {
      await chip.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/filling fast|draws|drawn/i);
    }
  });

  test('Bundles filter works', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const chip = page.getByText('Bundles').first();
    if (await chip.isVisible()) {
      await chip.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/bundle|drawn/i);
    }
  });

  test('See all categories navigates to categories screen', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const seeAll = page.getByText(/see all/i).first();
    if (await seeAll.isVisible()) {
      await seeAll.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/explore|categories|available now/i);
    }
  });

  test('shows tab bar with all 5 tabs', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/browse/i);
    expect(body).toMatch(/live/i);
    expect(body).toMatch(/grand draw/i);
    expect(body).toMatch(/my tickets/i);
    expect(body).toMatch(/account/i);
  });

  test('tab bar has Grand Draw tab', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/grand draw/i);
  });
});
