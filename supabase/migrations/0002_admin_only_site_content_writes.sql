-- 0001 let any signed-in user update site_content. Since students can now
-- self-register, that would let any student rewrite the public site.
-- Writes now require role=admin in app_metadata, which only the server can set.
drop policy if exists "Authenticated users can update site content" on public.site_content;
drop policy if exists "Admins can update site content" on public.site_content;

create policy "Admins can update site content"
  on public.site_content
  for update
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- Pin the trigger function's search_path (Supabase linter: function_search_path_mutable).
alter function public.set_updated_at() set search_path = '';
