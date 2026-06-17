import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/database.types';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  // derived
  isLoggedIn: boolean;
  isSeller: boolean;
  handle: string;
  avatar: string;
  walletBalance: number;
  // actions
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  addFunds: (pence: number) => void;
  deductFunds: (pence: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  get isLoggedIn() { return !!get().session; },
  get isSeller() { return get().profile?.is_seller ?? false; },
  get handle() { return get().profile?.handle ?? '@you'; },
  get avatar() { return get().profile?.avatar_letter ?? 'Y'; },
  get walletBalance() { return get().profile?.wallet_balance ?? 0; },

  setSession: (session) => set({ session, user: session?.user ?? null, loading: false }),

  setProfile: (profile) => set({ profile }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) set({ profile: data });
  },

  addFunds: (pence) =>
    set((s) => ({
      profile: s.profile ? { ...s.profile, wallet_balance: s.profile.wallet_balance + pence } : null,
    })),

  deductFunds: (pence) =>
    set((s) => ({
      profile: s.profile ? { ...s.profile, wallet_balance: s.profile.wallet_balance - pence } : null,
    })),
}));
