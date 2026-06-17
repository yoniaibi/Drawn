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

export interface WinResult {
  drawId: string;
  drawTitle: string;
  drawEmoji: string;
  retailValue: number;
  completedAt: string;
}

export async function checkForWins(userId: string): Promise<WinResult[]> {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('id, title, emoji, retail_value, completed_at')
      .eq('winner_user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5);

    if (error || !data) return [];

    return data.map(d => ({
      drawId: d.id,
      drawTitle: d.title,
      drawEmoji: d.emoji,
      retailValue: d.retail_value,
      completedAt: d.completed_at ?? '',
    }));
  } catch {
    return [];
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

// ─── Seller ──────────────────────────────────────────────────────────────────

export interface SellerStats {
  totalEarned: number;
  pendingPayout: number;
}

export async function fetchSellerDraws(sellerId: string): Promise<Draw[]> {
  try {
    const { data: draws, error } = await supabase
      .from('draws')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error || !draws || draws.length === 0) return [];

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
    return [];
  }
}

export async function fetchSellerStats(sellerId: string): Promise<SellerStats> {
  try {
    const { data: txns } = await supabase
      .from('wallet_transactions')
      .select('amount, type')
      .eq('user_id', sellerId)
      .eq('type', 'payout');

    const totalEarned = txns?.reduce((sum, t) => sum + t.amount, 0) ?? 0;

    const { data: pendingDraws } = await supabase
      .from('draws')
      .select('tickets_sold, ticket_price')
      .eq('seller_id', sellerId)
      .eq('status', 'completed');

    const pendingPayout = pendingDraws
      ? pendingDraws.reduce((sum, d) => sum + Math.round(d.tickets_sold * d.ticket_price * 0.846), 0) - totalEarned
      : 0;

    return { totalEarned, pendingPayout: Math.max(0, pendingPayout) };
  } catch {
    return { totalEarned: 0, pendingPayout: 0 };
  }
}

// ─── User stats ──────────────────────────────────────────────────────────────

export interface UserStats {
  activeDraws: number;
  totalTickets: number;
  wins: number;
  totalWon: number;
}

export async function fetchUserStats(userId: string): Promise<UserStats> {
  try {
    const [ticketsRes, winsRes] = await Promise.all([
      supabase.from('tickets').select('quantity, draw_id').eq('user_id', userId),
      supabase
        .from('draws')
        .select('retail_value')
        .eq('winner_user_id', userId)
        .eq('status', 'completed'),
    ]);

    const tickets = ticketsRes.data ?? [];
    const wins = winsRes.data ?? [];

    return {
      activeDraws: new Set(tickets.map(t => t.draw_id)).size,
      totalTickets: tickets.reduce((s, t) => s + t.quantity, 0),
      wins: wins.length,
      totalWon: wins.reduce((s, w) => s + w.retail_value, 0),
    };
  } catch {
    return { activeDraws: 0, totalTickets: 0, wins: 0, totalWon: 0 };
  }
}
