-- ============================================================
-- DRAWN — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- PROFILES (extends auth.users)
create table public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  handle          text not null,
  avatar_letter   text not null default 'D',
  is_seller       boolean not null default false,
  wallet_balance  integer not null default 0, -- pence
  created_at      timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile"  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, handle, avatar_letter)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'handle', '@user'),
    coalesce(new.raw_user_meta_data->>'avatar_letter', 'U')
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- DRAWS
create table public.draws (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  emoji            text not null default '🎁',
  seller_id        uuid references public.profiles on delete cascade not null,
  seller_handle    text not null,
  seller_avatar    text not null default 'S',
  seller_verified  boolean not null default false,
  ticket_price     integer not null, -- pence
  total_tickets    integer not null,
  tickets_sold     integer not null default 0,
  status           text not null default 'open'
                   check (status in ('open','closing_tonight','live','completed','cancelled')),
  retail_value     integer not null, -- pence
  min_threshold    numeric not null default 0.5,
  description      text not null default '',
  condition        text not null default 'good'
                   check (condition in ('new','like_new','good','fair')),
  is_bundle        boolean not null default false,
  draw_date        timestamptz,
  created_at       timestamptz not null default now()
);
alter table public.draws enable row level security;
create policy "Anyone can read draws" on public.draws for select using (true);
create policy "Sellers can insert draws" on public.draws for insert
  with check (auth.uid() = seller_id);
create policy "Sellers can update own draws" on public.draws for update
  using (auth.uid() = seller_id);

-- BUNDLE ITEMS
create table public.bundle_items (
  id           uuid primary key default gen_random_uuid(),
  draw_id      uuid references public.draws on delete cascade not null,
  emoji        text not null,
  name         text not null,
  retail_value integer not null
);
alter table public.bundle_items enable row level security;
create policy "Anyone can read bundle items" on public.bundle_items for select using (true);

-- TICKETS
create table public.tickets (
  id           uuid primary key default gen_random_uuid(),
  draw_id      uuid references public.draws on delete cascade not null,
  user_id      uuid references public.profiles on delete cascade not null,
  quantity     integer not null check (quantity > 0),
  purchased_at timestamptz not null default now()
);
alter table public.tickets enable row level security;
create policy "Users can read own tickets" on public.tickets for select using (auth.uid() = user_id);
create policy "Users can insert own tickets" on public.tickets for insert with check (auth.uid() = user_id);

-- WALLET TRANSACTIONS
create table public.wallet_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles on delete cascade not null,
  amount      integer not null, -- pence; positive = credit, negative = debit
  type        text not null check (type in ('topup','purchase','refund','win')),
  description text not null,
  created_at  timestamptz not null default now()
);
alter table public.wallet_transactions enable row level security;
create policy "Users can read own transactions" on public.wallet_transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.wallet_transactions for insert with check (auth.uid() = user_id);

-- ============================================================
-- SEED — sample draws so the home feed isn't empty
-- Replace '00000000-0000-0000-0000-000000000000' with your real
-- user UUID (find it in Supabase Dashboard → Authentication → Users)
-- after signing up. Safe to re-run: ON CONFLICT DO NOTHING.
-- ============================================================

-- Ensure a placeholder seller profile exists for seeding
insert into public.profiles (id, handle, avatar_letter, is_seller, wallet_balance)
values ('00000000-0000-0000-0000-000000000000', '@seeduser', 'S', true, 0)
on conflict do nothing;

insert into public.draws (
  id, title, emoji,
  seller_id, seller_handle, seller_avatar, seller_verified,
  ticket_price, total_tickets, tickets_sold,
  status, retail_value, min_threshold, description, condition, is_bundle
) values
  (
    'a0000000-0000-0000-0000-000000000001',
    'Chanel Classic Flap', '👜',
    '00000000-0000-0000-0000-000000000000', '@sophiestyle', 'S', true,
    25, 2000, 1558,
    'closing_tonight', 240000, 0.6,
    'Midnight black quilted lambskin, gold hardware. Bought 2022, barely used. Full authenticity card included.',
    'like_new', false
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Jordan 1 Chicago', '👟',
    '00000000-0000-0000-0000-000000000000', '@kicks_leeds', 'K', true,
    10, 3000, 1260,
    'open', 28000, 0.6,
    'UK9. Worn twice. Minor creasing on toe box. Original box included.',
    'good', false
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'Soph''s entire designer closet', '👗',
    '00000000-0000-0000-0000-000000000000', '@sophiestyle', 'S', true,
    40, 4000, 2880,
    'closing_tonight', 320000, 0.6,
    'Clearing out for a fresh start. 28 pieces, all designer, all barely worn.',
    'like_new', true
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'Tag Heuer Aquaracer', '⌚',
    '00000000-0000-0000-0000-000000000000', '@marcus_t', 'M', true,
    50, 1000, 910,
    'closing_tonight', 90000, 0.6,
    'Stainless steel, 41mm, blue dial. Box and papers. Worn for 2 years.',
    'good', false
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    'Off-White x Nike Dunk Low', '👟',
    '00000000-0000-0000-0000-000000000000', '@hype_archive', 'H', false,
    10, 5000, 1800,
    'open', 65000, 0.6,
    'DS. Never worn. UK10. Original box and accessories.',
    'new', false
  )
on conflict do nothing;

-- Bundle items for draw-003 (Soph's designer closet)
insert into public.bundle_items (draw_id, emoji, name, retail_value) values
  ('a0000000-0000-0000-0000-000000000003', '👜', 'Chanel Classic Flap', 240000),
  ('a0000000-0000-0000-0000-000000000003', '👠', 'Bottega Veneta Heels', 38000),
  ('a0000000-0000-0000-0000-000000000003', '🕶️', 'Gucci Horsebit Loafers', 62000),
  ('a0000000-0000-0000-0000-000000000003', '⌚', 'Tag Heuer Aquaracer', 32000)
on conflict do nothing;
