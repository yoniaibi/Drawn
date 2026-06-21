-- Add user preference columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name           text,
  ADD COLUMN IF NOT EXISTS interests           text[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_sizes     text[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS price_range         text     DEFAULT 'any',
  ADD COLUMN IF NOT EXISTS notify_before_close boolean  DEFAULT true;

-- Allow users to update their own profile preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
