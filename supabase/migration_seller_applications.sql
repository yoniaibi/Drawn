-- ============================================================
-- DRAWN — Seller Applications table
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

create table if not exists public.seller_applications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles on delete cascade not null,
  handle      text not null,
  full_name   text not null,
  instagram   text,
  first_item  text not null,
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'rejected')),
  notes       text, -- internal admin notes
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.seller_applications enable row level security;

-- Users can submit and view their own applications
create policy "Users can insert own application"
  on public.seller_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can read own application"
  on public.seller_applications for select
  using (auth.uid() = user_id);

-- Also add winner columns to draws table if not already there
alter table public.draws
  add column if not exists winner_user_id uuid references public.profiles,
  add column if not exists winner_handle  text,
  add column if not exists completed_at   timestamptz;

-- Draw watches (for notification interest)
create table if not exists public.draw_watches (
  id      uuid primary key default gen_random_uuid(),
  draw_id uuid references public.draws on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(draw_id, user_id)
);

alter table public.draw_watches enable row level security;
create policy "Users can watch draws" on public.draw_watches for insert with check (auth.uid() = user_id);
create policy "Users can unwatch draws" on public.draw_watches for delete using (auth.uid() = user_id);
create policy "Users can read own watches" on public.draw_watches for select using (auth.uid() = user_id);
