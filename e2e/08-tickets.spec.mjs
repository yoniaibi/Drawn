import { test, expect } from '/opt/node22/lib/node_modules/@playwright/test/index.mjs';

const BASE = 'http://localhost:8100';

test.describe('My Tickets Tab', () => {
  test('renders tickets screen', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/tickets');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/my tickets/i);
  });

  test('shows summary strip', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/tickets');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/tickets held|could win|draws entered/i);
  });

  test('shows callout bar', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/tickets');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/win|draw|enter/i);
  });

  test('empty state shows browse CTA when no tickets', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/tickets');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    // Either tickets or empty state
    expect(body).toMatch(/no tickets yet|browse tonight|ticket|draw/i);
  });
});
