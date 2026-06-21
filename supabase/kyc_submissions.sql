-- Run this in Supabase SQL Editor to enable seller KYC verification flow

create table if not exists public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  handle text,
  full_name text not null,
  date_of_birth text not null,
  id_photo_uploaded boolean default false,
  status text not null default 'pending', -- pending | approved | rejected
  reviewed_at timestamptz,
  reviewer_note text,
  submitted_at timestamptz not null default now()
);

alter table public.kyc_submissions enable row level security;

-- Users can only see their own submission
create policy "Users read own KYC" on public.kyc_submissions
  for select using (auth.uid() = user_id);

-- Users can insert once
create policy "Users insert KYC" on public.kyc_submissions
  for insert with check (auth.uid() = user_id);

-- Only service role can update (team approves/rejects via dashboard)
-- No update policy needed for regular users

-- Index for fast user lookup
create index if not exists kyc_submissions_user_id_idx on public.kyc_submissions(user_id);
