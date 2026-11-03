-- A lesson can take its video from a different Bunny library than its course's.
-- Null = use the course's library.
alter table public.lessons
  add column if not exists bunny_library_id text
  check (bunny_library_id ~ '^[0-9]+$');
