-- Re-enable RLS with proper JWT authentication from Clerk

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "users_read_all" ON public.users;
DROP POLICY IF EXISTS "users_insert_all" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_self" ON public.users;

-- Create proper JWT-based policies
-- Users can read their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (
    user_id = COALESCE(
      auth.jwt() ->> 'user_id',  -- From Clerk JWT
      auth.jwt() ->> 'sub'        -- Fallback to sub claim
    )
  );

-- Users can insert their own profile
CREATE POLICY "users_insert_self" ON public.users
  FOR INSERT WITH CHECK (
    user_id = COALESCE(
      auth.jwt() ->> 'user_id',
      auth.jwt() ->> 'sub'
    )
  );

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (
    user_id = COALESCE(
      auth.jwt() ->> 'user_id',
      auth.jwt() ->> 'sub'
    )
  );

-- Optional: Allow service role to bypass RLS for admin operations
-- The service role key automatically bypasses RLS