// Web stub — uses localStorage instead of URL polyfill
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqaltlwngsmomlwbkqzu.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYWx0bHduZ3Ntb21sd2JrcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MTA2NzUsImV4cCI6MjA5NzI4NjY3NX0.zcwgXht0vKkkQcu3cVHe4v3q5xv-37BV1GFnwXOGBQY';

const webStorage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: webStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
