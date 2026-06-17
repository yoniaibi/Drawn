import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://eqaltlwngsmomlwbkqzu.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYWx0bHduZ3Ntb21sd2JrcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MTA2NzUsImV4cCI6MjA5NzI4NjY3NX0.zcwgXht0vKkkQcu3cVHe4v3q5xv-37BV1GFnwXOGBQY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
