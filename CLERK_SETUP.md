# Clerk Authentication Setup Guide

## Overview
This project uses [Clerk](https://clerk.com/) for user authentication, providing email/password, social OAuth, and magic link authentication options.

## Setup Instructions

### 1. Create a Clerk Application

1. Go to [clerk.com](https://clerk.com/) and sign up/sign in
2. Create a new application
3. Choose your authentication methods:
   - Email & Password ✓
   - Social OAuth (Google, GitHub, etc.) ✓
   - Magic Links ✓

### 2. Get Your API Keys

1. In your Clerk Dashboard, navigate to **API Keys**
2. Copy your **Publishable Key**
3. Create a `.env` file in the project root (if not exists)
4. Add your Clerk key:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 3. Configure Authentication Settings

In the Clerk Dashboard:

1. **Component Paths** (under Paths section):
   - For `<SignIn />`: Select **"Sign-in page on development host"**
   - For `<SignUp />`: Select **"Sign-up page on development host"**
   - For **Signing Out**: Select **"Page on development host"**
   
   Note: We're using embedded Clerk components with hash routing, so you don't need to specify custom URLs in the dashboard. The authentication flows are handled entirely within the `/auth` route in your app.

2. **Session Settings**: Configure session duration and security settings as needed

3. **OAuth Providers** (Optional): Enable social login providers like Google, GitHub, etc.

### 4. Protected Routes

The following routes are protected and require authentication:
- `/onboarding` - User onboarding flow
- `/dashboard` - Main dashboard
- `/portfolio` - Portfolio management
- `/profile` - User profile
- `/discover` - Company discovery
- `/company/:id` - Company profiles
- `/research/:id` - Research pages
- `/projects/:id` - Project ideas
- `/add-project` - Add new project
- `/email/:companyId` - Email generation

Public routes:
- `/` - Landing page
- `/auth` - Authentication page

## Implementation Details

### ClerkProvider
The entire app is wrapped with `ClerkProvider` in `App.tsx`, providing authentication context to all components.

### Protected Routes
Protected routes use a `ProtectedRoute` component that:
- Shows content to signed-in users (`<SignedIn>`)
- Redirects unsigned users to sign-in (`<RedirectToSignIn>`)

### Auth Page
The `/auth` page uses Clerk's prebuilt components:
- `<SignIn>` component for login with `routing="hash"`
- `<SignUp>` component for registration with `routing="hash"`
- Tabs to switch between sign-in and sign-up
- Hash-based routing keeps authentication flows within the app without external redirects

### User Session
Access user session data with Clerk hooks:
```tsx
import { useAuth, useUser } from '@clerk/clerk-react';

const { isSignedIn, userId } = useAuth();
const { user } = useUser();
```

## Next Steps

1. [ ] Set up Supabase integration for user data sync
2. [ ] Configure webhooks for Clerk events
3. [ ] Implement user metadata handling
4. [ ] Set up Row Level Security policies in Supabase

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/overview)
- [Clerk Components](https://clerk.com/docs/components/overview)
