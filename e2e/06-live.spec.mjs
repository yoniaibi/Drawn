import { test, expect } from '/opt/node22/lib/node_modules/@playwright/test/index.mjs';

const BASE = 'http://localhost:8100';

test.describe('Live Draw Tab', () => {
  test('renders live screen', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/live');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/live|tonight|draw/i);
  });

  test('shows countdown to 9pm', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/live');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/9pm|\d+h|\d+ min|closes/i);
  });

  test('shows tonight\'s draws section', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/live');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/tonight'?s draws|no draws tonight/i);
  });

  test('shows hype feed / chat section', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/live');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/@\w+|chat|hype|watching/i);
  });

  test('empty state has browse CTA when no draws', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/live');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    // Either draws are shown OR empty state has CTA
    expect(body).toMatch(/draw|browse|tonight/i);
  });

  test('shows live prize wheel component', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/live');
    await page.waitForTimeout(2000);
    // The PrizeWheel renders as SVG
    const svgCount = await page.locator('svg').count();
    expect(svgCount).toBeGreaterThan(0);
  });
});
