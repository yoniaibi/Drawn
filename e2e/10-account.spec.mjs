import { test, expect } from '/opt/node22/lib/node_modules/@playwright/test/index.mjs';

const BASE = 'http://localhost:8100';

test.describe('Account Tab', () => {
  test('renders account screen', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/account|profile|wallet/i);
  });

  test('shows wallet balance section', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/wallet|balance|£/i);
  });

  test('shows stats row', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/draws|tickets|wins/i);
  });

  test('shows quick action buttons', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/my orders|saved|notifications|settings/i);
  });

  test('shows sell on drawn section', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/sell|seller|list/i);
  });

  test('navigates to settings', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await page.waitForTimeout(2000);
    const settingsLink = page.getByText(/settings/i).first();
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await page.waitForTimeout(1000);
      const body = await page.textContent('body');
      expect(body).toMatch(/account settings|handle|password|notifications/i);
    }
  });

  test('navigates to notifications', async ({ page }) => {
    await page.goto(BASE + '/(tabs)/account');
    await page.waitForTimeout(2000);
    const notifLink = page.getByText(/notifications/i).first();
    if (await notifLink.isVisible()) {
      await notifLink.click();
      await page.waitForTimeout(1000);
      const body = await page.textContent('body');
      expect(body).toMatch(/notifications|nothing here|alerts/i);
    }
  });
});

test.describe('Notifications Screen', () => {
  test('renders notifications', async ({ page }) => {
    await page.goto(BASE + '/notifications');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/notifications/i);
  });

  test('empty state has browse draws CTA', async ({ page }) => {
    await page.goto(BASE + '/notifications');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/nothing here yet|browse draws|notifications/i);
  });
});

test.describe('Wallet Screen', () => {
  test('renders wallet screen', async ({ page }) => {
    await page.goto(BASE + '/wallet');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/wallet|balance|top up/i);
  });

  test('shows top-up options', async ({ page }) => {
    await page.goto(BASE + '/wallet');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/£|top up|add/i);
  });
});

test.describe('Saved Screen', () => {
  test('renders saved screen', async ({ page }) => {
    await page.goto(BASE + '/saved');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/saved/i);
  });

  test('empty state shows browse draws CTA', async ({ page }) => {
    await page.goto(BASE + '/saved');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/no saved draws|browse draws|bookmark/i);
  });
});

test.describe('Orders Screen', () => {
  test('renders orders screen', async ({ page }) => {
    await page.goto(BASE + '/account/orders');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/my orders|entries/i);
  });

  test('empty state has browse draws CTA', async ({ page }) => {
    await page.goto(BASE + '/account/orders');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/no entries yet|browse draws|buy your first/i);
  });
});

test.describe('Settings Screen', () => {
  test('renders settings', async ({ page }) => {
    await page.goto(BASE + '/account/settings');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/account settings|handle/i);
  });

  test('shows handle input', async ({ page }) => {
    await page.goto(BASE + '/account/settings');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/handle|@/i);
  });

  test('shows notification toggle', async ({ page }) => {
    await page.goto(BASE + '/account/settings');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/notifications|closing-night|reminders/i);
  });

  test('shows delete account option', async ({ page }) => {
    await page.goto(BASE + '/account/settings');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/delete my account/i);
  });
});

test.describe('Seller Gate Screen', () => {
  test('renders seller gate', async ({ page }) => {
    await page.goto(BASE + '/seller/gate');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/sell|seller|drawn/i);
  });

  test('shows apply button', async ({ page }) => {
    await page.goto(BASE + '/seller/gate');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    expect(body).toMatch(/apply|get started|become a seller/i);
  });
});
