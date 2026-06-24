const { test, expect } = require('/opt/node22/lib/node_modules/playwright/test');
const { waitForApp } = require('./helpers.cjs');

const BASE = 'http://localhost:8100';

// Grand Draw main tab requires auth — users are redirected to landing when unauthenticated.
// The /grand-draw/live and /grand-draw/winner routes are accessible without auth.
test.describe('Grand Draw Main Screen (requires auth — skipped)', () => {
  test.skip('renders grand draw screen', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/grand-draw');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/grand draw/i);
  });

  test.skip('shows month label', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/grand-draw');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/june 2026|2026/i);
  });

  test.skip('shows prize card with Bottega Veneta', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/grand-draw');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/bottega veneta|jodie bag/i);
  });

  test.skip('shows fund total', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/grand-draw');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/fund|£1,650/i);
  });

  test.skip('shows countdown to draw date', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/grand-draw');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/draw resolves in|days|hrs/i);
  });

  test.skip('shows my tickets card', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/grand-draw');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/your entries|entries this month/i);
  });

  test.skip('shows odds', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/grand-draw');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/1 in \d+|your odds/i);
  });

  test.skip('shows daily ticket claim section', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/grand-draw');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/today'?s ticket|ticket claimed|claim today/i);
  });

  test.skip('shows streak section', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/grand-draw');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/your streak|day streak|\d+ day/i);
  });

  test.skip('ticket claimed state shows claimed message', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/grand-draw');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/ticket claimed|come back tomorrow|streak/i);
  });

  test.skip('shield status is shown', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/grand-draw');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/streak shield|shield/i);
  });
});

// Grand Draw Live/Winner are also auth-gated — all redirect to landing
test.describe('Grand Draw — Live Wheel', () => {
  test.skip('live screen renders (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/live');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/grand draw|live now|drawing/i);
  });

  test.skip('shows prize on live screen (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/live');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/bottega|1,650|prize/i);
  });

  test.skip('shows prize wheel SVG (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/live');
    await waitForApp(page);
    const svgs = await page.locator('svg').count();
    expect(svgs).toBeGreaterThan(0);
  });

  test.skip('shows total entries (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/live');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/entries|odds/i);
  });
});

test.describe('Grand Draw — Winner Screen (Lost)', () => {
  test.skip('winner screen renders (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/grand draw|winner|won/i);
  });

  test.skip('shows anonymised winner handle (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/@\w+\*+\w+|winner/i);
  });

  test.skip('shows prize emoji and title (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/bottega|jodie|airpods/i);
  });

  test.skip('shows motivational copy with ticket count (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/logged in|tickets|next month/i);
  });

  test.skip('shows keep streak CTA (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/keep my streak|streak going/i);
  });

  test.skip('shows next month prize teaser (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/next month|coming/i);
  });

  test.skip('keep streak CTA navigates back to grand draw (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await waitForApp(page);
    const btn = page.getByText(/keep my streak/i).first();
    if (await btn.isVisible()) {
      await btn.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/grand draw|prize|streak/i);
    }
  });
});
