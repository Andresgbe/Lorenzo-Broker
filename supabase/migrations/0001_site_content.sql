-- Single JSON blob holding all admin-editable site text.
-- New editable fields are added as keys inside `value` — no migration needed.
create table if not exists public.site_content (
  id text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_content (id, value)
values ('site', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.site_content enable row level security;

-- Visitors need to read the content to render the public site.
create policy "Anyone can read site content"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

-- Only signed-in users (i.e. the admin account) can update it.
create policy "Authenticated users can update site content"
  on public.site_content
  for update
  to authenticated
  using (true)
  with check (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();
