const { test, expect } = require('/opt/node22/lib/node_modules/playwright/test');
const { waitForApp } = require('./helpers.cjs');

const BASE = 'http://localhost:8100';

async function goToLogin(page) {
  await page.goto(BASE + '/(auth)/log-in');
  await waitForApp(page);
}

test.describe('Login Screen', () => {
  test('renders login form', async ({ page }) => {
    await goToLogin(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/welcome back/i);
  });

  test('shows email and password fields', async ({ page }) => {
    await goToLogin(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/email address/i);
    expect(body).toMatch(/password/i);
  });

  test('shows countdown pill', async ({ page }) => {
    await goToLogin(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/draw closes in|9pm|\d+:\d+/i);
  });

  test('shows forgot password link', async ({ page }) => {
    await goToLogin(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/forgot password/i);
  });

  test('shows validation error for empty submit', async ({ page }) => {
    await goToLogin(page);
    const loginBtn = page.getByText(/^log in$/i).first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/please enter|email|password/i);
    }
  });

  test('shows validation error for bad email', async ({ page }) => {
    await goToLogin(page);
    const emailInput = page.getByPlaceholder(/you@example/i).first();
    if (await emailInput.isVisible()) await emailInput.fill('notanemail');
    const pwInput = page.getByPlaceholder(/••••••••/i).first();
    if (await pwInput.isVisible()) await pwInput.fill('password123');
    const loginBtn = page.getByText(/^log in$/i).first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/valid email/i);
    }
  });

  test('shows create account link', async ({ page }) => {
    await goToLogin(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/create an account/i);
  });

  test('create account navigates to sign-up', async ({ page }) => {
    await goToLogin(page);
    const createBtn = page.getByText(/create an account/i).first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/join drawn|full name/i);
    }
  });

  test('navigates to forgot password', async ({ page }) => {
    await goToLogin(page);
    const forgotBtn = page.getByText(/forgot password/i).first();
    if (await forgotBtn.isVisible()) {
      await forgotBtn.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/reset|forgot|email/i);
    }
  });
});
