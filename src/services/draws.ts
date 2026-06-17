import { supabase } from '../lib/supabase';
import {
  Draw as DBDraw,
  BundleItem as DBBundleItem,
  Ticket as DBTicket,
  WalletTransaction as DBWalletTransaction,
} from '../lib/database.types';
import {
  Draw,
  BundleItem,
  MOCK_DRAWS,
  MOCK_MY_TICKETS,
  MOCK_WALLET,
} from '../mocks';

// ─── Mappers ────────────────────────────────────────────────────────────────

export function mapDraw(db: DBDraw, myTickets = 0, bundleItems?: DBBundleItem[]): Draw {
  return {
    id: db.id,
    title: db.title,
    seller: db.seller_handle,
    sellerAvatar: db.seller_avatar,
    emoji: db.emoji,
    retailValue: db.retail_value,
    ticketPrice: db.ticket_price,
    totalTickets: db.total_tickets,
    ticketsSold: db.tickets_sold,
    minThreshold: db.min_threshold,
    status: db.status,
    condition: db.condition,
    description: db.description,
    isBundle: db.is_bundle,
    bundleItems: bundleItems?.map(
      (b): BundleItem => ({ emoji: b.emoji, name: b.name, retailValue: b.retail_value })
    ),
    closesAt: db.draw_date,
    myTickets,
    verified: db.seller_verified,
  };
}

export interface WalletTransaction {
  id: string;
  label: string;
  amount: number; // pence, positive = credit, negative = debit
  date: string;
}

function mapTransaction(db: DBWalletTransaction): WalletTransaction {
  const date = new Date(db.created_at);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const dateLabel = isToday ? 'Today' : isYesterday ? 'Yesterday' : date.toLocaleDateString();
  return {
    id: db.id,
    label: db.description,
    amount: db.amount,
    date: dateLabel,
  };
}

// ─── Service functions ───────────────────────────────────────────────────────

export async function fetchDraws(): Promise<Draw[]> {
  try {
    const { data: draws, error } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !draws || draws.length === 0) return MOCK_DRAWS;

    // Fetch bundle items for bundle draws
    const bundleDrawIds = draws.filter(d => d.is_bundle).map(d => d.id);
    let bundleMap: Record<string, DBBundleItem[]> = {};
    if (bundleDrawIds.length > 0) {
      const { data: items } = await supabase
        .from('bundle_items')
        .select('*')
        .in('draw_id', bundleDrawIds);
      if (items) {
        for (const item of items) {
          if (!bundleMap[item.draw_id]) bundleMap[item.draw_id] = [];
          bundleMap[item.draw_id].push(item);
        }
      }
    }

    return draws.map(d => mapDraw(d, 0, bundleMap[d.id]));
  } catch {
    return MOCK_DRAWS;
  }
}

export async function fetchDrawById(id: string): Promise<Draw | null> {
  try {
    const { data: draw, error } = await supabase
      .from('draws')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !draw) return null;

    let bundleItems: DBBundleItem[] | undefined;
    if (draw.is_bundle) {
      const { data: items } = await supabase
        .from('bundle_items')
        .select('*')
        .eq('draw_id', id);
      bundleItems = items ?? undefined;
    }

    return mapDraw(draw, 0, bundleItems);
  } catch {
    return null;
  }
}

export async function fetchMyTickets(userId: string): Promise<Draw[]> {
  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*, draws(*)')
      .eq('user_id', userId);

    if (error || !tickets || tickets.length === 0) return MOCK_MY_TICKETS;

    // Bundle items for bundle draws
    const bundleDrawIds = tickets
      .filter(t => t.draws && (t.draws as DBDraw).is_bundle)
      .map(t => (t.draws as DBDraw).id);
    let bundleMap: Record<string, DBBundleItem[]> = {};
    if (bundleDrawIds.length > 0) {
      const { data: items } = await supabase
        .from('bundle_items')
        .select('*')
        .in('draw_id', bundleDrawIds);
      if (items) {
        for (const item of items) {
          if (!bundleMap[item.draw_id]) bundleMap[item.draw_id] = [];
          bundleMap[item.draw_id].push(item);
        }
      }
    }

    return tickets
      .filter(t => t.draws != null)
      .map(t => {
        const db = t.draws as DBDraw;
        return mapDraw(db, (t as DBTicket).quantity, bundleMap[db.id]);
      });
  } catch {
    return MOCK_MY_TICKETS;
  }
}

export async function fetchWalletTransactions(userId: string): Promise<WalletTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) return MOCK_WALLET.transactions;

    return data.map(mapTransaction);
  } catch {
    return MOCK_WALLET.transactions;
  }
}
