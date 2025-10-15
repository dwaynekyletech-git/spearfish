# Clerk & Supabase Complete Setup Guide

## 🎯 What You Need to Do

This guide walks you through the exact steps to configure Clerk and Supabase for this project.

### ✅ Already Completed in Code:
- Webhook handler: `src/api/webhooks/clerk.ts`
- Session management: `src/lib/auth/sessionManager.ts`
- User sync service: `src/lib/auth/userSync.ts`
- Database schema: `supabase/*.sql` files
- Environment variables defined in `.env.example`

## 🔐 Part 1: Clerk Configuration

### Step 1: Create Clerk Application
1. Go to [clerk.com](https://clerk.com) and sign up/login
2. Click **"Create application"**
3. Name it: **"Spearfishin AI"**
4. Enable these authentication methods:
   - ✅ **Email/Password**
   - ✅ **Magic Links**  
   - ✅ **Google OAuth**
   - ✅ **GitHub OAuth** (optional)
5. Click **"Create application"**

### Step 2: Get Your API Keys
1. In Clerk Dashboard → **API Keys**
2. Copy these values to your `.env` file:
```bash
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."  # Copy the Publishable key
CLERK_SECRET_KEY="sk_test_..."            # Copy the Secret key (if using server)
```

### Step 3: Configure Webhooks
1. In Clerk Dashboard → **Webhooks**
2. Click **"Add Endpoint"**
3. For the endpoint URL:
   - **For local testing**: First run `ngrok http 8080`, then use: `https://YOUR-NGROK-ID.ngrok.io/api/webhooks/clerk`
   - **For production**: `https://your-domain.com/api/webhooks/clerk`
4. Select these events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
   - ✅ `session.created`
   - ✅ `session.ended`
5. Click **"Create"**
6. Copy the **Signing Secret** (starts with `whsec_`) to your `.env`:
```bash
CLERK_WEBHOOK_SECRET="whsec_..."
```

### Step 4: Create JWT Template for Supabase
1. In Clerk Dashboard → **JWT Templates**
2. Click **"New template"**
3. Name: **`supabase`** (must be exactly this)
4. Add these custom claims:
```json
{
  "aud": "authenticated",
  "role": "authenticated",
  "email": "{{user.primary_email_address}}",
  "user_id": "{{user.id}}",
  "sub": "{{user.id}}"
}
```
5. Click **"Save"**

### Step 5: Configure Redirect Paths
1. In Clerk Dashboard → **Paths**
2. Set these paths:
   - **Sign-in URL**: `/auth`
   - **Sign-up URL**: `/auth`
   - **After sign-in URL**: `/dashboard`
   - **After sign-up URL**: `/onboarding`

## 🗄️ Part 2: Supabase Configuration

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New project"**
3. Project name: **"spearfishin-ai"**
4. Database password: Generate a strong one and **save it!**
5. Region: Choose closest to your users
6. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Get Supabase API Keys
1. In Supabase Dashboard → **Settings** → **API**
2. Copy these to your `.env` file:
```bash
VITE_SUPABASE_URL="https://xxxxx.supabase.co"    # Your Project URL
VITE_SUPABASE_ANON_KEY="eyJ..."                  # Your anon/public key
SUPABASE_SERVICE_ROLE_KEY="eyJ..."               # Your service_role key (KEEP SECRET!)
```

### Step 3: Apply Database Schema
1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New query"**
3. Run each SQL file in this exact order (copy/paste from your `/supabase` folder):
   1. **schema.sql** - Creates all tables
   2. **triggers.sql** - Sets up updated_at triggers
   3. **policies.sql** - Configures Row Level Security
   4. **storage.sql** - Creates storage buckets
   5. **realtime.sql** - Enables realtime subscriptions
4. After each file, click **"Run"** and ensure no errors

### Step 4: Configure Clerk JWT in Supabase
1. Get Clerk's public key:
   - In Clerk Dashboard → **API Keys** → **Advanced**
   - Click **"Show JWT public key"**
   - Copy the entire PEM-formatted key (starts with `-----BEGIN PUBLIC KEY-----`)
2. In Supabase Dashboard → **Authentication** → **Providers**
3. Scroll down to **"Custom JWT"**
4. Enable it and configure:
   - **JWT Secret**: Paste the Clerk public key
   - **JWT aud**: `authenticated`
   - **JWT Role Claim**: Leave as `role`
5. Click **"Save"**

### Step 5: Verify RLS is Enabled
1. In Supabase Dashboard → **Authentication** → **Policies**
2. Check that all tables show **"RLS enabled"** ✅
3. If any show disabled, click the table and enable RLS

## 🧪 Part 3: Testing Your Setup

### Test 1: Clerk Authentication
1. Start the app: `npm run dev`
2. Go to http://localhost:8080/auth
3. Sign up with email/password
4. Check Clerk Dashboard → **Users** - you should see the new user
5. Check browser console - should show "User profile created in Supabase"

### Test 2: User Sync to Supabase
1. After signing in, go to Supabase Dashboard
2. Navigate to **Table Editor** → **users**
3. You should see a row with:
   - `user_id`: Matches Clerk user ID
   - `full_name`: From Clerk profile
   - `created_at`: Timestamp

### Test 3: Protected Routes
1. Sign out from the app
2. Try to access http://localhost:8080/dashboard
3. Should redirect to `/auth`
4. Sign in again
5. Should now access dashboard successfully

### Test 4: Webhook Events (Optional - requires backend)
For local testing with ngrok:
1. Install ngrok: `npm install -g ngrok`
2. Run: `ngrok http 8080`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Update webhook URL in Clerk Dashboard to `https://abc123.ngrok.io/api/webhooks/clerk`
5. Create a test user in Clerk
6. Check Supabase → **Table Editor** → **clerk_webhook_events** for logged events

## 🚨 Troubleshooting

### "Missing Publishable Key" Error
- Ensure `VITE_CLERK_PUBLISHABLE_KEY` is in your `.env` file
- Restart the dev server after adding env variables

### User Not Syncing to Supabase
- Check browser console for errors
- Verify Supabase URL and keys are correct
- Check that RLS policies are enabled
- Ensure the `users` table exists

### "Invalid JWT" Errors
- Verify JWT template in Clerk is named exactly "supabase"
- Check that Clerk's public key is correctly pasted in Supabase
- Ensure JWT aud is set to "authenticated"

### Can't Access Protected Routes
- Clear browser cookies and local storage
- Sign out and sign in again
- Check that ClerkProvider is wrapping your app in App.tsx

## ✅ Final Checklist

- [ ] Clerk app created with auth methods enabled
- [ ] All API keys copied to `.env` file
- [ ] Webhook endpoint configured in Clerk (can skip for basic testing)
- [ ] JWT template named "supabase" created
- [ ] Supabase project created
- [ ] All SQL files executed in order
- [ ] Clerk JWT configured in Supabase
- [ ] RLS enabled on all tables
- [ ] App runs and authentication works
- [ ] Users sync to Supabase `users` table

## 📚 Additional Resources
- [Clerk Docs](https://clerk.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Project Repository](https://github.com/your-repo/spearfishin-ai)

---

**Need help?** Check the browser console and Supabase logs for detailed error messages.
