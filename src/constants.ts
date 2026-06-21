// Platform fee: DRAWN takes 15.4%, seller receives 84.6%
export const SELLER_FEE_MULTIPLIER = 0.846;
export const PLATFORM_FEE_PERCENT = 0.12;
export const PROCESSING_FEE_PERCENT = 0.034;

// Max tickets any single buyer can hold (% of total)
export const MAX_TICKETS_PCT = 0.25;

// Draw thresholds for UI labels
export const DRAW_THRESHOLDS = {
  fillingFast: 0.75,
  justListed: 0.15,
  highValuePounds: 500,
  scarcityVeryLow: 200,
  scarcityLow: 500,
};

// Nightly draw time
export const DRAW_HOUR = 21;
export const DRAW_TIME_LABEL = '9pm';

// Ticker/animation intervals (ms)
export const TICKER_ROTATE_MS = 8000;
export const WINNER_ROTATE_MS = 9000;
export const LIVE_HYPE_ROTATE_MS = 3200;

// Wallet
export const TOP_UP_AMOUNTS_PENCE = [500, 1000, 2000, 5000]; // £5, £10, £20, £50

// Default seller listing options (used when no category config overrides)
export const TICKET_PRICE_OPTIONS_PENCE = [10, 25, 50, 100];
export const TICKET_QUANTITY_OPTIONS = [500, 1000, 2000, 5000];

// ── Category system ────────────────────────────────────────────────────────────

export type DrawCategory =
  | 'fashion'
  | 'watches'
  | 'tech'
  | 'art'
  | 'property'
  | 'vehicles';

export interface CategoryMeta {
  id: DrawCategory;
  label: string;
  emoji: string;
  description: string;
  /** Ticket price options in pence */
  ticketPrices: number[];
  /** Total ticket quantity options */
  ticketQuantities: number[];
  /** How custody/transfer works — shown to seller during listing */
  custodyNote: string;
  /** Replaces "Ship item" in the success screen for property/vehicles */
  handoverNote: string;
  /** Whether bundles are supported in this category */
  allowBundle: boolean;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'fashion',
    label: 'Fashion & Accessories',
    emoji: '👜',
    description: 'Bags, clothing, shoes, sunglasses',
    ticketPrices: [10, 25, 50, 100],
    ticketQuantities: [500, 1000, 2000, 5000],
    custodyNote: 'Ship item to us — we verify authenticity and hold it until the draw.',
    handoverNote: 'Ship your item with the prepaid label emailed to you.',
    allowBundle: true,
  },
  {
    id: 'watches',
    label: 'Watches & Jewellery',
    emoji: '⌚',
    description: 'Luxury watches, jewellery, rings',
    ticketPrices: [25, 50, 100, 200],
    ticketQuantities: [500, 1000, 2000, 5000],
    custodyNote: 'Ship item to us — we authenticate it and keep it in our secure vault until the draw.',
    handoverNote: 'Ship your watch or jewellery with our insured prepaid label.',
    allowBundle: false,
  },
  {
    id: 'tech',
    label: 'Tech & Gaming',
    emoji: '📱',
    description: 'Phones, laptops, consoles, gadgets',
    ticketPrices: [10, 25, 50, 100],
    ticketQuantities: [500, 1000, 2000, 5000],
    custodyNote: 'Ship item to us — we test and hold it until the winner is picked.',
    handoverNote: 'Ship your device in its original packaging if possible.',
    allowBundle: true,
  },
  {
    id: 'art',
    label: 'Art & Collectibles',
    emoji: '🖼️',
    description: 'Art, rare collectibles, limited editions',
    ticketPrices: [50, 100, 200, 500],
    ticketQuantities: [500, 1000, 2000, 5000],
    custodyNote: 'Ship artwork or collectible to us — we store it in climate-controlled conditions.',
    handoverNote: "Ship the item carefully packaged. We'll handle certificate of authenticity transfer.",
    allowBundle: false,
  },
  {
    id: 'property',
    label: 'Property',
    emoji: '🏠',
    description: 'Houses, flats, land',
    ticketPrices: [200, 500, 1000, 2500],
    ticketQuantities: [5000, 10000, 25000, 50000],
    custodyNote: 'Title deeds are held by our partner solicitor in escrow until the draw completes.',
    handoverNote: 'Instruct your solicitor to transfer title deeds to our partner firm before the draw goes live.',
    allowBundle: false,
  },
  {
    id: 'vehicles',
    label: 'Cars & Vehicles',
    emoji: '🚗',
    description: 'Cars, motorbikes, boats',
    ticketPrices: [100, 200, 500, 1000],
    ticketQuantities: [2000, 5000, 10000, 25000],
    custodyNote: 'V5 logbook and keys are held in escrow. The vehicle is inspected before the draw.',
    handoverNote: 'Drop the vehicle at our inspection partner. V5 and keys held in escrow until winner.',
    allowBundle: false,
  },
];

export function getCategoryMeta(id: DrawCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
