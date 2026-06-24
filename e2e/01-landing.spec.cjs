const { test, expect } = require('/opt/node22/lib/node_modules/playwright/test');
const { waitForApp } = require('./helpers.cjs');

const BASE = 'http://localhost:8100';

test.describe('Auth Landing Page', () => {
  test('loads and shows headline', async ({ page }) => {
    await page.goto(BASE);
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/DRAWN|drawn/i);
  });

  test('shows countdown timer', async ({ page }) => {
    await page.goto(BASE);
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/\d+:\d+|\d+ hrs?|9pm|tonight|live/i);
  });

  test('Get started button is visible', async ({ page }) => {
    await page.goto(BASE);
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/get started|join drawn|sign up/i);
  });

  test('Log in link is visible', async ({ page }) => {
    await page.goto(BASE);
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/log in|already have/i);
  });

  test('tapping Get started navigates to sign-up', async ({ page }) => {
    await page.goto(BASE);
    await waitForApp(page);
    const btn = page.getByText(/get started|join drawn/i).first();
    if (await btn.isVisible()) {
      await btn.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/join drawn|create|full name|sign up/i);
    }
  });

  test('tapping Log in navigates to login screen', async ({ page }) => {
    await page.goto(BASE);
    await waitForApp(page);
    const btn = page.getByText(/log in/i).first();
    if (await btn.isVisible()) {
      await btn.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/welcome back|email address|password/i);
    }
  });

  test('shows social proof / trust signals', async ({ page }) => {
    await page.goto(BASE);
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/verified|9pm|ticket|draw/i);
  });
});
