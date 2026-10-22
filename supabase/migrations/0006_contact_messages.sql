-- Messages from the public contact page (/contacto): questions, suggestions,
-- payment or access problems. Anyone can send one, signed in or not; only an
-- admin can read, mark or delete them. Depends on public.is_admin() from 0003.
--
-- The browser inserts without reading back (anon has no select), so a visitor
-- never sees other people's messages. CHECKs cap every field; there is no rate
-- limit yet: if spam shows up, move the insert to an Edge Function with one.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or char_length(phone) <= 40),
  topic text not null check (topic in ('duda', 'sugerencia', 'pago_acceso', 'otro')),
  message text not null check (char_length(message) between 10 and 2000),
  -- Filled in when the sender is signed in, so the admin can open their profile.
  user_id uuid default auth.uid() references auth.users (id) on delete set null,
  status text not null default 'nuevo' check (status in ('nuevo', 'respondido', 'archivado')),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone sends a contact message" on public.contact_messages;
create policy "Anyone sends a contact message"
  on public.contact_messages for insert to anon, authenticated
  with check (status = 'nuevo' and (user_id is null or user_id = (select auth.uid())));

drop policy if exists "Admins read contact messages" on public.contact_messages;
create policy "Admins read contact messages"
  on public.contact_messages for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins update contact messages" on public.contact_messages;
create policy "Admins update contact messages"
  on public.contact_messages for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins delete contact messages" on public.contact_messages;
create policy "Admins delete contact messages"
  on public.contact_messages for delete to authenticated
  using ((select public.is_admin()));

-- Senders may only fill the message fields; id, user_id, status and created_at
-- come from the defaults. Admins may only change the status.
revoke all on public.contact_messages from anon, authenticated;
grant insert (name, email, phone, topic, message) on public.contact_messages to anon, authenticated;
grant select, delete on public.contact_messages to authenticated;
grant update (status) on public.contact_messages to authenticated;
