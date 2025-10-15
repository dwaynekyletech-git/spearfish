# Supabase Setup

1) Create a new Supabase project (choose region close to you).
2) In Project Settings → API, copy:
   - Project URL → set VITE_SUPABASE_URL
   - anon public key → set VITE_SUPABASE_ANON_KEY
   - service_role key → set SUPABASE_SERVICE_ROLE_KEY (server-only)

3) Apply SQL (in this order) via SQL Editor or Supabase CLI:
   - supabase/schema.sql
   - supabase/triggers.sql
   - supabase/policies.sql
   - supabase/storage.sql
   - supabase/realtime.sql

Using Supabase CLI (optional):
- brew install supabase/tap/supabase
- supabase login
- supabase link --project-ref <your-ref>
- supabase db push (if you convert these into migrations)

Notes:
- RLS is enabled; clients must be authenticated for most tables.
- Companies table is read-only to clients by default.
- Storage buckets are private; users can only access their own files.
