export type DrawStatus = 'open' | 'closing_tonight' | 'live' | 'completed' | 'cancelled';
export type ConditionType = 'new' | 'like_new' | 'good' | 'fair';

export interface Profile {
  id: string;
  handle: string;
  avatar_letter: string;
  is_seller: boolean;
  seller_verified: boolean;
  kyc_submitted: boolean;
  wallet_balance: number; // pence
  notify_before_close: boolean;
  created_at: string;
}

export interface Draw {
  id: string;
  title: string;
  image_url?: string | null;
  seller_id: string;
  seller_handle: string;
  seller_avatar: string;
  seller_verified: boolean;
  ticket_price: number; // pence
  total_tickets: number;
  tickets_sold: number;
  status: DrawStatus | 'pending';
  retail_value: number; // pence
  min_threshold: number; // 0–1
  description: string;
  condition: ConditionType;
  is_bundle: boolean;
  draw_date: string;
  created_at: string;
  winner_user_id?: string | null;
  winner_handle?: string | null;
  completed_at?: string | null;
}

export interface BundleItem {
  id: string;
  draw_id: string;
  image_url?: string | null;
  name: string;
  retail_value: number;
}

export interface Ticket {
  id: string;
  draw_id: string;
  user_id: string;
  quantity: number;
  purchased_at: string;
  draw?: Draw;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number; // pence, positive = credit, negative = debit
  type: 'topup' | 'purchase' | 'refund' | 'win' | 'payout';
  description: string;
  created_at: string;
}
