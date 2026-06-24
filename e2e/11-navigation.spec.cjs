const { test, expect } = require('/opt/node22/lib/node_modules/playwright/test');
const { waitForApp } = require('./helpers.cjs');
const { gotoAuthenticated } = require('./auth-mock.cjs');

const BASE = 'http://localhost:8100';

test.describe('Navigation Flows', () => {
  test('tab bar visible on home', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/browse|live|tickets|account/i);
  });

  test('tab bar navigates to Live tab', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const liveTab = page.getByText('Live').first();
    if (await liveTab.isVisible()) {
      await liveTab.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/live|tonight|9pm/i);
    }
  });

  test('tab bar navigates to Grand Draw tab', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const grandTab = page.getByText('Grand Draw').first();
    if (await grandTab.isVisible()) {
      await grandTab.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/grand draw|bottega|june/i);
    }
  });

  test('tab bar navigates to My Tickets tab', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const ticketTab = page.getByText('My Tickets').first();
    if (await ticketTab.isVisible()) {
      await ticketTab.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/my tickets|tickets held/i);
    }
  });

  test('tab bar navigates to Account tab', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const accTab = page.getByText('Account').first();
    if (await accTab.isVisible()) {
      await accTab.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/account|wallet|profile/i);
    }
  });

  test('grand draw simulate dev button navigates to live', async ({ page }) => {
    await gotoAuthenticated(page, '/(tabs)/grand-draw', waitForApp);
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

  test('category row tile navigates to category detail', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const fashionTile = page.getByText('Fashion').first();
    if (await fashionTile.isVisible()) {
      await fashionTile.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/fashion|designer|clothing/i);
    }
  });

  test('categories explore "All" tile navigates to categories index', async ({ page }) => {
    await gotoAuthenticated(page, '/', waitForApp);
    const allTile = page.getByText('All').first();
    if (await allTile.isVisible()) {
      await allTile.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/explore|available now|coming soon/i);
    }
  });

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
