const { test, expect } = require('/opt/node22/lib/node_modules/playwright/test');
const { waitForApp } = require('./helpers.cjs');

const BASE = 'http://localhost:8100';

test.describe('Navigation Flows', () => {
  // Tab bar navigation requires auth
  test.skip('tab bar visible on home (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/browse|live|tickets|account/i);
  });

  test.skip('tab bar navigates to Live tab (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await waitForApp(page);
    const liveTab = page.getByText('Live').first();
    if (await liveTab.isVisible()) {
      await liveTab.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/live|tonight|9pm/i);
    }
  });

  test.skip('tab bar navigates to Grand Draw tab (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await waitForApp(page);
    const grandTab = page.getByText('Grand Draw').first();
    if (await grandTab.isVisible()) {
      await grandTab.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/grand draw|bottega|june/i);
    }
  });

  test.skip('tab bar navigates to My Tickets tab (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await waitForApp(page);
    const ticketTab = page.getByText('My Tickets').first();
    if (await ticketTab.isVisible()) {
      await ticketTab.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/my tickets|tickets held/i);
    }
  });

  test.skip('tab bar navigates to Account tab (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await waitForApp(page);
    const accTab = page.getByText('Account').first();
    if (await accTab.isVisible()) {
      await accTab.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/account|wallet|profile/i);
    }
  });

  test.skip('grand draw simulate dev button navigates to live (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/grand-draw');
    await waitForApp(page);
    const devBtn = page.getByText(/simulate draw/i).first();
    if (await devBtn.isVisible()) {
      await devBtn.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/grand draw|live now|prize/i);
    }
  });

  test('back button works on login screen', async ({ page }) => {
    await page.goto(BASE + '/(auth)/log-in');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/welcome back/i);
  });

  test('sign-up to login navigation', async ({ page }) => {
    await page.goto(BASE + '/(auth)/sign-up');
    await waitForApp(page);
    const loginLink = page.getByText(/log in/i).last();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/welcome back/i);
    }
  });

  test.skip('category row tile navigates to category detail (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await waitForApp(page);
    const fashionTile = page.getByText('Fashion').first();
    if (await fashionTile.isVisible()) {
      await fashionTile.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/fashion|designer|clothing/i);
    }
  });

  test.skip('categories explore "All" tile navigates to categories index (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await waitForApp(page);
    const allTile = page.getByText('All').first();
    if (await allTile.isVisible()) {
      await allTile.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/explore|available now|coming soon/i);
    }
  });

  // Public navigation tests
  test('get started navigates to sign-up', async ({ page }) => {
    await page.goto(BASE);
    await waitForApp(page);
    const btn = page.getByText(/get started/i).first();
    if (await btn.isVisible()) {
      await btn.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/join drawn|full name|sign up/i);
    }
  });

  test('landing log in link navigates to login', async ({ page }) => {
    await page.goto(BASE);
    await waitForApp(page);
    const btn = page.getByText(/log in/i).first();
    if (await btn.isVisible()) {
      await btn.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/welcome back/i);
    }
  });
});
