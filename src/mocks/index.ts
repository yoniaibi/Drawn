export type DrawStatus = 'open' | 'closing_tonight' | 'live' | 'completed' | 'cancelled';
export type ConditionType = 'new' | 'like_new' | 'good' | 'fair';

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
  bundleItems?: BundleItem[];
  closesAt: string;
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
    closesAt: getTonightAt9pm(),
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
    closesAt: getTonightAt9pm(),
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
    bundleItems: [
      { image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80', name: 'Chanel Classic Flap', retailValue: 2400 },
      { image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80', name: 'Bottega Veneta Heels', retailValue: 1800 },
      { image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=400&q=80', name: 'Gucci Sunglasses', retailValue: 380 },
      { image: 'https://images.unsplash.com/photo-1548171915-e79a6a8bfee5?auto=format&fit=crop&w=400&q=80', name: 'Tag Heuer Aquaracer', retailValue: 1200 },
      { image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=400&q=80', name: 'Tiffany & Co Bracelet', retailValue: 620 },
      { image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=400&q=80', name: 'Hermès Beauty Set', retailValue: 340 },
    ],
    closesAt: getTonightAt9pm(),
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
    closesAt: getTonightAt9pm(),
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
    closesAt: getTomorrowAt9pm(),
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
    closesAt: getTomorrowAt9pm(),
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
    closesAt: getTomorrowAt9pm(),
    myTickets: 0,
    verified: false,
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
  { id: 'n1', type: 'reminder', title: "Tonight's draw is at 9pm", body: "You're entered in 4 draws closing tonight. Don't miss the reveal.", time: '8:50pm', read: false },
  { id: 'n2', type: 'threshold', title: 'Threshold hit on Chanel Flap!', body: 'That draw is definitely running tonight. You hold 10 tickets.', time: '6:12pm', read: false },
  { id: 'n3', type: 'win', title: '🏆 You won!', body: 'You won the Jordan 1 Chicago draw last night. Delivery in 2–3 days.', time: 'Yesterday', read: true },
  { id: 'n4', type: 'payout', title: 'Payout sent to @sophiestyle', body: '£1,008 sent to her bank within 24h of the draw closing.', time: 'Yesterday', read: true },
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
