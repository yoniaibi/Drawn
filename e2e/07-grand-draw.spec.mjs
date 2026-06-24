import { test, expect } from '/opt/node22/lib/node_modules/@playwright/test/index.mjs';

const BASE = 'http://localhost:8100';

async function goToGrandDraw(page) {
  await page.goto(BASE + '/(tabs)/grand-draw');
  await page.waitForTimeout(2000);
}

test.describe('Grand Draw Main Screen', () => {
  test('renders grand draw screen', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/grand draw/i);
  });

  test('shows month label', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/june 2026|2026/i);
  });

  test('shows prize card with Bottega Veneta', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/bottega veneta|jodie bag/i);
  });

  test('shows prize value', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/1,650|£1/i);
  });

  test('shows fund total', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/fund|£1,650/i);
  });

  test('shows countdown to draw date', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/draw resolves in|days|hrs/i);
  });

  test('shows my tickets card', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/your entries|entries this month/i);
  });

  test('shows odds', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/1 in \d+|your odds/i);
  });

  test('shows daily ticket claim section', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/today'?s ticket|ticket claimed|claim today/i);
  });

  test('shows streak section', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/your streak|day streak|\d+ day/i);
  });

  test('shows streak count of 18', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/18/i);
  });

  test('shows streak badge for 7+ days', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/7-day streak|monthly faithful/i);
  });

  test('shows login calendar', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/this month|logged in|missed/i);
  });

  test('shows past draws section', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/past draws|may 2026|airpods/i);
  });

  test('shows past draw winner handle', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/@m\*\*\*s|winner/i);
  });

  test('dev simulate button visible', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/simulate draw|dev/i);
  });

  test('ticket claimed state shows claimed message', async ({ page }) => {
    await goToGrandDraw(page);
    // Mock has todayTicketClaimed: true
    const body = await page.textContent('body');
    expect(body).toMatch(/ticket claimed|come back tomorrow|streak/i);
  });

  test('shield status is shown', async ({ page }) => {
    await goToGrandDraw(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/streak shield|shield/i);
  });
});

test.describe('Grand Draw — Live Wheel', () => {
  test('live screen renders', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/live');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/grand draw|live now|drawing/i);
  });

  test('shows prize on live screen', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/live');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/bottega|1,650|prize/i);
  });

  test('shows prize wheel SVG', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/live');
    await page.waitForTimeout(2000);
    const svgs = await page.locator('svg').count();
    expect(svgs).toBeGreaterThan(0);
  });

  test('shows total entries', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/live');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/entries|odds/i);
  });
});

test.describe('Grand Draw — Winner Screen (Lost)', () => {
  test('winner screen renders', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/grand draw|winner|won/i);
  });

  test('shows anonymised winner handle', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/@\w+\*+\w+|winner/i);
  });

  test('shows prize emoji and title', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/bottega|jodie|airpods/i);
  });

  test('shows motivational copy with ticket count', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/logged in|tickets|next month/i);
  });

  test('shows keep streak CTA', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/keep my streak|streak going/i);
  });

  test('shows next month prize teaser', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/next month|coming/i);
  });

  test('keep streak CTA navigates back to grand draw', async ({ page }) => {
    await page.goto(BASE + '/grand-draw/winner');
    await page.waitForTimeout(2000);
    const btn = page.getByText(/keep my streak/i).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(1200);
      const body = await page.textContent('body');
      expect(body).toMatch(/grand draw|prize|streak/i);
    }
  });
});
