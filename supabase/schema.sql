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
-- (Replace seller_id with a real UUID after you sign up once)
-- ============================================================
-- insert into public.draws (title, emoji, seller_id, seller_handle, seller_avatar, seller_verified, ticket_price, total_tickets, tickets_sold, status, retail_value, min_threshold, description, condition)
-- values
--   ('Chanel Classic Flap', '👜', '<your-user-id>', '@sophiestyle', 'S', true, 30, 8000, 6240, 'closing_tonight', 240000, 0.5, 'Pristine condition, full set with box and authenticity card.', 'like_new'),
--   ('Air Jordan 1 Chicago', '👟', '<your-user-id>', '@kickseller', 'K', false, 15, 5000, 3100, 'open', 28000, 0.5, 'DS (deadstock), size UK10, original box.', 'new');
