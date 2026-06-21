// Platform fee: DRAWN takes 15.4%, seller receives 84.6%
export const SELLER_FEE_MULTIPLIER = 0.846;

// Draw thresholds for UI labels
export const DRAW_THRESHOLDS = {
  fillingFast: 0.75,    // 75%+ sold → "Filling fast"
  justListed: 0.15,     // <15% sold → "Just listed"
  highValuePounds: 500, // £500+ retail → "High value"
  scarcityVeryLow: 200, // <200 tickets left
  scarcityLow: 500,     // <500 tickets left
};

// Nightly draw time
export const DRAW_HOUR = 21; // 9pm
export const DRAW_TIME_LABEL = '9pm';

// Ticker/animation intervals (ms)
export const TICKER_ROTATE_MS = 8000;
export const WINNER_ROTATE_MS = 9000;
export const LIVE_HYPE_ROTATE_MS = 3200;

// Wallet
export const TOP_UP_AMOUNTS_PENCE = [500, 1000, 2000, 5000]; // £5, £10, £20, £50

// Seller listing
export const TICKET_PRICE_OPTIONS_PENCE = [10, 25, 50, 100]; // 10p, 25p, 50p, £1
export const TICKET_QUANTITY_OPTIONS = [500, 1000, 2000, 5000];
