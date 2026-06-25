import { create } from 'zustand';
import type { DrawCategory } from '../constants';
import type { DrawStyle, ItemCategory } from '../mocks';

interface SellerDraft {
  category: DrawCategory | null;
  style: DrawStyle | null;
  itemCategory: ItemCategory | null;
  type: 'single' | 'bundle' | null;
  emoji: string;
  images: string[];
  title: string;
  description: string;
  condition: string | null;
  retailValue: number; // pence
  ticketPrice: number; // pence
  totalTickets: number;
  closeDays: number; // days from listing until draw closes (7–60)
  // actions
  clearDraft: () => void;
  setCategory: (c: DrawCategory) => void;
  setType: (t: 'single' | 'bundle') => void;
  setEmoji: (emoji: string) => void;
  setImages: (images: string[]) => void;
  setDetails: (title: string, description: string, condition: string) => void;
  setPricing: (price: number, qty: number, retailValue: number) => void;
  setCloseDays: (days: number) => void;
  setStyle: (s: DrawStyle) => void;
  setItemCategory: (c: ItemCategory) => void;
}

const DEFAULTS = {
  category: null as DrawCategory | null,
  style: null as DrawStyle | null,
  itemCategory: null as ItemCategory | null,
  type: null as 'single' | 'bundle' | null,
  emoji: '👜',
  images: [] as string[],
  title: '',
  description: '',
  condition: null as string | null,
  retailValue: 0,
  ticketPrice: 25,
  totalTickets: 2000,
  closeDays: 14,
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

  setCloseDays: (days) => set({ closeDays: days }),

  setStyle: (s) => set({ style: s }),
  setItemCategory: (c) => set({ itemCategory: c }),
}));
