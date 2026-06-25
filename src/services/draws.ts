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
} from '../mocks';
import { SELLER_FEE_MULTIPLIER } from '../constants';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchBundleMap(drawIds: string[]): Promise<Record<string, DBBundleItem[]>> {
  if (drawIds.length === 0) return {};
  const { data: items } = await supabase.from('bundle_items').select('*').in('draw_id', drawIds);
  const map: Record<string, DBBundleItem[]> = {};
  for (const item of (items as DBBundleItem[] | null) ?? []) {
    if (!map[item.draw_id]) map[item.draw_id] = [];
    map[item.draw_id].push(item);
  }
  return map;
}

// ─── Mappers ────────────────────────────────────────────────────────────────

export function mapDraw(db: DBDraw, myTickets = 0, bundleItems?: DBBundleItem[]): Draw {
  return {
    id: db.id,
    title: db.title,
    seller: db.seller_handle,
    sellerAvatar: db.seller_avatar,
    image: db.image_url ?? undefined,
    retailValue: Math.round(db.retail_value / 100), // DB stores pence; Draw.retailValue is display-pounds
    ticketPrice: db.ticket_price,
    totalTickets: db.total_tickets,
    ticketsSold: db.tickets_sold,
    minThreshold: db.min_threshold,
    status: db.status,
    condition: db.condition,
    description: db.description,
    isBundle: db.is_bundle,
    style: (db as any).style ?? 'unisex',
    category: (db as any).category ?? 'accessories',
    bundleItems: bundleItems?.map(
      (b): BundleItem => ({ image: b.image_url ?? undefined, name: b.name, retailValue: b.retail_value })
    ),
    closesAt: db.draw_date,
    listedAt: (db as any).listed_at ?? db.draw_date,
    minCloseDate: (() => {
      const d = new Date((db as any).listed_at ?? db.draw_date);
      d.setDate(d.getDate() + 7);
      return d.toISOString();
    })(),
    postalEntryCount: (db as any).postal_entry_count ?? 0,
    myTickets,
    verified: db.seller_verified,
  };
}

export async function fetchDrawsByCategory(slug: string): Promise<Draw[]> {
  try {
    const { data: draws, error } = await supabase
      .from('draws')
      .select('*')
      .eq('category', slug)
      .order('created_at', { ascending: false });

    if (error || !draws || (draws as DBDraw[]).length === 0) return [];
    const typedDraws = draws as DBDraw[];
    const bundleMap = await fetchBundleMap(typedDraws.filter((d: DBDraw) => d.is_bundle).map((d: DBDraw) => d.id));
    return typedDraws.map((d: DBDraw) => mapDraw(d, 0, bundleMap[d.id]));
  } catch {
    return [];
  }
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

    if (error) return [];
    if (!draws || (draws as DBDraw[]).length === 0) return [];
    const typedDraws = draws as DBDraw[];
    const bundleMap = await fetchBundleMap(typedDraws.filter((d: DBDraw) => d.is_bundle).map((d: DBDraw) => d.id));
    return typedDraws.map((d: DBDraw) => mapDraw(d, 0, bundleMap[d.id]));
  } catch {
    return [];
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
    const typedDraw = draw as DBDraw;

    let bundleItems: DBBundleItem[] | undefined;
    if (typedDraw.is_bundle) {
      const { data: items } = await supabase
        .from('bundle_items')
        .select('*')
        .eq('draw_id', id);
      bundleItems = (items as DBBundleItem[]) ?? undefined;
    }

    return mapDraw(typedDraw, 0, bundleItems);
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

    if (error || !tickets) return [];
    const typedTickets = tickets as (DBTicket & { draws: DBDraw | null })[];
    if (typedTickets.length === 0) return [];

    const bundleMap = await fetchBundleMap(
      typedTickets.filter((t) => t.draws && t.draws.is_bundle).map((t) => t.draws!.id)
    );

    return typedTickets
      .filter((t) => t.draws != null)
      .map((t) => {
        const db = t.draws as DBDraw;
        return mapDraw(db, t.quantity, bundleMap[db.id]);
      });
  } catch {
    return [];
  }
}

