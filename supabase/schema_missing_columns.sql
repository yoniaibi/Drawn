-- ============================================================
-- DRAWN — Missing columns migration
-- Run AFTER schema.sql if you already ran the initial schema.
-- Safe to re-run: uses ADD COLUMN IF NOT EXISTS.
-- ============================================================

-- ── draws: columns referenced in code but missing from schema ───────────────

ALTER TABLE public.draws
  ADD COLUMN IF NOT EXISTS image_url        text,
  ADD COLUMN IF NOT EXISTS category         text,
  ADD COLUMN IF NOT EXISTS winner_user_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS winner_handle    text,
  ADD COLUMN IF NOT EXISTS completed_at     timestamptz;

-- draws.status check must include 'pending' (used during seller listing flow)
ALTER TABLE public.draws
  DROP CONSTRAINT IF EXISTS draws_status_check;
ALTER TABLE public.draws
  ADD CONSTRAINT draws_status_check
    CHECK (status IN ('open','pending','closing_tonight','live','completed','cancelled'));

-- ── bundle_items: image_url referenced in draws.ts mapper ───────────────────

ALTER TABLE public.bundle_items
  ADD COLUMN IF NOT EXISTS image_url text;

-- ── wallet_transactions: 'payout' type used by edge function ────────────────
-- The original check excludes 'payout', which makes the nightly draw engine
-- fail with a constraint violation when it tries to credit sellers.

ALTER TABLE public.wallet_transactions
  DROP CONSTRAINT IF EXISTS wallet_transactions_type_check;
ALTER TABLE public.wallet_transactions
  ADD CONSTRAINT wallet_transactions_type_check
    CHECK (type IN ('topup','purchase','refund','win','payout'));

-- Also update the security_fixes.sql client-insert policy to match:
DROP POLICY IF EXISTS "Users can insert own topups" ON public.wallet_transactions;
CREATE POLICY "Users can insert own topups" ON public.wallet_transactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND type = 'topup'
    AND amount IN (500, 1000, 2000, 5000)
  );

-- ── profiles: columns referenced in store / interests screen ────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name           text,
  ADD COLUMN IF NOT EXISTS interests           text[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_sizes     text[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS price_range         text     DEFAULT 'any',
  ADD COLUMN IF NOT EXISTS notify_before_close boolean  DEFAULT true,
  ADD COLUMN IF NOT EXISTS kyc_submitted       boolean  DEFAULT false,
  ADD COLUMN IF NOT EXISTS seller_verified     boolean  NOT NULL DEFAULT false;

-- Length constraints (drop first so this is safe to re-run)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_fullname_length;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_fullname_length
    CHECK (full_name IS NULL OR char_length(full_name) <= 100);

-- ── handle_new_user: also persist full_name from sign-up metadata ────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, handle, avatar_letter, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'handle', '@user'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_letter', 'U'),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;
