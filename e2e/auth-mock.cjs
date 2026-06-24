/**
 * Auth mock helpers for Playwright tests.
 *
 * Injects a fake Supabase session by:
 * 1. Intercepting Supabase auth API calls and returning mocked responses
 * 2. Injecting session data into localStorage before navigation
 *
 * This bypasses the auth guard so we can test authenticated screens.
 */

const SUPABASE_URL = 'https://eqaltlwngsmomlwbkqzu.supabase.co';
const STORAGE_KEY = 'sb-eqaltlwngsmomlwbkqzu-auth-token';

// Fake JWT payload (base64url encoded) — not verified server-side since we mock the API
const FAKE_USER_ID = '00000000-0000-0000-0000-000000000001';
const FAKE_EMAIL = 'test@drawn.app';
const FAKE_HANDLE = 'testuser';

function makeJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.fakesignature`;
}

const expiry = Math.floor(Date.now() / 1000) + 3600;
const FAKE_ACCESS_TOKEN = makeJwt({
  sub: FAKE_USER_ID,
  email: FAKE_EMAIL,
  role: 'authenticated',
  exp: expiry,
  iat: Math.floor(Date.now() / 1000),
});
const FAKE_REFRESH_TOKEN = 'fake-refresh-token-for-tests';

const MOCK_USER = {
  id: FAKE_USER_ID,
  email: FAKE_EMAIL,
  role: 'authenticated',
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  email_confirmed_at: '2026-01-01T00:00:00.000Z',
  user_metadata: { handle: FAKE_HANDLE },
  app_metadata: {},
};

const MOCK_SESSION = {
  access_token: FAKE_ACCESS_TOKEN,
  refresh_token: FAKE_REFRESH_TOKEN,
  expires_in: 3600,
  expires_at: expiry,
  token_type: 'bearer',
  user: MOCK_USER,
};

/**
 * Set up auth mocking for a Playwright page.
 * Call this BEFORE page.goto() to intercept Supabase auth requests.
 */
async function setupAuthMock(page) {
  // Mock all Supabase auth endpoints
  await page.route(`${SUPABASE_URL}/auth/v1/**`, async (route, request) => {
    const url = request.url();

    // Token refresh / signin
    if (url.includes('/token')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SESSION),
      });
    }

    // Get current user
    if (url.includes('/user')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_USER),
      });
    }

    // Sign out
    if (url.includes('/logout')) {
      return route.fulfill({ status: 204, body: '' });
    }

    // Default: passthrough (session endpoint etc.)
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { session: MOCK_SESSION, user: MOCK_USER }, error: null }),
    });
  });

  // Mock the Supabase REST API (profiles table etc.)
  await page.route(`${SUPABASE_URL}/rest/v1/**`, async (route, request) => {
    const url = request.url();

    if (url.includes('/profiles')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: FAKE_USER_ID,
          handle: FAKE_HANDLE,
          full_name: 'Test User',
          avatar_url: null,
          bio: null,
          wallet_balance: 1000,
          created_at: '2026-01-01T00:00:00.000Z',
        }]),
      });
    }

    // Other REST calls: return empty array
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Inject session into localStorage so Supabase client picks it up on init
  await page.addInitScript(({ key, session }) => {
    localStorage.setItem(key, JSON.stringify(session));
  }, { key: STORAGE_KEY, session: MOCK_SESSION });
}

/**
 * Navigate to a page with auth mocking active and wait for the app to render.
 */
async function gotoAuthenticated(page, path, waitForApp) {
  await setupAuthMock(page);
  await page.goto(`http://localhost:8100${path}`);
  await waitForApp(page);
}

module.exports = { setupAuthMock, gotoAuthenticated, FAKE_USER_ID, FAKE_EMAIL, FAKE_HANDLE };