export interface WinResult {
  drawId: string;
  drawTitle: string;
  drawImage?: string;
  retailValue: number;
  completedAt: string;
}

export async function checkForWins(userId: string): Promise<WinResult[]> {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('id, title, image_url, retail_value, completed_at')
      .eq('winner_user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5);

    if (error || !data) return [];

    return (data as DBDraw[]).map((d: DBDraw) => ({
      drawId: d.id,
      drawTitle: d.title,
      drawImage: d.image_url ?? undefined,
      retailValue: d.retail_value,
      completedAt: d.completed_at ?? '',
    }));
  } catch {
    return [];
  }
}

export interface RecentWinner {
  handle: string;
  item: string;
  emoji: string;
  ticketPrice: number; // pence
  retailValue: number; // display-pounds
}

const FALLBACK_WINNERS: RecentWinner[] = [
  { handle: '@chloe_j', item: 'Chanel Classic Flap', emoji: '👜', ticketPrice: 25, retailValue: 2400 },
  { handle: '@dan.west', item: 'Rolex Submariner', emoji: '⌚', ticketPrice: 50, retailValue: 8500 },
  { handle: '@soph_r', item: 'Designer Closet Bundle', emoji: '👗', ticketPrice: 40, retailValue: 8600 },
  { handle: '@mike_j', item: 'MacBook Pro 16"', emoji: '💻', ticketPrice: 30, retailValue: 2399 },
];

export async function fetchRecentWinners(): Promise<RecentWinner[]> {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('winner_handle, title, emoji, ticket_price, retail_value')
      .eq('status', 'completed')
      .not('winner_handle', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(6);

    if (error || !data || (data as any[]).length === 0) return FALLBACK_WINNERS;

    return (data as any[]).map((d: any) => ({
      handle: d.winner_handle ?? '@winner',
      item: d.title,
      emoji: d.emoji ?? '🎁',
      ticketPrice: d.ticket_price ?? 10,
      retailValue: Math.round((d.retail_value ?? 0) / 100),
    }));
  } catch {
    return FALLBACK_WINNERS;
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

    if (error || !data) return [];

    return (data as DBWalletTransaction[]).map(mapTransaction);
  } catch {
    return [];
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

    if (error || !draws || (draws as DBDraw[]).length === 0) return [];
    const sellerDraws = draws as DBDraw[];
    const bundleMap = await fetchBundleMap(sellerDraws.filter((d: DBDraw) => d.is_bundle).map((d: DBDraw) => d.id));
    return sellerDraws.map((d: DBDraw) => mapDraw(d, 0, bundleMap[d.id]));
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

    const totalEarned = (txns as DBWalletTransaction[] | null)?.reduce((sum: number, t: DBWalletTransaction) => sum + t.amount, 0) ?? 0;

    const { data: pendingDraws } = await supabase
      .from('draws')
      .select('tickets_sold, ticket_price')
      .eq('seller_id', sellerId)
      .eq('status', 'completed');

    const pendingPayout = pendingDraws
      ? (pendingDraws as DBDraw[]).reduce((sum: number, d: DBDraw) => sum + Math.round(d.tickets_sold * d.ticket_price * SELLER_FEE_MULTIPLIER), 0) - totalEarned
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

    const tickets = (ticketsRes.data ?? []) as DBTicket[];
    const wins = (winsRes.data ?? []) as DBDraw[];

    return {
      activeDraws: new Set(tickets.map((t: DBTicket) => t.draw_id)).size,
      totalTickets: tickets.reduce((s: number, t: DBTicket) => s + t.quantity, 0),
      wins: wins.length,
      totalWon: wins.reduce((s: number, w: DBDraw) => s + w.retail_value, 0),
    };
  } catch {
    return { activeDraws: 0, totalTickets: 0, wins: 0, totalWon: 0 };
  }
}
