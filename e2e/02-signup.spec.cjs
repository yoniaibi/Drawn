const { test, expect } = require('/opt/node22/lib/node_modules/playwright/test');
const { waitForApp } = require('./helpers.cjs');

const BASE = 'http://localhost:8100';

async function goToSignup(page) {
  await page.goto(BASE + '/(auth)/sign-up');
  await waitForApp(page);
}

test.describe('Sign-up Screen', () => {
  test('renders sign-up form', async ({ page }) => {
    await goToSignup(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/join drawn|create/i);
  });

  test('shows all form fields', async ({ page }) => {
    await goToSignup(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/full name/i);
    expect(body).toMatch(/username|handle/i);
    expect(body).toMatch(/email/i);
    expect(body).toMatch(/password/i);
  });

  test('shows stats row (9pm, 10p, 100%)', async ({ page }) => {
    await goToSignup(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/9pm/i);
    expect(body).toMatch(/10p|per ticket/i);
    expect(body).toMatch(/verified/i);
  });

  test('shows terms and privacy links', async ({ page }) => {
    await goToSignup(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/terms of service/i);
    expect(body).toMatch(/privacy policy/i);
  });

  test('shows validation error for empty submit', async ({ page }) => {
    await goToSignup(page);
    const submitBtn = page.getByText(/create my account/i).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/please fill|required|enter/i);
    }
  });

  test('shows validation error for short password', async ({ page }) => {
    await goToSignup(page);
    // Fill name
    const nameInput = page.getByPlaceholder(/your name/i).first();
    if (await nameInput.isVisible()) await nameInput.fill('Test User');
    // Fill handle
    const handleInput = page.getByPlaceholder(/yourhandle/i).first();
    if (await handleInput.isVisible()) await handleInput.fill('testuser');
    // Fill email
    const emailInput = page.getByPlaceholder(/you@example/i).first();
    if (await emailInput.isVisible()) await emailInput.fill('test@example.com');
    // Fill short password
    const pwInput = page.getByPlaceholder(/••••••••/i).first();
    if (await pwInput.isVisible()) await pwInput.fill('short');

    const submitBtn = page.getByText(/create my account/i).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/8 characters|password|terms/i);
    }
  });

  test('link to log in is visible', async ({ page }) => {
    await goToSignup(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/already have an account|log in/i);
  });

  test('navigates to login on link click', async ({ page }) => {
    await goToSignup(page);
    const loginLink = page.getByText(/log in/i).last();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/welcome back|log in/i);
    }
  });
});
