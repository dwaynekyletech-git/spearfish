-- Updated_at trigger helper and attachments

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach to tables that have updated_at
create trigger trg_users_updated
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger trg_companies_updated
  before update on public.companies
  for each row execute function public.set_updated_at();

create trigger trg_projects_updated
  before update on public.projects
  for each row execute function public.set_updated_at();
