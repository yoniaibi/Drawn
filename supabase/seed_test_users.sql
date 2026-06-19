-- ============================================================
-- DRAWN — Test User Seed
-- Run AFTER signing up these two accounts in the app:
--   Seller: seller@drawntest.com  / password: TestDraw99!
--   Buyer:  buyer@drawntest.com   / password: TestDraw99!
--
-- Steps:
--   1. Sign up both accounts through the app (or Supabase Dashboard → Auth → Add user)
--   2. Paste each user's UUID below (Dashboard → Auth → Users → click user → copy ID)
--   3. Run this script in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Replace these with the real UUIDs from Supabase Auth ───────────────────
do $$
declare
  seller_id uuid := '00000000-0000-0000-0000-000000000001'; -- REPLACE
  buyer_id  uuid := '00000000-0000-0000-0000-000000000002'; -- REPLACE
begin

-- ── Seller profile ──────────────────────────────────────────────────────────
update public.profiles
set
  handle        = '@sophiestyle',
  avatar_letter = 'S',
  is_seller     = true,
  wallet_balance = 0
where id = seller_id;

-- ── Buyer profile ───────────────────────────────────────────────────────────
update public.profiles
set
  handle        = '@testbuyer',
  avatar_letter = 'T',
  is_seller     = false,
  wallet_balance = 50000  -- £500 in pence, enough to buy tickets
where id = buyer_id;

-- Log the wallet top-up as a transaction so it shows in history
insert into public.wallet_transactions (user_id, amount, type, description)
values (buyer_id, 50000, 'topup', 'Test wallet credit — £500');

-- ── Draws listed by the seller ───────────────────────────────────────────────
insert into public.draws (
  id, title, emoji,
  seller_id, seller_handle, seller_avatar, seller_verified,
  ticket_price, total_tickets, tickets_sold,
  status, retail_value, min_threshold, description, condition, is_bundle, draw_date
) values
  (
    'b0000000-0000-0000-0000-000000000001',
    'Chanel Classic Flap', '👜',
    seller_id, '@sophiestyle', 'S', true,
    25, 2000, 1558,
    'closing_tonight', 240000, 0.6,
    'Midnight black quilted lambskin, gold hardware. Bought 2022, barely used. Full authenticity card included.',
    'like_new', false,
    now() + interval '6 hours'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Jordan 1 Chicago', '👟',
    seller_id, '@sophiestyle', 'S', true,
    10, 3000, 890,
    'open', 28000, 0.6,
    'UK9. Worn twice. Minor creasing on toe box. Original box included.',
    'good', false,
    now() + interval '2 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'Designer Closet Bundle', '👗',
    seller_id, '@sophiestyle', 'S', true,
    40, 4000, 2880,
    'closing_tonight', 450000, 0.6,
    'Clearing out for a fresh start. 4 pieces, all barely worn.',
    'like_new', true,
    now() + interval '5 hours'
  )
on conflict (id) do nothing;

-- Bundle items for draw-003
insert into public.bundle_items (draw_id, emoji, name, retail_value) values
  ('b0000000-0000-0000-0000-000000000003', '👜', 'Chanel Classic Flap', 240000),
  ('b0000000-0000-0000-0000-000000000003', '👠', 'Bottega Veneta Heels', 78000),
  ('b0000000-0000-0000-0000-000000000003', '🕶️', 'Tom Ford Sunglasses', 42000),
  ('b0000000-0000-0000-0000-000000000003', '⌚', 'TAG Heuer Aquaracer', 90000)
on conflict do nothing;

-- ── Ticket purchases by buyer ────────────────────────────────────────────────
-- Buyer has 10 tickets on the Chanel draw and 5 on Jordans
insert into public.tickets (draw_id, user_id, quantity) values
  ('b0000000-0000-0000-0000-000000000001', buyer_id, 10),
  ('b0000000-0000-0000-0000-000000000002', buyer_id, 5)
on conflict do nothing;

-- Matching wallet deductions so transaction history looks real
insert into public.wallet_transactions (user_id, amount, type, description) values
  (buyer_id, -250,  'purchase', '10 tickets · Chanel Classic Flap 👜'),
  (buyer_id, -50,   'purchase', '5 tickets · Jordan 1 Chicago 👟');

-- Update buyer balance to reflect those purchases (50000 - 250 - 50 = 49700)
update public.profiles
set wallet_balance = 49700
where id = buyer_id;

end $$;
