-- Users can watch/save draws to get notifications
CREATE TABLE IF NOT EXISTS public.draw_watches (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  draw_id    uuid NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, draw_id)
);

ALTER TABLE public.draw_watches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own watches"
  ON public.draw_watches FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
