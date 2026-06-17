-- ============================================================
-- DRAWN — Schema additions (run after initial schema.sql)
-- ============================================================

-- Winner fields on draws
alter table public.draws
  add column if not exists winner_user_id uuid references public.profiles on delete set null,
  add column if not exists winner_handle   text,
  add column if not exists completed_at    timestamptz;

-- Atomic wallet increment — prevents race conditions when crediting winner + seller simultaneously
create or replace function public.increment_wallet(uid uuid, amount int)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set wallet_balance = wallet_balance + amount where id = uid;
end;
$$;

-- Policy so the draw engine (service role) can update winner fields
-- (service role bypasses RLS, no policy needed — this is just documentation)

-- ============================================================
-- CRON JOB — runs draw engine at 9pm UTC every night
-- Requires pg_cron + pg_net extensions (both enabled by default on Supabase)
-- Run this once in SQL Editor after deploying the edge function
-- ============================================================

-- Replace YOUR_ANON_KEY with the anon key from Supabase Dashboard → API
-- select cron.schedule(
--   'run-draws-9pm',
--   '0 21 * * *',
--   $$
--   select net.http_post(
--     url     := 'https://eqaltlwngsmomlwbkqzu.supabase.co/functions/v1/run-draws',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer YOUR_ANON_KEY'
--     ),
--     body    := '{}'::jsonb
--   ) as request_id;
--   $$
-- );

-- To verify cron jobs: select * from cron.job;
-- To run manually right now: select net.http_post(url := '...', headers := '...', body := '{}');

-- ============================================================
-- SELLER APPLICATIONS TABLE
-- ============================================================
create table if not exists public.seller_applications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles on delete cascade not null,
  handle      text,
  full_name   text not null,
  instagram   text,
  first_item  text not null,
  status      text not null default 'pending', -- pending | approved | rejected
  created_at  timestamptz not null default now()
);

alter table public.seller_applications enable row level security;

create policy "Users can insert their own applications"
  on public.seller_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can read their own applications"
  on public.seller_applications for select
  using (auth.uid() = user_id);
