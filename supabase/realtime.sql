-- Configure Realtime publication for live subscriptions
-- Adds key tables to the `supabase_realtime` publication so clients can subscribe.

alter publication supabase_realtime add table
  public.user_saved_companies,
  public.company_research,
  public.project_ideas,
  public.projects,
  public.outreach_emails,
  public.voltagent_executions;