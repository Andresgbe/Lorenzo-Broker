-- Each course has its own Bunny Stream video library, so the player needs the
-- library's id together with the lesson's video id. The id is not a secret: it
-- goes in the player's URL. Null = not set yet, and the course's videos don't play.
alter table public.courses
  add column if not exists bunny_library_id text
  check (bunny_library_id ~ '^[0-9]+$');
