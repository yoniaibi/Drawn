export type DrawStatus = 'open' | 'closing_tonight' | 'live' | 'completed' | 'cancelled' | 'pending';
export type ConditionType = 'new' | 'like_new' | 'good' | 'fair';

export type DrawStyle = 'womenswear' | 'menswear' | 'unisex';

export type ItemCategory =
  | 'bags'
  | 'trainers'
  | 'watches'
  | 'streetwear'
  | 'clothing'
  | 'jewellery'
  | 'accessories'
  | 'bundles'
  | 'vintage';

export const STYLE_LABELS: Record<DrawStyle, string> = {
  womenswear: 'Womenswear & accessories',
  menswear: 'Menswear & streetwear',
  unisex: 'Unisex & everything else',
};

export const STYLE_SHORT: Record<DrawStyle, string> = {
  womenswear: 'Womenswear',
  menswear: 'Menswear',
  unisex: 'Unisex',
};

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  bags: 'Bags',
  trainers: 'Trainers',
  watches: 'Watches',
  streetwear: 'Streetwear',
  clothing: 'Clothing',
  jewellery: 'Jewellery',
  accessories: 'Accessories',
  bundles: 'Wardrobe bundles',
  vintage: 'Vintage',
};

export interface Draw {
  id: string;
  title: string;
  seller: string;
  sellerAvatar: string;
  image?: string;
  retailValue: number;
  ticketPrice: number; // pence
  totalTickets: number;
  ticketsSold: number;
  minThreshold: number;
  status: DrawStatus;
  condition: ConditionType;
  description: string;
  isBundle: boolean;
  emoji?: string;
  style: DrawStyle;
  category: ItemCategory;
  bundleItems?: BundleItem[];
  closesAt: string;
  listedAt: string;
  minCloseDate: string;
  postalEntryCount: number;
  myTickets: number;
  verified: boolean;
}

export interface BundleItem {
  image?: string;
  name: string;
  retailValue: number;
}

export interface Notification {
  id: string;
  type: 'win' | 'reminder' | 'threshold' | 'approved' | 'payout';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

function getTonightAt9pm(): string {
  const d = new Date();
  d.setHours(21, 0, 0, 0);
  if (new Date() > d) d.setDate(d.getDate() + 1);
  return d.toISOString();
}

function getTomorrowAt9pm(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(21, 0, 0, 0);
  return d.toISOString();
}

function getCloseDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(21, 0, 0, 0);
  return d.toISOString();
}

function getListedDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

