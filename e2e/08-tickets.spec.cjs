const { test, expect } = require('/opt/node22/lib/node_modules/playwright/test');
const { waitForApp } = require('./helpers.cjs');

const BASE = 'http://localhost:8100';

// My Tickets tab requires auth — skipped for unauthenticated test runs
test.describe('My Tickets Tab', () => {
  test.skip('renders tickets screen (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/tickets');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/my tickets/i);
  });

  test.skip('shows summary strip (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/tickets');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/tickets held|could win|draws entered/i);
  });

  test.skip('shows callout bar (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/tickets');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/win|draw|enter/i);
  });

  test.skip('empty state shows browse CTA when no tickets (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/tickets');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/no tickets yet|browse tonight|ticket|draw/i);
  });

  test('landing page shows ticket prices', async ({ page }) => {
    await page.goto(BASE);
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/10p|25p|50p|from 10p/i);
  });

  test('landing page explains how tickets work', async ({ page }) => {
    await page.goto(BASE);
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/buy a ticket|how it works/i);
  });
});
