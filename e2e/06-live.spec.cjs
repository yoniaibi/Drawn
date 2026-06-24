const { test, expect } = require('/opt/node22/lib/node_modules/playwright/test');
const { waitForApp } = require('./helpers.cjs');
const { gotoAuthenticated } = require('./auth-mock.cjs');

const BASE = 'http://localhost:8100';

test.describe('Live Draw Tab', () => {
  test('renders live screen', async ({ page }) => {
    await gotoAuthenticated(page, '/(tabs)/live', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/live|tonight|draw/i);
  });

  test('shows countdown to 9pm', async ({ page }) => {
    await gotoAuthenticated(page, '/(tabs)/live', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/9pm|\d+h|\d+ min|closes|next draw/i);
  });

  test('shows tonight\'s draws section or empty state', async ({ page }) => {
    await gotoAuthenticated(page, '/(tabs)/live', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/tonight'?s draws|no draws tonight|draw|9pm/i);
  });

  test('shows hype feed / activity', async ({ page }) => {
    await gotoAuthenticated(page, '/(tabs)/live', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/@\w+|just bought|watching|hype/i);
  });

  test('shows draw or browse CTA', async ({ page }) => {
    await gotoAuthenticated(page, '/(tabs)/live', waitForApp);
    const body = await page.textContent('body');
    expect(body).toMatch(/draw|browse|tonight/i);
  });

  test('shows prize wheel SVG', async ({ page }) => {
    await gotoAuthenticated(page, '/(tabs)/live', waitForApp);
    const svgCount = await page.locator('svg').count();
    expect(svgCount).toBeGreaterThan(0);
  });
});
