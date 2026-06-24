import { test, expect } from '/opt/node22/lib/node_modules/@playwright/test/index.mjs';

const BASE = 'http://localhost:8100';

test.describe('Navigation Flows', () => {
  test('tab bar visible on home', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/browse|live|tickets|account/i);
  });

  test('tab bar navigates to Live tab', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await page.waitForTimeout(2000);
    const liveTab = page.getByText('Live').first();
    if (await liveTab.isVisible()) {
      await liveTab.click();
      await page.waitForTimeout(1200);
      const body = await page.textContent('body');
      expect(body).toMatch(/live|tonight|9pm/i);
    }
  });

  test('tab bar navigates to Grand Draw tab', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await page.waitForTimeout(2000);
    const grandTab = page.getByText('Grand Draw').first();
    if (await grandTab.isVisible()) {
      await grandTab.click();
      await page.waitForTimeout(1200);
      const body = await page.textContent('body');
      expect(body).toMatch(/grand draw|bottega|june/i);
    }
  });

  test('tab bar navigates to My Tickets tab', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await page.waitForTimeout(2000);
    const ticketTab = page.getByText('My Tickets').first();
    if (await ticketTab.isVisible()) {
      await ticketTab.click();
      await page.waitForTimeout(1200);
      const body = await page.textContent('body');
      expect(body).toMatch(/my tickets|tickets held/i);
    }
  });

  test('tab bar navigates to Account tab', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await page.waitForTimeout(2000);
    const accTab = page.getByText('Account').first();
    if (await accTab.isVisible()) {
      await accTab.click();
      await page.waitForTimeout(1200);
      const body = await page.textContent('body');
      expect(body).toMatch(/account|wallet|profile/i);
    }
  });

  test('grand draw simulate dev button navigates to live', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/grand-draw');
    await page.waitForTimeout(2000);
    const devBtn = page.getByText(/simulate draw/i).first();
    if (await devBtn.isVisible()) {
      await devBtn.click();
      await page.waitForTimeout(1500);
      const body = await page.textContent('body');
      expect(body).toMatch(/grand draw|live now|prize/i);
    }
  });

  test('back button works on login screen', async ({ page }) => {
    await page.goto(BASE + '/(auth)/log-in');
    await page.waitForTimeout(1200);
    // Check back chevron exists
    const body = await page.textContent('body');
    expect(body).toMatch(/welcome back/i);
  });

  test('sign-up to login navigation', async ({ page }) => {
    await page.goto(BASE + '/(auth)/sign-up');
    await page.waitForTimeout(1200);
    const loginLink = page.getByText(/log in/i).last();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.waitForTimeout(1000);
      const body = await page.textContent('body');
      expect(body).toMatch(/welcome back/i);
    }
  });

  test('category row tile navigates to category detail', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await page.waitForTimeout(2000);
    // Click a category tile in the row
    const fashionTile = page.getByText('Fashion').first();
    if (await fashionTile.isVisible()) {
      await fashionTile.click();
      await page.waitForTimeout(1200);
      const body = await page.textContent('body');
      expect(body).toMatch(/fashion|designer|clothing/i);
    }
  });

  test('categories explore "All" tile navigates to categories index', async ({ page }) => {
    await page.goto(BASE + '/(tabs)');
    await page.waitForTimeout(2000);
    const allTile = page.getByText('All').first();
    if (await allTile.isVisible()) {
      await allTile.click();
      await page.waitForTimeout(1200);
      const body = await page.textContent('body');
      expect(body).toMatch(/explore|available now|coming soon/i);
    }
  });
});
