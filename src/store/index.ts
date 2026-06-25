import { create } from 'zustand';
import { supabase, AuthUser, AuthSession } from '../lib/supabase';
import { apiGet, apiPut } from '../lib/api';
import { LoginStreak, GrandDraw, MOCK_LOGIN_STREAK, MOCK_GRAND_DRAW } from '../mocks';

// Local profile type (formerly from database.types)
interface Profile {
  id: string;
  handle: string | null;
  avatar_letter: string | null;
  wallet_balance: number;
  is_seller: boolean;
  seller_verified?: boolean;
  notify_before_close: boolean;
  created_at?: string;
}

interface AuthState {
  session: AuthSession | null;
  user: AuthUser | null;
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
  setSession: (session: AuthSession | null) => void;
  setProfile: (profile: Profile | null) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  addFunds: (pence: number) => void;
  deductFunds: (pence: number) => void;
}

function derived(profile: Profile | null, session: AuthSession | null) {
  return {
    isLoggedIn: !!session,
    isSeller: profile?.is_seller ?? false,
    handle: profile?.handle ?? '@you',
    avatar: profile?.avatar_letter ?? 'Y',
    walletBalance: profile?.wallet_balance ?? 0,
    notifyBeforeClose: profile?.notify_before_close ?? true,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: false,
  isLoggedIn: false,
  isSeller: false,
  handle: '@you',
  avatar: 'Y',
  walletBalance: 0,
  notifyBeforeClose: true,

  setSession: (session) =>
    set((s) => ({
      session,
      user: (session?.user as AuthUser) ?? null,
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
    const data = await apiGet<Profile>(`/profiles/${user.id}`);
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

// ── Grand Draw Store ──────────────────────────────────────────────────────

interface GrandDrawState {
  streak: LoginStreak;
  grandDraw: GrandDraw;
  todayTicketClaimed: boolean;
  claimTodayTicket: () => void;
  useShield: () => void;
  setStatus: (status: GrandDraw['status']) => void;
}

export const useGrandDrawStore = create<GrandDrawState>((set, get) => ({
  streak: MOCK_LOGIN_STREAK,
  grandDraw: MOCK_GRAND_DRAW,
  todayTicketClaimed: true,

  claimTodayTicket: () => {
    const { todayTicketClaimed, streak, grandDraw } = get();
    if (todayTicketClaimed) return;
    set({
      todayTicketClaimed: true,
      streak: {
        ...streak,
        current: streak.current + 1,
        longest: Math.max(streak.longest, streak.current + 1),
        monthTickets: streak.monthTickets + 1,
        totalEarned: streak.totalEarned + 1,
        lastLoginDate: new Date().toISOString().split('T')[0],
      },
      grandDraw: {
        ...grandDraw,
        myTickets: grandDraw.myTickets + 1,
        totalTickets: grandDraw.totalTickets + 1,
        myOdds: Math.round((grandDraw.totalTickets + 1) / (grandDraw.myTickets + 1)),
      },
    });
  },

  useShield: () => {
    const { streak } = get();
    if (!streak.shieldAvailable) return;
    set({
      streak: {
        ...streak,
        shieldAvailable: false,
        shieldUsedAt: new Date().toISOString().split('T')[0],
      },
    });
  },

  setStatus: (status) =>
    set((s) => ({ grandDraw: { ...s.grandDraw, status } })),
}));
