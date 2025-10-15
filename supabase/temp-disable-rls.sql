-- Temporarily disable RLS on users table to allow Clerk sync
-- Run this to test if user sync works without RLS

-- Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Note: This allows anyone with the anon key to read/write to users table
-- Only use this for testing! Re-enable RLS once JWT auth is working

-- To re-enable RLS later, run:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;