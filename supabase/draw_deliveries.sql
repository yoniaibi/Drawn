-- Tracks when a winner confirms they have received their item
-- Triggers seller payout release in the workflow
create table if not exists public.draw_deliveries (
  id           uuid primary key default gen_random_uuid(),
  draw_id      uuid not null unique references public.draws(id) on delete cascade,
  winner_handle text,
  confirmed_at timestamptz not null default now()
);

alter table public.draw_deliveries enable row level security;

-- Anyone authenticated can insert (they must be the winner — enforced in app)
create policy "deliveries_insert" on public.draw_deliveries
  for insert with check (auth.uid() is not null);

-- Sellers can read deliveries for their own draws
create policy "deliveries_read" on public.draw_deliveries
  for select using (
    exists (
      select 1 from public.draws
      where draws.id = draw_deliveries.draw_id
        and draws.seller_id = auth.uid()
    )
  );

-- Also add category column to draws if not already present
alter table public.draws add column if not exists category text;
