-- RPC for anonymous handle availability check.
-- Returns true if the handle is available (not taken), false otherwise.
-- Using a function avoids exposing profile UUIDs to unauthenticated callers.

create or replace function public.is_handle_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles where handle = lower(candidate)
  );
$$;

-- Allow anon callers to invoke this specific function only
grant execute on function public.is_handle_available(text) to anon, authenticated;
