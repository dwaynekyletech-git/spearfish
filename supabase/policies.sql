-- Row Level Security policies for Spearfishin AI

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.user_saved_companies enable row level security;
alter table public.company_research enable row level security;
alter table public.project_ideas enable row level security;
alter table public.projects enable row level security;
alter table public.outreach_emails enable row level security;
alter table public.voltagent_executions enable row level security;
alter table public.clerk_webhook_events enable row level security;

-- USERS: each user can read/update their own row; allow self-serve insert
create policy "users_select_own" on public.users
  for select using (user_id = auth.uid());

create policy "users_update_own" on public.users
  for update using (user_id = auth.uid());

create policy "users_insert_self" on public.users
  for insert with check (user_id = auth.uid());

-- COMPANIES: readable by any authenticated user; restrict writes by default
create policy "companies_read_all_auth" on public.companies
  for select to authenticated using (true);
-- no insert/update/delete policies => blocked by default

-- Tables with user_id ownership: allow CRUD only for owner
create policy "saved_companies_crud_own" on public.user_saved_companies
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "company_research_crud_own" on public.company_research
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "project_ideas_crud_own" on public.project_ideas
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "projects_crud_own" on public.projects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "outreach_emails_crud_own" on public.outreach_emails
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "voltagent_exec_crud_own" on public.voltagent_executions
  for all using (coalesce(user_id, auth.uid()) = auth.uid()) with check (coalesce(user_id, auth.uid()) = auth.uid());

-- Webhook events: readable to owner (if linked) and service role; restrict writes to service role
create policy "clerk_events_read_owner" on public.clerk_webhook_events
  for select using (user_id is null or user_id = auth.uid());
-- rely on service role for inserts/updates via RLS bypass
