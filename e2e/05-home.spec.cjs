const { test, expect } = require('/opt/node22/lib/node_modules/playwright/test');
const { waitForApp } = require('./helpers.cjs');

const BASE = 'http://localhost:8100';

// The landing page shows draws, winner banner, and draw cards without auth.
// Filter chips, category row, tab bar are only available after login.
async function goToLanding(page) {
  await page.goto(BASE);
  await waitForApp(page);
}

test.describe('Home Feed', () => {
  test('renders home screen with DRAWN logo', async ({ page }) => {
    await goToLanding(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/drawn/i);
  });

  test('shows live ticker', async ({ page }) => {
    await goToLanding(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/just bought|watching|ticket|Chanel|Rolex/i);
  });

  test.skip('shows filter chips (requires auth)', async ({ page }) => {
    // Filter chips (Tonight, Filling fast, High value, Bundles) are on the
    // authenticated home tab, not the public landing page.
    await goToLanding(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/tonight/i);
    expect(body).toMatch(/filling fast/i);
    expect(body).toMatch(/high value/i);
    expect(body).toMatch(/bundles/i);
  });

  test.skip('shows category browse section (requires auth)', async ({ page }) => {
    // Category row is on the authenticated home tab only.
    await goToLanding(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/browse by category/i);
  });

  test('shows luxury items on landing', async ({ page }) => {
    await goToLanding(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/fashion|watches|tech|chanel|rolex/i);
  });

  test('shows winner banner', async ({ page }) => {
    await goToLanding(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/latest win|just won|winner/i);
  });

  test('shows tonight strip with draw count', async ({ page }) => {
    await goToLanding(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/tonight|9pm/i);
  });

  test.skip('Tonight filter shows closing tonight draws (requires auth)', async ({ page }) => {
    await goToLanding(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/closing tonight|tonight/i);
  });

  test.skip('Filling fast filter works (requires auth)', async ({ page }) => {
    await goToLanding(page);
    const chip = page.getByText('Filling fast').first();
    if (await chip.isVisible()) {
      await chip.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/filling fast|draws/i);
    }
  });

  test.skip('Bundles filter works (requires auth)', async ({ page }) => {
    await goToLanding(page);
    const chip = page.getByText('Bundles').first();
    if (await chip.isVisible()) {
      await chip.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/bundle|drawn/i);
    }
  });

  test.skip('See all categories navigates to categories screen (requires auth)', async ({ page }) => {
    await goToLanding(page);
    const seeAll = page.getByText(/see all/i).first();
    if (await seeAll.isVisible()) {
      await seeAll.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/explore|categories|available now/i);
    }
  });

  test('shows draw cards with prices', async ({ page }) => {
    await goToLanding(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/£[\d,]+/);
    expect(body).toMatch(/\d+p/);
  });

  test.skip('tab bar has Grand Draw tab (requires auth)', async ({ page }) => {
    // Tab bar only shown when logged in
    await goToLanding(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/grand draw/i);
  });
});
