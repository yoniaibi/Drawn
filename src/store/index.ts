import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  isSeller: boolean;
  handle: string;
  avatar: string;
  walletBalance: number; // pence
  login: () => void;
  logout: () => void;
  addFunds: (pence: number) => void;
  deductFunds: (pence: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isSeller: false,
  handle: '@you',
  avatar: 'Y',
  walletBalance: 1240,
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),
  addFunds: (pence) => set((s) => ({ walletBalance: s.walletBalance + pence })),
  deductFunds: (pence) => set((s) => ({ walletBalance: s.walletBalance - pence })),
}));
