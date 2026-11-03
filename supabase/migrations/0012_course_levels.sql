-- Courses grouped by level ("Nivel 1", "Nivel 2"...). An admin renames, orders,
-- adds and deletes levels; deleting one leaves its courses without a level.
--
-- Existing courses had the level written in their title, like "BONOS (NIVEL 2)":
-- this puts each one in its level and takes that part out of the title.
-- Depends on is_admin() and set_updated_at() from 0003.

create table if not exists public.course_levels (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 80),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.course_levels enable row level security;

drop policy if exists "Signed-in users read levels" on public.course_levels;
create policy "Signed-in users read levels"
  on public.course_levels for select to authenticated
  using (true);

drop policy if exists "Admins manage levels" on public.course_levels;
create policy "Admins manage levels"
  on public.course_levels for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke all on public.course_levels from anon;
grant select, insert, update, delete on public.course_levels to authenticated;

drop trigger if exists course_levels_set_updated_at on public.course_levels;
create trigger course_levels_set_updated_at
  before update on public.course_levels
  for each row execute function public.set_updated_at();

alter table public.courses
  add column if not exists level_id uuid references public.course_levels (id) on delete set null;

create index if not exists courses_level_id_idx on public.courses (level_id);

-- One level for each number found in a title, only the first time this runs.
insert into public.course_levels (title, position)
select 'Nivel ' || found.number, found.number::integer
from (
  select distinct substring(title from '(?i)nivel\s*([0-9]+)') as number
  from public.courses
) as found
where found.number is not null
  and not exists (select 1 from public.course_levels);

update public.courses c
set level_id = l.id
from public.course_levels l
where c.level_id is null
  and l.title = 'Nivel ' || substring(c.title from '(?i)nivel\s*([0-9]+)');

update public.courses
set title = regexp_replace(title, '\s*\(\s*nivel\s*[0-9]+\s*\)\s*$', '', 'i')
where title ~* '\(\s*nivel\s*[0-9]+\s*\)\s*$';
