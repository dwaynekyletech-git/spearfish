-- Storage buckets and policies

-- Create private buckets for resumes and project assets
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', false)
on conflict (id) do nothing;

-- Ensure RLS is enabled for storage.objects (it is by default on Supabase)
-- NOTE: When using external auth (Clerk), storage.objects.owner is UUID and will not match Clerk string IDs.
-- Use path-based policies: require that object name starts with '<clerk_user_id>/' prefix from the JWT.

-- Resumes: allow only the owner (by path prefix) to read/insert/update
create policy "resumes_read_by_path" on storage.objects
  for select to authenticated using (
    bucket_id = 'resumes'
    and (position((auth.jwt() ->> 'user_id') || '/' in name) = 1 or position((auth.jwt() ->> 'sub') || '/' in name) = 1)
  );

create policy "resumes_insert_by_path" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'resumes'
    and (position((auth.jwt() ->> 'user_id') || '/' in name) = 1 or position((auth.jwt() ->> 'sub') || '/' in name) = 1)
  );

create policy "resumes_update_by_path" on storage.objects
  for update to authenticated using (
    bucket_id = 'resumes'
    and (position((auth.jwt() ->> 'user_id') || '/' in name) = 1 or position((auth.jwt() ->> 'sub') || '/' in name) = 1)
  );

-- Project assets: same path-based strategy
create policy "assets_read_by_path" on storage.objects
  for select to authenticated using (
    bucket_id = 'project-assets'
    and (position((auth.jwt() ->> 'user_id') || '/' in name) = 1 or position((auth.jwt() ->> 'sub') || '/' in name) = 1)
  );

create policy "assets_insert_by_path" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'project-assets'
    and (position((auth.jwt() ->> 'user_id') || '/' in name) = 1 or position((auth.jwt() ->> 'sub') || '/' in name) = 1)
  );

create policy "assets_update_by_path" on storage.objects
  for update to authenticated using (
    bucket_id = 'project-assets'
    and (position((auth.jwt() ->> 'user_id') || '/' in name) = 1 or position((auth.jwt() ->> 'sub') || '/' in name) = 1)
  );
