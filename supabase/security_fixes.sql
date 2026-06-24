-- ============================================================
-- DRAWN — Security fixes migration
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── 1. draw_deliveries: only the actual winner can confirm delivery ──────────

-- Add winner_user_id column so we can enforce by UUID, not handle string
alter table public.draw_deliveries
  add column if not exists winner_user_id uuid references auth.users(id);

-- Drop the permissive insert policy
drop policy if exists "deliveries_insert" on public.draw_deliveries;

-- Replace with a policy that verifies the inserting user is the draw's winner
create policy "deliveries_insert" on public.draw_deliveries
  for insert with check (
    auth.uid() = winner_user_id
    and exists (
      select 1 from public.draws
      where draws.id = draw_deliveries.draw_id
        and draws.winner_user_id = auth.uid()
    )
  );

-- Also allow winners to read their own delivery confirmations
create policy "deliveries_read_winner" on public.draw_deliveries
  for select using (auth.uid() = winner_user_id);


-- ── 2. profiles: add WITH CHECK to prevent escalating is_seller via UPDATE ──

drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Prevent client from promoting themselves to seller
    and is_seller = (select is_seller from public.profiles where id = auth.uid())
  );


-- ── 3. profiles: enforce unique handle + length constraints ─────────────────

alter table public.profiles
  drop constraint if exists profiles_handle_unique;
alter table public.profiles
  add constraint profiles_handle_unique unique (handle);

alter table public.profiles
  drop constraint if exists profiles_handle_length;
alter table public.profiles
  add constraint profiles_handle_length check (char_length(handle) between 2 and 32);

alter table public.profiles
  drop constraint if exists profiles_fullname_length;
alter table public.profiles
  add constraint profiles_fullname_length
    check (full_name is null or char_length(full_name) <= 100);


-- ── 4. wallet_transactions: restrict topup amounts + type ───────────────────

-- Only service role / edge function should insert non-topup transactions.
-- For topups submitted by the client, enforce allowed amounts.
alter table public.wallet_transactions
  drop constraint if exists wallet_topup_amounts;
alter table public.wallet_transactions
  add constraint wallet_topup_amounts
    check (
      type != 'topup'
      or amount in (500, 1000, 2000, 5000)
    );

-- Restrict client inserts to topup type only (wins/refunds written by service role)
drop policy if exists "Users can insert own transactions" on public.wallet_transactions;

create policy "Users can insert own topups" on public.wallet_transactions
  for insert with check (
    auth.uid() = user_id
    and type = 'topup'
    and amount in (500, 1000, 2000, 5000)
  );


-- ── 5. increment_wallet: revoke public execute (CRITICAL) ───────────────────

-- This SECURITY DEFINER function must not be callable by regular users.
-- Only the service-role client (edge function) should credit wallets.
revoke execute on function public.increment_wallet(uuid, int) from public;
revoke execute on function public.increment_wallet(uuid, int) from anon;
revoke execute on function public.increment_wallet(uuid, int) from authenticated;


-- ── 6. draw_qa: prevent non-sellers marking replies as seller replies ────────

drop policy if exists "draw_qa_insert" on public.draw_qa;

create policy "draw_qa_insert" on public.draw_qa
  for insert with check (
    auth.uid() = user_id
    and (
      is_seller_reply = false
      or exists (
        select 1 from public.draws
        where draws.id = draw_qa.draw_id
          and draws.seller_id = auth.uid()
      )
    )
  );


-- ── 7. draw_qa: create a view that hides internal user_id from public reads ──

create or replace view public.draw_qa_public as
  select id, draw_id, handle, body, is_seller_reply, parent_id, created_at
  from public.draw_qa;

-- Public can read via the view; direct table reads still respect RLS
grant select on public.draw_qa_public to anon, authenticated;


-- ── 8. kyc_submissions: store date_of_birth as date, not text ───────────────

-- Safe migration: add typed column alongside the old text one
alter table public.kyc_submissions
  add column if not exists date_of_birth_typed date;

-- Once data is migrated you can drop the old column:
-- update public.kyc_submissions set date_of_birth_typed = date_of_birth::date where date_of_birth ~ '^\d{4}-\d{2}-\d{2}$';
-- alter table public.kyc_submissions drop column date_of_birth;
-- alter table public.kyc_submissions rename column date_of_birth_typed to date_of_birth;


-- ── 9. draws: ensure winner_user_id column exists for delivery policy ────────

alter table public.draws
  add column if not exists winner_user_id uuid references auth.users(id);
