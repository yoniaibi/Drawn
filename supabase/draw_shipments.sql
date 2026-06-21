-- Tracks when a seller confirms they have shipped to the winner
create table if not exists public.draw_shipments (
  id           uuid primary key default gen_random_uuid(),
  draw_id      uuid not null unique references public.draws(id) on delete cascade,
  seller_id    uuid not null references auth.users(id) on delete cascade,
  winner_handle text,
  marked_at    timestamptz not null default now()
);

alter table public.draw_shipments enable row level security;

-- Sellers can read and insert their own shipments
create policy "shipments_read_own" on public.draw_shipments
  for select using (auth.uid() = seller_id);

create policy "shipments_insert_own" on public.draw_shipments
  for insert with check (auth.uid() = seller_id);
