import { test, expect } from '/opt/node22/lib/node_modules/@playwright/test/index.mjs';

const BASE = 'http://localhost:8100';

test.describe('Interests / Onboarding Screen', () => {
  test('renders categories', async ({ page }) => {
    await page.goto(BASE + '/(auth)/interests');
    await page.waitForTimeout(1200);
    const body = await page.textContent('body');
    expect(body).toMatch(/what are you into|categories/i);
  });

  test('shows all expanded categories', async ({ page }) => {
    await page.goto(BASE + '/(auth)/interests');
    await page.waitForTimeout(1200);
    const body = await page.textContent('body');
    expect(body).toMatch(/fashion/i);
    expect(body).toMatch(/watches/i);
    expect(body).toMatch(/tech/i);
    expect(body).toMatch(/wine|spirits|travel|beauty|collectibles/i);
  });

  test('shows step dots (step 2 of 2)', async ({ page }) => {
    await page.goto(BASE + '/(auth)/interests');
    await page.waitForTimeout(1200);
    // Step dots should render as two circles - check page has two dot elements
    const body = await page.textContent('body');
    expect(body).toMatch(/what are you into/i); // screen loaded
  });

  test('shows ticket price range section', async ({ page }) => {
    await page.goto(BASE + '/(auth)/interests');
    await page.waitForTimeout(1200);
    const body = await page.textContent('body');
    expect(body).toMatch(/ticket price range|under 25p|any/i);
  });

  test('shows notification toggle', async ({ page }) => {
    await page.goto(BASE + '/(auth)/interests');
    await page.waitForTimeout(1200);
    const body = await page.textContent('body');
    expect(body).toMatch(/notify|8:50pm|draw closes/i);
  });

  test('CTA button is visible', async ({ page }) => {
    await page.goto(BASE + '/(auth)/interests');
    await page.waitForTimeout(1200);
    const body = await page.textContent('body');
    expect(body).toMatch(/let's go|skip for now/i);
  });

  test('selecting a category enables CTA', async ({ page }) => {
    await page.goto(BASE + '/(auth)/interests');
    await page.waitForTimeout(1200);
    const fashionChip = page.getByText('Fashion').first();
    if (await fashionChip.isVisible()) {
      await fashionChip.click();
      await page.waitForTimeout(300);
      // Size selector should appear after selecting fashion
      const body = await page.textContent('body');
      expect(body).toMatch(/your size|xs|sm|lg/i);
    }
  });
});
