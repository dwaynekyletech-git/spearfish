-- Storage buckets and policies

-- Create private buckets for resumes and project assets
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', false)
on conflict (id) do nothing;

-- Ensure RLS is enabled for storage.objects (it is by default on Supabase)
-- Policies: only owners can read/write their own files
create policy "resumes_read_own" on storage.objects
  for select to authenticated using (bucket_id = 'resumes' and owner = auth.uid());

create policy "resumes_write_own" on storage.objects
  for insert to authenticated with check (bucket_id = 'resumes' and owner = auth.uid());

create policy "resumes_update_own" on storage.objects
  for update to authenticated using (bucket_id = 'resumes' and owner = auth.uid());

create policy "assets_read_own" on storage.objects
  for select to authenticated using (bucket_id = 'project-assets' and owner = auth.uid());

create policy "assets_write_own" on storage.objects
  for insert to authenticated with check (bucket_id = 'project-assets' and owner = auth.uid());

create policy "assets_update_own" on storage.objects
  for update to authenticated using (bucket_id = 'project-assets' and owner = auth.uid());
