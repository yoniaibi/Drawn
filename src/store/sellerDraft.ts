import { create } from 'zustand';

interface SellerDraft {
  type: 'single' | 'bundle' | null;
  emoji: string;
  title: string;
  description: string;
  condition: string | null;
  retailValue: number; // pence
  ticketPrice: number; // pence
  totalTickets: number;
  // actions
  clearDraft: () => void;
  setType: (t: 'single' | 'bundle') => void;
  setEmoji: (emoji: string) => void;
  setDetails: (title: string, description: string, condition: string) => void;
  setPricing: (price: number, qty: number, retailValue: number) => void;
}

const DEFAULTS = {
  type: null as 'single' | 'bundle' | null,
  emoji: '👜',
  title: '',
  description: '',
  condition: null as string | null,
  retailValue: 0,
  ticketPrice: 25,
  totalTickets: 2000,
};

export const useSellerDraft = create<SellerDraft>((set) => ({
  ...DEFAULTS,

  clearDraft: () => set({ ...DEFAULTS }),

  setType: (t) => set({ type: t, emoji: t === 'bundle' ? '🛍️' : '👜' }),

  setEmoji: (emoji) => set({ emoji }),

  setDetails: (title, description, condition) => set({ title, description, condition }),

  setPricing: (price, qty, retailValue) => set({ ticketPrice: price, totalTickets: qty, retailValue }),
}));
