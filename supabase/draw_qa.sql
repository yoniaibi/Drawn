-- Q&A / comments on draws
create table if not exists public.draw_qa (
  id           uuid primary key default gen_random_uuid(),
  draw_id      uuid not null references public.draws(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  handle       text not null,
  body         text not null check (char_length(body) > 0 and char_length(body) <= 500),
  is_seller_reply boolean not null default false,
  parent_id    uuid references public.draw_qa(id) on delete cascade,
  created_at   timestamptz not null default now()
);

create index if not exists draw_qa_draw_id_idx on public.draw_qa(draw_id);
create index if not exists draw_qa_parent_id_idx on public.draw_qa(parent_id);

alter table public.draw_qa enable row level security;

-- Anyone can read Q&A on any draw
create policy "draw_qa_read" on public.draw_qa
  for select using (true);

-- Authenticated users can insert their own Q&A
create policy "draw_qa_insert" on public.draw_qa
  for insert with check (auth.uid() = user_id);

-- Users can delete their own messages
create policy "draw_qa_delete" on public.draw_qa
  for delete using (auth.uid() = user_id);

-- Enable realtime for this table
alter publication supabase_realtime add table public.draw_qa;
