-- A forum per course: threads, each with replies. Whoever has access to a
-- published course can read and write in it; an admin can read everything and
-- edit, pin, close or delete anything.
--
-- Authors keep their name on each message as a copy (author_name), because
-- students can't read each other's profiles and must never see their emails.
-- The name and the admin flag are set by a trigger, never by the browser.
-- Depends on has_course_access(), is_admin() and set_updated_at() from 0003.

create table public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  author_is_admin boolean not null default false,
  title text not null check (length(trim(title)) between 3 and 160),
  body text not null check (length(trim(body)) between 1 and 5000),
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  reply_count integer not null default 0,
  last_post_at timestamptz not null default now(),
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index forum_threads_course_idx on public.forum_threads (course_id, is_pinned desc, last_post_at desc);

create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  author_is_admin boolean not null default false,
  body text not null check (length(trim(body)) between 1 and 5000),
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index forum_posts_thread_idx on public.forum_posts (thread_id, created_at);

create or replace function public.can_use_course_forum(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.courses c where c.id = p_course_id and c.is_published)
    and public.has_course_access(p_course_id);
$$;

-- ---------------------------------------------------------------- triggers

create or replace function public.forum_set_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.author_id := auth.uid();
  new.author_is_admin := public.is_admin();
  select coalesce(nullif(trim(p.full_name), ''), 'Alumno') into new.author_name
  from public.profiles p where p.id = auth.uid();
  new.author_name := coalesce(new.author_name, 'Alumno');
  return new;
end;
$$;

create trigger forum_threads_set_author before insert on public.forum_threads
  for each row execute function public.forum_set_author();
create trigger forum_posts_set_author before insert on public.forum_posts
  for each row execute function public.forum_set_author();

-- Only an admin pins or closes, and a closed thread can't be edited by its author.
create or replace function public.forum_guard_thread_update()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_content_changed boolean := new.title is distinct from old.title or new.body is distinct from old.body;
begin
  if not public.is_admin() then
    if new.is_pinned is distinct from old.is_pinned or new.is_locked is distinct from old.is_locked then
      raise exception 'Solo un administrador puede fijar o cerrar un hilo' using errcode = '42501';
    end if;
    if v_content_changed and old.is_locked then
      raise exception 'Este hilo está cerrado' using errcode = '42501';
    end if;
  end if;
  if v_content_changed then
    new.edited_at := now();
  end if;
  return new;
end;
$$;

create trigger forum_threads_guard_update before update on public.forum_threads
  for each row execute function public.forum_guard_thread_update();

create or replace function public.forum_guard_post_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not public.is_admin()
     and exists (select 1 from public.forum_threads t where t.id = old.thread_id and t.is_locked) then
    raise exception 'Este hilo está cerrado' using errcode = '42501';
  end if;
  if new.body is distinct from old.body then
    new.edited_at := now();
  end if;
  return new;
end;
$$;

create trigger forum_posts_guard_update before update on public.forum_posts
  for each row execute function public.forum_guard_post_update();

create trigger forum_threads_set_updated_at before update on public.forum_threads
  for each row execute function public.set_updated_at();
create trigger forum_posts_set_updated_at before update on public.forum_posts
  for each row execute function public.set_updated_at();

-- Keeps the reply count and last activity. Definer: a student can't write those columns.
create or replace function public.forum_track_replies()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.forum_threads
    set reply_count = reply_count + 1, last_post_at = now()
    where id = new.thread_id;
    return new;
  end if;
  update public.forum_threads
  set reply_count = greatest(reply_count - 1, 0)
  where id = old.thread_id;
  return old;
end;
$$;

create trigger forum_posts_track_replies after insert or delete on public.forum_posts
  for each row execute function public.forum_track_replies();

-- ---------------------------------------------------------------- access

alter table public.forum_threads enable row level security;
alter table public.forum_posts enable row level security;

create policy "Course members and admins read threads"
  on public.forum_threads for select to authenticated
  using ((select public.is_admin()) or public.can_use_course_forum(course_id));

create policy "Course members and admins open threads"
  on public.forum_threads for insert to authenticated
  with check (author_id = (select auth.uid()) and ((select public.is_admin()) or public.can_use_course_forum(course_id)));

create policy "Authors and admins update threads"
  on public.forum_threads for update to authenticated
  using ((select public.is_admin()) or (author_id = (select auth.uid()) and public.can_use_course_forum(course_id)))
  with check ((select public.is_admin()) or (author_id = (select auth.uid()) and public.can_use_course_forum(course_id)));

-- An author can only delete a thread nobody has answered, so replies don't vanish.
create policy "Admins, and authors of unanswered threads, delete threads"
  on public.forum_threads for delete to authenticated
  using ((select public.is_admin()) or (author_id = (select auth.uid()) and reply_count = 0));

create policy "Course members and admins read replies"
  on public.forum_posts for select to authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.forum_threads t where t.id = thread_id and public.can_use_course_forum(t.course_id))
  );

create policy "Course members and admins reply in open threads"
  on public.forum_posts for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (
      (select public.is_admin())
      or exists (
        select 1 from public.forum_threads t
        where t.id = thread_id and not t.is_locked and public.can_use_course_forum(t.course_id)
      )
    )
  );

create policy "Authors and admins update replies"
  on public.forum_posts for update to authenticated
  using ((select public.is_admin()) or author_id = (select auth.uid()))
  with check ((select public.is_admin()) or author_id = (select auth.uid()));

create policy "Authors and admins delete replies"
  on public.forum_posts for delete to authenticated
  using ((select public.is_admin()) or author_id = (select auth.uid()));

revoke all on public.forum_threads, public.forum_posts from anon, authenticated;
grant select, delete on public.forum_threads, public.forum_posts to authenticated;
grant insert (course_id, title, body) on public.forum_threads to authenticated;
grant update (title, body, is_pinned, is_locked) on public.forum_threads to authenticated;
grant insert (thread_id, body) on public.forum_posts to authenticated;
grant update (body) on public.forum_posts to authenticated;
