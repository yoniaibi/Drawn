/**
 * Web-specific Supabase compatibility shim — auth via AWS Cognito / Amplify,
 * DB queries return empty so the app falls back to mock data until the REST API
 * backend is deployed. Uses localStorage instead of SecureStore.
 */
import { Amplify } from 'aws-amplify';
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  resetPassword,
  updatePassword,
  fetchAuthSession,
  getCurrentUser,
  fetchUserAttributes,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { apiGet, apiPost, apiPut } from './api';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_AWS_USER_POOL_ID ?? 'YOUR_USER_POOL_ID',
      userPoolClientId: process.env.EXPO_PUBLIC_AWS_USER_POOL_CLIENT_ID ?? 'YOUR_CLIENT_ID',
      signUpVerificationMethod: 'code' as const,
      loginWith: { email: true },
    },
  },
};

Amplify.configure(amplifyConfig);

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email?: string;
  created_at?: string;
}

export interface AuthSession {
  user: AuthUser;
}

async function buildSession(): Promise<AuthSession | null> {
  try {
    const cognitoUser = await getCurrentUser();
    return { user: { id: cognitoUser.userId, email: cognitoUser.signInDetails?.loginId } };
  } catch {
    // Fallback for E2E test mocks — injected via auth-mock.cjs
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('drawn-e2e-session') : null;
      if (raw) {
        const s = JSON.parse(raw);
        if (s?.userId && s?.expiresAt > Math.floor(Date.now() / 1000)) {
          return { user: { id: s.userId, email: s.email } };
        }
      }
    } catch {}
    return null;
  }
}

// ─── Query builder (no-op / REST passthrough) ─────────────────────────────────

type QueryResult = { data: any; error: any };

function makeBuilder(table: string): any {
  const state: Record<string, any> = { table, filters: [], method: 'select', body: null, isSingle: false };

  async function resolve(): Promise<QueryResult> {
    if (!API_URL) return { data: state.isSingle ? null : [], error: null };
    try {
      const params = state.filters.map((f: any) => `${f.col}=${encodeURIComponent(f.val)}`).join('&');
      const path = `/${state.table}${params ? '?' + params : ''}`;
      if (state.method === 'select') {
        const data = await apiGet(path);
        const result = state.isSingle ? (Array.isArray(data) ? data[0] ?? null : data) : (data ?? []);
        return { data: result, error: null };
      }
      if (state.method === 'insert') {
        const data = await apiPost(path, state.body);
        return { data: state.isSingle ? (Array.isArray(data) ? data[0] ?? null : data) : data, error: null };
      }
      if (state.method === 'update' || state.method === 'upsert') {
        const data = await apiPut(path, state.body);
        return { data, error: null };
      }
    } catch {
      // fallthrough
    }
    return { data: state.isSingle ? null : [], error: null };
  }

  const builder: any = {
    select: (_cols?: string) => { state.method = 'select'; return builder; },
    insert: (body: any) => { state.method = 'insert'; state.body = body; return builder; },
    update: (body: any) => { state.method = 'update'; state.body = body; return builder; },
    upsert: (body: any, _opts?: any) => { state.method = 'upsert'; state.body = body; return builder; },
    delete: () => { state.method = 'delete'; return builder; },
    eq: (col: string, val: any) => { state.filters.push({ col, val }); return builder; },
    neq: (_col: string, _val: any) => builder,
    in: (col: string, vals: any[]) => { state.filters.push({ col, val: vals.join(',') }); return builder; },
    not: (_col: string, _op: string, _val: any) => builder,
    order: (_col: string, _opts?: any) => builder,
    limit: (_n: number) => builder,
    maybeSingle: () => { state.isSingle = true; return resolve(); },
    single: () => { state.isSingle = true; return resolve(); },
    then: (onFulfilled: any, onRejected?: any) => resolve().then(onFulfilled, onRejected),
    catch: (onRejected: any) => resolve().catch(onRejected),
  };
  return builder;
}

function makeChannel(_name: string, _opts?: any) {
  const ch: any = {
    on: () => ch,
    subscribe: (_cb?: any) => ch,
    unsubscribe: () => Promise.resolve(),
    track: () => Promise.resolve(),
    presenceState: () => ({}),
  };
  return ch;
}

// ─── Auth shim ────────────────────────────────────────────────────────────────

const auth = {
  getSession: async () => {
    const session = await buildSession();
    return { data: { session }, error: null };
  },

  getUser: async () => {
    try {
      const attrs = await fetchUserAttributes();
      const cognitoUser = await getCurrentUser();
      return { data: { user: { id: cognitoUser.userId, email: attrs.email } }, error: null };
    } catch {
      return { data: { user: null }, error: null };
    }
  },

  onAuthStateChange: (callback: (event: string, session: AuthSession | null) => void) => {
    const cancel = Hub.listen('auth', ({ payload }) => {
      const { event } = payload;
      if (event === 'signedIn') {
        buildSession().then(s => callback('SIGNED_IN', s));
      } else if (event === 'signedOut') {
        callback('SIGNED_OUT', null);
      } else if (event === 'tokenRefresh') {
        buildSession().then(s => callback('TOKEN_REFRESHED', s));
      }
    });
    return { data: { subscription: { unsubscribe: cancel } } };
  },

  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    try {
      await signIn({ username: email, password });
      const session = await buildSession();
      return { data: { session, user: session?.user ?? null }, error: null };
    } catch (e: any) {
      return { data: { session: null, user: null }, error: { message: e.message ?? 'Sign in failed' } };
    }
  },

  signUp: async ({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, any> } }) => {
    try {
      const userAttributes: Record<string, string> = { email };
      if (options?.data?.full_name) userAttributes['name'] = options.data.full_name;
      const result = await signUp({ username: email, password, options: { userAttributes } });
      return { data: result, error: null };
    } catch (e: any) {
      console.error('signUp error:', e);
      const message = typeof e?.message === 'string' && e.message
        ? e.message
        : typeof e?.name === 'string' && e.name
          ? e.name.replace(/([A-Z])/g, ' $1').trim()
          : 'Sign up failed. Please try again.';
      return { data: null, error: { message } };
    }
  },

  signOut: async () => {
    try { await signOut(); } catch {}
  },

  resetPasswordForEmail: async (email: string, _opts?: any) => {
    try {
      await resetPassword({ username: email });
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message ?? 'Reset failed' } };
    }
  },

  updateUser: async ({ password }: { password: string }) => {
    try {
      await updatePassword({ oldPassword: '', newPassword: password });
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message ?? 'Update failed' } };
    }
  },

  verifyOtp: async ({ token_hash, type }: { token_hash: string; type: string }) => {
    try {
      if (type === 'email' || type === 'signup') {
        const [username, code] = token_hash.includes(':')
          ? token_hash.split(':')
          : ['', token_hash];
        await confirmSignUp({ username, confirmationCode: code });
      }
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message ?? 'Verification failed' } };
    }
  },

  setSession: async (_opts: { access_token: string; refresh_token: string }) => {
    return { error: null };
  },
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const supabase = {
  auth,
  from: (table: string) => makeBuilder(table),
  channel: makeChannel,
  removeChannel: (_ch: any) => Promise.resolve(),
  rpc: (_fn: string, _args?: Record<string, any>) =>
    Promise.resolve({ data: null as any, error: null as any }),
};
