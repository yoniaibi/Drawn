import { create } from 'zustand';
import type { DrawCategory } from '../constants';

interface SellerDraft {
  category: DrawCategory | null;
  type: 'single' | 'bundle' | null;
  emoji: string;
  images: string[];
  title: string;
  description: string;
  condition: string | null;
  retailValue: number; // pence
  ticketPrice: number; // pence
  totalTickets: number;
  // actions
  clearDraft: () => void;
  setCategory: (c: DrawCategory) => void;
  setType: (t: 'single' | 'bundle') => void;
  setEmoji: (emoji: string) => void;
  setImages: (images: string[]) => void;
  setDetails: (title: string, description: string, condition: string) => void;
  setPricing: (price: number, qty: number, retailValue: number) => void;
}

const DEFAULTS = {
  category: null as DrawCategory | null,
  type: null as 'single' | 'bundle' | null,
  emoji: '👜',
  images: [] as string[],
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

  setCategory: (c) => set({ category: c }),

  setType: (t) => set({ type: t, emoji: t === 'bundle' ? '🛍️' : '👜' }),

  setEmoji: (emoji) => set({ emoji }),

  setImages: (images) => set({ images }),

  setDetails: (title, description, condition) => set({ title, description, condition }),

  setPricing: (price, qty, retailValue) => set({ ticketPrice: price, totalTickets: qty, retailValue }),
}));
