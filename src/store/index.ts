import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/database.types';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  // derived — kept as plain values, updated in setters
  isLoggedIn: boolean;
  isSeller: boolean;
  handle: string;
  avatar: string;
  walletBalance: number;
  notifyBeforeClose: boolean;
  // actions
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  addFunds: (pence: number) => void;
  deductFunds: (pence: number) => void;
}

function derived(profile: Profile | null, session: Session | null) {
  return {
    isLoggedIn: !!session,
    isSeller: profile?.is_seller ?? false,
    handle: profile?.handle ?? '@you',
    avatar: profile?.avatar_letter ?? 'Y',
    walletBalance: profile?.wallet_balance ?? 0,
    notifyBeforeClose: (profile as any)?.notify_before_close ?? true,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isLoggedIn: false,
  isSeller: false,
  handle: '@you',
  avatar: 'Y',
  walletBalance: 0,
  notifyBeforeClose: true,

  setSession: (session) =>
    set((s) => ({
      session,
      user: session?.user ?? null,
      loading: false,
      ...derived(s.profile, session),
    })),

  setProfile: (profile) =>
    set((s) => ({
      profile,
      ...derived(profile, s.session),
    })),

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, ...derived(null, null), loading: false });
  },

  refreshProfile: async () => {
    const { user, session } = get();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) set({ profile: data, ...derived(data, session) });
  },

  addFunds: (pence) =>
    set((s) => {
      const profile = s.profile
        ? { ...s.profile, wallet_balance: s.profile.wallet_balance + pence }
        : null;
      return { profile, walletBalance: (s.profile?.wallet_balance ?? 0) + pence };
    }),

  deductFunds: (pence) =>
    set((s) => {
      const profile = s.profile
        ? { ...s.profile, wallet_balance: s.profile.wallet_balance - pence }
        : null;
      return { profile, walletBalance: (s.profile?.wallet_balance ?? 0) - pence };
    }),
}));