export const MOCK_DRAWS: Draw[] = [
  {
    id: 'draw-001',
    title: 'Chanel Classic Flap',
    seller: '@sophiestyle',
    sellerAvatar: 'S',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
    retailValue: 2400,
    ticketPrice: 25,
    totalTickets: 1800,
    ticketsSold: 1614,
    minThreshold: 0.6,
    status: 'closing_tonight',
    condition: 'like_new',
    description: 'Midnight black quilted lambskin, gold hardware. Purchased 2022, worn fewer than 5 times. Full authenticity card, dust bag, and original box included.',
    isBundle: false,
    style: 'womenswear',
    category: 'bags',
    closesAt: getCloseDate(9),
    listedAt: getListedDate(5),
    minCloseDate: getCloseDate(2),
    postalEntryCount: 3,
    myTickets: 10,
    verified: true,
  },
  {
    id: 'draw-002',
    title: 'Rolex Submariner',
    seller: '@marcus_t',
    sellerAvatar: 'M',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    retailValue: 8500,
    ticketPrice: 50,
    totalTickets: 850,
    ticketsSold: 823,
    minThreshold: 0.6,
    status: 'closing_tonight',
    condition: 'good',
    description: '41mm, black dial, ceramic bezel. Reference 126610LN. Full set — box, papers, 2019 service record. Minor brushing on bracelet only.',
    isBundle: false,
    style: 'unisex',
    category: 'watches',
    closesAt: getCloseDate(13),
    listedAt: getListedDate(1),
    minCloseDate: getCloseDate(6),
    postalEntryCount: 0,
    myTickets: 5,
    verified: true,
  },
  {
    id: 'draw-003',
    title: 'Designer Closet — 28 pieces',
    seller: '@laurenm',
    sellerAvatar: 'L',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80',
    retailValue: 8600,
    ticketPrice: 40,
    totalTickets: 3200,
    ticketsSold: 2847,
    minThreshold: 0.6,
    status: 'closing_tonight',
    condition: 'like_new',
    description: '28 pieces, all authenticated. Clearing before a move abroad — everything barely worn. Includes bags, shoes, jewellery, and one watch.',
    isBundle: true,
    style: 'womenswear',
    category: 'bundles',
    listedAt: getListedDate(3),
    minCloseDate: getCloseDate(4),
    postalEntryCount: 1,
    bundleItems: [
      { image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80', name: 'Chanel Classic Flap', retailValue: 2400 },
      { image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80', name: 'Bottega Veneta Heels', retailValue: 1800 },
      { image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=400&q=80', name: 'Gucci Sunglasses', retailValue: 380 },
      { image: 'https://images.unsplash.com/photo-1548171915-e79a6a8bfee5?auto=format&fit=crop&w=400&q=80', name: 'Tag Heuer Aquaracer', retailValue: 1200 },
      { image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=400&q=80', name: 'Tiffany & Co Bracelet', retailValue: 620 },
      { image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=400&q=80', name: 'Hermès Beauty Set', retailValue: 340 },
    ],
    closesAt: getCloseDate(11),
    myTickets: 8,
    verified: true,
  },
  {
    id: 'draw-004',
    title: 'MacBook Pro 16"',
    seller: '@tech_drops',
    sellerAvatar: 'T',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    retailValue: 2399,
    ticketPrice: 30,
    totalTickets: 2400,
    ticketsSold: 2118,
    minThreshold: 0.6,
    status: 'closing_tonight',
    condition: 'like_new',
    description: 'M3 Pro chip, 18GB RAM, 512GB SSD. Space Black. Bought March 2024, barely used — upgraded company kit. Original receipt included.',
    isBundle: false,
    style: 'unisex',
    category: 'accessories',
    closesAt: getCloseDate(0),
    listedAt: getListedDate(14),
    minCloseDate: getListedDate(7),
    postalEntryCount: 2,
    myTickets: 0,
    verified: true,
  },
  {
    id: 'draw-005',
    title: 'Jordan 1 Retro High OG',
    seller: '@kicks_leeds',
    sellerAvatar: 'K',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    retailValue: 280,
    ticketPrice: 10,
    totalTickets: 2800,
    ticketsSold: 1743,
    minThreshold: 0.6,
    status: 'open',
    condition: 'good',
    description: 'Chicago colourway. UK9. Worn twice. Minor creasing on toe box. Original box and tissue included.',
    isBundle: false,
    style: 'menswear',
    category: 'trainers',
    closesAt: getCloseDate(9),
    listedAt: getListedDate(5),
    minCloseDate: getCloseDate(2),
    postalEntryCount: 0,
    myTickets: 5,
    verified: true,
  },
  {
    id: 'draw-006',
    title: 'Off-White x Nike Dunk Low',
    seller: '@hype_archive',
    sellerAvatar: 'H',
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=400&q=80',
    retailValue: 950,
    ticketPrice: 15,
    totalTickets: 4500,
    ticketsSold: 1892,
    minThreshold: 0.6,
    status: 'open',
    condition: 'new',
    description: 'DS. Never worn. UK10. Original box, zip ties, extra laces and accessories. Purchased from Dover Street Market on drop day.',
    isBundle: false,
    style: 'menswear',
    category: 'trainers',
    closesAt: getCloseDate(21),
    listedAt: getListedDate(2),
    minCloseDate: getCloseDate(5),
    postalEntryCount: 0,
    myTickets: 0,
    verified: false,
  },
  {
    id: 'draw-007',
    title: 'Supreme Box Logo Hoodie',
    seller: '@archive_uk',
    sellerAvatar: 'A',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=400&q=80',
    retailValue: 480,
    ticketPrice: 10,
    totalTickets: 1600,
    ticketsSold: 437,
    minThreshold: 0.6,
    status: 'open',
    condition: 'new',
    description: 'FW23 Black. Size L. Never worn — still in original Supreme bag with receipt.',
    isBundle: false,
    style: 'menswear',
    category: 'streetwear',
    closesAt: getCloseDate(30),
    listedAt: getListedDate(1),
    minCloseDate: getCloseDate(6),
    postalEntryCount: 0,
    myTickets: 0,
    verified: false,
  },
  {
    id: 'draw-008',
    title: 'Tag Heuer Aquaracer',
    seller: '@marcus_t',
    sellerAvatar: 'M',
    emoji: '⏱',
    image: 'https://images.unsplash.com/photo-1548171915-e79a6a8bfee5?auto=format&fit=crop&w=400&q=80',
    retailValue: 32000,
    ticketPrice: 50,
    totalTickets: 800,
    ticketsSold: 420,
    minThreshold: 0.6,
    status: 'open',
    condition: 'good',
    description: 'Stainless steel, date window, original box included. Serviced 2024.',
    isBundle: false,
    style: 'unisex',
    category: 'watches',
    closesAt: getCloseDate(11),
    listedAt: getListedDate(3),
    minCloseDate: getCloseDate(4),
    postalEntryCount: 0,
    myTickets: 0,
    verified: true,
  },
  {
    id: 'draw-009',
    title: 'Supreme Box Logo Hoodie — Black L',
    seller: '@jay_99',
    sellerAvatar: 'J',
    emoji: '👕',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=400&q=80',
    retailValue: 45000,
    ticketPrice: 20,
    totalTickets: 2500,
    ticketsSold: 1800,
    minThreshold: 0.6,
    status: 'closing_tonight',
    condition: 'like_new',
    description: 'Size L. Worn once. Washed cold, no shrinkage. No signs of fading.',
    isBundle: false,
    style: 'menswear',
    category: 'streetwear',
    closesAt: getCloseDate(0),
    listedAt: getListedDate(7),
    minCloseDate: getCloseDate(0),
    postalEntryCount: 2,
    myTickets: 0,
    verified: true,
  },
];

export const MOCK_MY_TICKETS = MOCK_DRAWS.filter(d => d.myTickets > 0);

export const MOCK_WINNER = {
  drawId: 'draw-001',
  winnerHandle: '@sophie_k',
  item: 'Chanel Classic Flap',
  image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
  ticketPrice: 25,
  retailValue: 2400,
  sellerEarned: 1008,
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'win',
    title: 'You won! Chanel Flap',
    body: 'You won the draw for 30p. Your item will arrive in 2–3 days.',
    time: 'Just now',
    read: false,
  },
  {
    id: 'n2',
    type: 'reminder',
    title: 'Chanel Flap draw closes tomorrow',
    body: 'Your draw closes tomorrow at 9pm. 1,558 tickets sold so far.',
    time: '9:00am today',
    read: false,
  },
  {
    id: 'n3',
    type: 'threshold',
    title: 'Wardrobe bundle hits 72%',
    body: 'Threshold met. Draw resolves Mon 15 Jul at 9pm if it stays above 60%.',
    time: '2 hours ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'approved',
    title: 'Listing approved',
    body: 'Your Chanel Flap listing is live. It closes Mon 15 Jul at 9pm.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n5',
    type: 'payout',
    title: 'Payout sent — £212',
    body: 'Your payout for the Tag Heuer draw has been sent. Allow 1–2 business days.',
    time: '3 days ago',
    read: true,
  },
];

export const MOCK_WALLET = {
  balance: 2840,
  transactions: [
    { id: 't1', label: 'Topped up', amount: 2000, date: 'Today' },
    { id: 't2', label: '8× Designer Closet tickets', amount: -320, date: 'Today' },
    { id: 't3', label: '10× Chanel Flap tickets', amount: -250, date: 'Today' },
    { id: 't4', label: '5× Rolex Submariner tickets', amount: -250, date: 'Yesterday' },
    { id: 't5', label: 'Topped up', amount: 1000, date: 'Yesterday' },
  ],
};

export const MOCK_SELLER = {
  handle: '@sophiestyle',
  avatar: 'S',
  draws: MOCK_DRAWS.filter(d => d.seller === '@sophiestyle'),
  totalEarned: 2184,
  pendingPayout: 1008,
  status: 'approved' as const,
};

// ── Grand Draw types ───────────────────────────────────────────────────────

export type GrandDrawStatus = 'active' | 'drawing' | 'complete';

export interface GrandDrawPrize {
  title: string;
  emoji: string;
  retailValue: number;
  description: string;
}

export interface GrandDrawWinner {
  handle: string;
  tickets: number;
  ticketPct: number;
}

export interface GrandDraw {
  id: string;
  month: string;
  status: GrandDrawStatus;
  prize: GrandDrawPrize;
  fundTotal: number;
  drawDate: string;
  totalTickets: number;
  myTickets: number;
  myOdds: number;
  winner?: GrandDrawWinner;
}

export interface LoginStreak {
  current: number;
  longest: number;
  shieldAvailable: boolean;
  shieldUsedAt: string | null;
  lastLoginDate: string;
  monthTickets: number;
  totalEarned: number;
}

export interface LoginDay {
  date: string;
  loggedIn: boolean;
  shieldUsed: boolean;
}

// ── Grand Draw mock data ──────────────────────────────────────────────────

export const MOCK_GRAND_DRAW: GrandDraw = {
  id: 'grand-2026-06',
  month: 'June 2026',
  status: 'active',
  prize: {
    title: 'Bottega Veneta Jodie Bag',
    emoji: '👜',
    retailValue: 1650,
    description: 'Sage green intrecciato leather. Brand new, unworn. Full box and dustbag.',
  },
  fundTotal: 1650,
  drawDate: '2026-06-30T21:00:00Z',
  totalTickets: 8420,
  myTickets: 18,
  myOdds: 468,
};

export const MOCK_LOGIN_STREAK: LoginStreak = {
  current: 18,
  longest: 31,
  shieldAvailable: true,
  shieldUsedAt: null,
  lastLoginDate: new Date().toISOString().split('T')[0],
  monthTickets: 18,
  totalEarned: 94,
};

export const MOCK_LOGIN_HISTORY: LoginDay[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toISOString().split('T')[0],
    loggedIn: i !== 12,
    shieldUsed: i === 12,
  };
});

export const MOCK_GRAND_DRAW_COMPLETE: GrandDraw = {
  id: 'grand-2026-05',
  month: 'May 2026',
  status: 'complete',
  prize: {
    title: 'AirPods Max — Midnight',
    emoji: '🎧',
    retailValue: 449,
    description: 'Brand new sealed box.',
  },
  fundTotal: 449,
  drawDate: '2026-05-31T21:00:00Z',
  totalTickets: 5240,
  myTickets: 24,
  myOdds: 218,
  winner: {
    handle: '@m***s',
    tickets: 24,
    ticketPct: 0.46,
  },
};
