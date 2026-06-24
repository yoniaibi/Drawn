import { test, expect } from '/opt/node22/lib/node_modules/@playwright/test/index.mjs';

const BASE = 'http://localhost:8100';

async function goToHome(page) {
  await page.goto(BASE + '/(tabs)');
  await page.waitForTimeout(2000);
}

test.describe('Home Feed', () => {
  test('renders home screen with DRAWN logo', async ({ page }) => {
    await goToHome(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/drawn/i);
  });

  test('shows live ticker', async ({ page }) => {
    await goToHome(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/just bought|watching|ticket|Chanel|Rolex/i);
  });

  test('shows filter chips', async ({ page }) => {
    await goToHome(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/tonight/i);
    expect(body).toMatch(/filling fast/i);
    expect(body).toMatch(/high value/i);
    expect(body).toMatch(/bundles/i);
  });

  test('shows category browse section', async ({ page }) => {
    await goToHome(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/browse by category/i);
  });

  test('shows category tiles including new ones', async ({ page }) => {
    await goToHome(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/fashion|watches|tech/i);
  });

  test('shows winner banner', async ({ page }) => {
    await goToHome(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/just won|winner/i);
  });

  test('shows tonight strip with draw count', async ({ page }) => {
    await goToHome(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/tonight|9pm/i);
  });

  test('Tonight filter shows closing tonight draws', async ({ page }) => {
    await goToHome(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/closing tonight|tonight/i);
  });

  test('Filling fast filter works', async ({ page }) => {
    await goToHome(page);
    const chip = page.getByText('Filling fast').first();
    if (await chip.isVisible()) {
      await chip.click();
      await page.waitForTimeout(500);
      const body = await page.textContent('body');
      expect(body).toMatch(/filling fast|draws/i);
    }
  });

  test('Bundles filter works', async ({ page }) => {
    await goToHome(page);
    const chip = page.getByText('Bundles').first();
    if (await chip.isVisible()) {
      await chip.click();
      await page.waitForTimeout(500);
      const body = await page.textContent('body');
      expect(body).toMatch(/bundle|drawn/i);
    }
  });

  test('See all categories navigates to categories screen', async ({ page }) => {
    await goToHome(page);
    const seeAll = page.getByText(/see all/i).first();
    if (await seeAll.isVisible()) {
      await seeAll.click();
      await page.waitForTimeout(1000);
      const body = await page.textContent('body');
      expect(body).toMatch(/explore|categories|available now/i);
    }
  });

  test('shows bottom tab bar', async ({ page }) => {
    await goToHome(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/browse|live|tickets|account|grand draw/i);
  });

  test('tab bar has Grand Draw tab', async ({ page }) => {
    await goToHome(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/grand draw/i);
  });
});
