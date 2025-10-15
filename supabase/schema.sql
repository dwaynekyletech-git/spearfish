-- Supabase schema definition for Spearfishin AI
-- Run this SQL in your Supabase project (SQL Editor) or via Supabase CLI migrations

-- Recommended: ensure pgcrypto is available for gen_random_uuid()
create extension if not exists pgcrypto;

-- 1) Users profile table (1-1 with auth.users)
create table if not exists public.users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  job_title text,
  skills text[],
  career_interests text[],
  target_roles text[],
  resume_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Companies catalog (readable by all authenticated users)
-- Schema matches Y Combinator API response structure
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  yc_id integer unique, -- Y Combinator's internal ID
  name text not null,
  slug text,
  former_names text[],
  small_logo_thumb_url text,
  website text,
  all_locations text,
  long_description text,
  one_liner text,
  team_size integer,
  highlight_black boolean default false,
  highlight_latinx boolean default false,
  highlight_women boolean default false,
  industry text,
  subindustry text,
  launched_at bigint, -- Unix timestamp
  tags text[],
  top_company boolean default false,
  is_hiring boolean default false,
  nonprofit boolean default false,
  batch text,
  status text,
  industries text[],
  regions text[],
  stage text,
  app_video_public boolean default false,
  demo_day_video_public boolean default false,
  app_answers jsonb,
  question_answers boolean default false,
  url text, -- YC profile URL
  api text, -- API endpoint
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) User saved companies (bookmarking)
create table if not exists public.user_saved_companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(user_id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, company_id)
);

-- 4) Company research
create table if not exists public.company_research (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(user_id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  business_intel jsonb,
  technical_landscape jsonb,
  key_people jsonb,
  opportunity_signals jsonb,
  pain_points jsonb,
  created_at timestamptz not null default now()
);

-- 5) Project ideas
create table if not exists public.project_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(user_id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  title text not null,
  description text,
  impact_level text,
  technologies text[],
  time_estimate text,
  expected_impact text,
  created_at timestamptz not null default now()
);

-- 6) Projects / Portfolio
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(user_id) on delete cascade,
  title text not null,
  description text,
  status text not null check (status in ('in_progress','completed','pitched')),
  github_url text,
  deployment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7) Outreach emails
create table if not exists public.outreach_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(user_id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  subject text,
  body text,
  tone text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- 8) VoltAgent executions log
create table if not exists public.voltagent_executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(user_id) on delete set null,
  agent_name text not null,
  input jsonb,
  output jsonb,
  success boolean not null default true,
  error text,
  created_at timestamptz not null default now()
);

-- 9) Clerk webhook events
create table if not exists public.clerk_webhook_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(user_id) on delete set null,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  status text
);

-- Indexes
create index if not exists idx_companies_name on public.companies (name);
create index if not exists idx_companies_slug on public.companies (slug);
create index if not exists idx_companies_industry on public.companies (industry);
create index if not exists idx_companies_subindustry on public.companies (subindustry);
create index if not exists idx_companies_tags on public.companies using gin (tags);
create index if not exists idx_companies_industries on public.companies using gin (industries);
create index if not exists idx_companies_regions on public.companies using gin (regions);

create index if not exists idx_saved_companies_user on public.user_saved_companies (user_id);
create index if not exists idx_saved_companies_company on public.user_saved_companies (company_id);

create index if not exists idx_company_research_company on public.company_research (company_id);
create index if not exists idx_company_research_user on public.company_research (user_id);

create index if not exists idx_project_ideas_user on public.project_ideas (user_id);
create index if not exists idx_project_ideas_company on public.project_ideas (company_id);

create index if not exists idx_projects_user on public.projects (user_id);

create index if not exists idx_outreach_emails_user on public.outreach_emails (user_id);
create index if not exists idx_outreach_emails_company on public.outreach_emails (company_id);
create index if not exists idx_outreach_emails_project on public.outreach_emails (project_id);

create index if not exists idx_voltagent_exec_user on public.voltagent_executions (user_id);
