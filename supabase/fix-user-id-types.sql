-- Migration: Change user_id columns from UUID to TEXT to support Clerk user IDs
-- Clerk uses string IDs like 'user_346tc8awzYJF6Qt9KXcZRrSKXtN', not UUIDs

-- STEP 1: Drop all RLS policies first (they depend on the column types)
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_self" ON public.users;
DROP POLICY IF EXISTS "saved_companies_crud_own" ON public.user_saved_companies;
DROP POLICY IF EXISTS "company_research_crud_own" ON public.company_research;
DROP POLICY IF EXISTS "project_ideas_crud_own" ON public.project_ideas;
DROP POLICY IF EXISTS "projects_crud_own" ON public.projects;
DROP POLICY IF EXISTS "outreach_emails_crud_own" ON public.outreach_emails;
DROP POLICY IF EXISTS "voltagent_exec_crud_own" ON public.voltagent_executions;
DROP POLICY IF EXISTS "clerk_events_read_owner" ON public.clerk_webhook_events;
DROP POLICY IF EXISTS "companies_read_all_auth" ON public.companies;

-- STEP 2: Drop all foreign key constraints that reference user_id
ALTER TABLE public.user_saved_companies DROP CONSTRAINT IF EXISTS user_saved_companies_user_id_fkey;
ALTER TABLE public.company_research DROP CONSTRAINT IF EXISTS company_research_user_id_fkey;
ALTER TABLE public.project_ideas DROP CONSTRAINT IF EXISTS project_ideas_user_id_fkey;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
ALTER TABLE public.outreach_emails DROP CONSTRAINT IF EXISTS outreach_emails_user_id_fkey;
ALTER TABLE public.voltagent_executions DROP CONSTRAINT IF EXISTS voltagent_executions_user_id_fkey;
ALTER TABLE public.clerk_webhook_events DROP CONSTRAINT IF EXISTS clerk_webhook_events_user_id_fkey;

-- STEP 3: Drop the foreign key to auth.users since we're not using Supabase auth
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_user_id_fkey;

-- STEP 4: Change user_id column types from UUID to TEXT
ALTER TABLE public.users ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.user_saved_companies ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.company_research ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.project_ideas ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.projects ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.outreach_emails ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.voltagent_executions ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.clerk_webhook_events ALTER COLUMN user_id TYPE text USING user_id::text;

-- STEP 5: Re-add foreign key constraints (except to auth.users since we're using Clerk)
ALTER TABLE public.user_saved_companies 
  ADD CONSTRAINT user_saved_companies_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.company_research 
  ADD CONSTRAINT company_research_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.project_ideas 
  ADD CONSTRAINT project_ideas_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.projects 
  ADD CONSTRAINT projects_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.outreach_emails 
  ADD CONSTRAINT outreach_emails_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

-- These two tables can have null user_id, so we handle them differently
ALTER TABLE public.voltagent_executions 
  ADD CONSTRAINT voltagent_executions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;

ALTER TABLE public.clerk_webhook_events 
  ADD CONSTRAINT clerk_webhook_events_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;

-- STEP 6: Recreate RLS policies using JWT claims from Clerk
-- The JWT from Clerk should have user_id in the claims

-- For users table
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (
    user_id = (auth.jwt() ->> 'user_id')::text
  );

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (
    user_id = (auth.jwt() ->> 'user_id')::text
  );

CREATE POLICY "users_insert_self" ON public.users
  FOR INSERT WITH CHECK (
    user_id = (auth.jwt() ->> 'user_id')::text
  );

-- For other tables
CREATE POLICY "saved_companies_crud_own" ON public.user_saved_companies
  FOR ALL USING (
    user_id = (auth.jwt() ->> 'user_id')::text
  ) WITH CHECK (
    user_id = (auth.jwt() ->> 'user_id')::text
  );

CREATE POLICY "company_research_crud_own" ON public.company_research
  FOR ALL USING (
    user_id = (auth.jwt() ->> 'user_id')::text
  ) WITH CHECK (
    user_id = (auth.jwt() ->> 'user_id')::text
  );

CREATE POLICY "project_ideas_crud_own" ON public.project_ideas
  FOR ALL USING (
    user_id = (auth.jwt() ->> 'user_id')::text
  ) WITH CHECK (
    user_id = (auth.jwt() ->> 'user_id')::text
  );

CREATE POLICY "projects_crud_own" ON public.projects
  FOR ALL USING (
    user_id = (auth.jwt() ->> 'user_id')::text
  ) WITH CHECK (
    user_id = (auth.jwt() ->> 'user_id')::text
  );

CREATE POLICY "outreach_emails_crud_own" ON public.outreach_emails
  FOR ALL USING (
    user_id = (auth.jwt() ->> 'user_id')::text
  ) WITH CHECK (
    user_id = (auth.jwt() ->> 'user_id')::text
  );

CREATE POLICY "voltagent_exec_crud_own" ON public.voltagent_executions
  FOR ALL USING (
    coalesce(user_id, (auth.jwt() ->> 'user_id')::text) = (auth.jwt() ->> 'user_id')::text
  ) WITH CHECK (
    coalesce(user_id, (auth.jwt() ->> 'user_id')::text) = (auth.jwt() ->> 'user_id')::text
  );

CREATE POLICY "clerk_events_read_owner" ON public.clerk_webhook_events
  FOR SELECT USING (
    user_id IS NULL OR user_id = (auth.jwt() ->> 'user_id')::text
  );

-- Re-add the companies read policy
CREATE POLICY "companies_read_all_auth" ON public.companies
  FOR SELECT TO authenticated USING (true);
