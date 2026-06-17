import { create } from 'zustand';

interface SellerDraft {
  type: 'single' | 'bundle' | null;
  title: string;
  description: string;
  condition: string | null;
  ticketPrice: number; // pence
  totalTickets: number;
  // actions
  clearDraft: () => void;
  setType: (t: 'single' | 'bundle') => void;
  setDetails: (title: string, description: string, condition: string) => void;
  setPricing: (price: number, qty: number) => void;
}

export const useSellerDraft = create<SellerDraft>((set) => ({
  type: null,
  title: '',
  description: '',
  condition: null,
  ticketPrice: 25,
  totalTickets: 2000,

  clearDraft: () =>
    set({ type: null, title: '', description: '', condition: null, ticketPrice: 25, totalTickets: 2000 }),

  setType: (t) => set({ type: t }),

  setDetails: (title, description, condition) => set({ title, description, condition }),

  setPricing: (price, qty) => set({ ticketPrice: price, totalTickets: qty }),
}));
