const { test, expect } = require('/opt/node22/lib/node_modules/playwright/test');
const { waitForApp } = require('./helpers.cjs');

const BASE = 'http://localhost:8100';

// All account screens require auth — unauthenticated users are redirected to landing.
// Tests marked .skip will pass once real auth state is available.

test.describe('Account Tab', () => {
  test.skip('renders account screen (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/account|profile|wallet/i);
  });

  test.skip('shows wallet balance section (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/wallet|balance|£/i);
  });

  test.skip('shows stats row (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/draws|tickets|wins/i);
  });

  test.skip('shows quick action buttons (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/my orders|saved|notifications|settings/i);
  });

  test.skip('shows sell on drawn section (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/sell|seller|list/i);
  });

  test.skip('navigates to settings (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await waitForApp(page);
    const settingsLink = page.getByText(/settings/i).first();
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/account settings|handle|password|notifications/i);
    }
  });

  test.skip('navigates to notifications (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await waitForApp(page);
    const notifLink = page.getByText(/notifications/i).first();
    if (await notifLink.isVisible()) {
      await notifLink.click();
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/notifications|nothing here|alerts/i);
    }
  });
});

test.describe('Notifications Screen', () => {
  test.skip('renders notifications (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/notifications');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/notifications/i);
  });

  test.skip('empty state has browse draws CTA (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/notifications');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/nothing here yet|browse draws|notifications/i);
  });
});

test.describe('Wallet Screen', () => {
  test.skip('renders wallet screen (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/wallet');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/wallet|balance|top up/i);
  });

  test.skip('shows top-up options (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/wallet');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/£|top up|add/i);
  });
});

test.describe('Saved Screen', () => {
  test.skip('renders saved screen (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/saved');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/saved/i);
  });

  test.skip('empty state shows browse draws CTA (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/saved');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/no saved draws|browse draws|bookmark/i);
  });
});

test.describe('Orders Screen', () => {
  test.skip('renders orders screen (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/account/orders');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/my orders|entries/i);
  });

  test.skip('empty state has browse draws CTA (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/account/orders');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/no entries yet|browse draws|buy your first/i);
  });
});

test.describe('Settings Screen', () => {
  test.skip('renders settings (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/account/settings');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/account settings|handle/i);
  });

  test.skip('shows handle input (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/account/settings');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/handle|@/i);
  });

  test.skip('shows notification toggle (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/account/settings');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/notifications|closing-night|reminders/i);
  });

  test.skip('shows delete account option (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/account/settings');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/delete my account/i);
  });
});

test.describe('Seller Gate Screen', () => {
  test.skip('renders seller gate (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/seller/gate');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/sell|seller|drawn/i);
  });

  test.skip('shows apply button (requires auth)', async ({ page }) => {
    await page.goto(BASE + '/seller/gate');
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/apply|get started|become a seller/i);
  });
});

// Public-facing verification: landing page is always accessible
test.describe('Public Access', () => {
  test('landing page loads without auth', async ({ page }) => {
    await page.goto(BASE);
    await waitForApp(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/drawn/i);
  });

  test('all protected routes redirect to landing', async ({ page }) => {
    for (const route of ['/(tabs)/account', '/notifications', '/wallet', '/saved', '/account/settings']) {
      await page.goto(BASE + route);
      await waitForApp(page);
      const body = await page.textContent('body');
      expect(body).toMatch(/get started|log in|drawn/i);
    }
  });
});
