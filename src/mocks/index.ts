export type DrawStatus = 'open' | 'closing_tonight' | 'live' | 'completed' | 'cancelled';
export type ConditionType = 'new' | 'like_new' | 'good' | 'fair';

export interface Draw {
  id: string;
  title: string;
  seller: string;
  sellerAvatar: string;
  emoji: string;
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
  emoji: string;
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
    emoji: '👜',
    retailValue: 2400,
    ticketPrice: 25,
    totalTickets: 2000,
    ticketsSold: 1558,
    minThreshold: 0.6,
    status: 'closing_tonight',
    condition: 'like_new',
    description: 'Midnight black quilted lambskin, gold hardware. Bought 2022, barely used. Full authenticity card included.',
    isBundle: false,
    closesAt: getTonightAt9pm(),
    myTickets: 10,
    verified: true,
  },
  {
    id: 'draw-002',
    title: 'Jordan 1 Chicago',
    seller: '@kicks_leeds',
    sellerAvatar: 'K',
    emoji: '👟',
    retailValue: 280,
    ticketPrice: 10,
    totalTickets: 3000,
    ticketsSold: 1260,
    minThreshold: 0.6,
    status: 'open',
    condition: 'good',
    description: 'UK9. Worn twice. Minor creasing on toe box. Original box included.',
    isBundle: false,
    closesAt: getTomorrowAt9pm(),
    myTickets: 5,
    verified: true,
  },
  {
    id: 'draw-003',
    title: "Soph's entire designer closet",
    seller: '@sophiestyle',
    sellerAvatar: 'S',
    emoji: '👗',
    retailValue: 3200,
    ticketPrice: 40,
    totalTickets: 4000,
    ticketsSold: 2880,
    minThreshold: 0.6,
    status: 'closing_tonight',
    condition: 'like_new',
    description: 'Clearing out for a fresh start. 28 pieces, all designer, all barely worn.',
    isBundle: true,
    bundleItems: [
      { emoji: '👜', name: 'Chanel Classic Flap', retailValue: 2400 },
      { emoji: '👠', name: 'Bottega Veneta Heels', retailValue: 380 },
      { emoji: '🕶️', name: 'Gucci Horsebit Loafers', retailValue: 620 },
      { emoji: '⌚', name: 'Tag Heuer Aquaracer', retailValue: 320 },
    ],
    closesAt: getTonightAt9pm(),
    myTickets: 8,
    verified: true,
  },
  {
    id: 'draw-004',
    title: 'Tag Heuer Aquaracer',
    seller: '@marcus_t',
    sellerAvatar: 'M',
    emoji: '⌚',
    retailValue: 900,
    ticketPrice: 50,
    totalTickets: 1000,
    ticketsSold: 910,
    minThreshold: 0.6,
    status: 'closing_tonight',
    condition: 'good',
    description: 'Stainless steel, 41mm, blue dial. Box and papers. Worn for 2 years.',
    isBundle: false,
    closesAt: getTonightAt9pm(),
    myTickets: 0,
    verified: true,
  },
  {
    id: 'draw-005',
    title: 'Off-White x Nike Dunk Low',
    seller: '@hype_archive',
    sellerAvatar: 'H',
    emoji: '👟',
    retailValue: 650,
    ticketPrice: 10,
    totalTickets: 5000,
    ticketsSold: 1800,
    minThreshold: 0.6,
    status: 'open',
    condition: 'new',
    description: 'DS. Never worn. UK10. Original box and accessories.',
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
  emoji: '👜',
  ticketPrice: 30,
  retailValue: 2400,
  sellerEarned: 476,
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'reminder', title: "Tonight's draw is at 9pm", body: "You're entered in 3 draws closing tonight.", time: '8:50pm', read: false },
  { id: 'n2', type: 'threshold', title: 'Threshold met!', body: 'The Chanel Flap draw will definitely run tonight.', time: '6:12pm', read: false },
  { id: 'n3', type: 'win', title: 'You won!', body: 'You won the Jordan 1 Chicago draw last night.', time: 'Yesterday', read: true },
];

export const MOCK_WALLET = {
  balance: 1240, // pence
  transactions: [
    { id: 't1', label: 'Topped up', amount: 500, date: 'Today' },
    { id: 't2', label: '5× Jordan 1 tickets', amount: -50, date: 'Today' },
    { id: 't3', label: '10× Chanel tickets', amount: -250, date: 'Yesterday' },
  ],
};

export const MOCK_SELLER = {
  handle: '@sophiestyle',
  avatar: 'S',
  draws: MOCK_DRAWS.filter(d => d.seller === '@sophiestyle'),
  totalEarned: 876,
  pendingPayout: 423,
  status: 'approved' as const,
};
