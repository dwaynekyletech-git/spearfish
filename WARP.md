# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

```bash
# Development
pnpm i                   # Install dependencies
pnpm dev                 # Start development server with Turbopack
pnpm build               # Build production app with Turbopack
pnpm start               # Start production server
pnpm preview             # Preview production build
pnpm lint                # Run ESLint

# Type Checking
pnpm tsc --noEmit        # Run TypeScript compiler to check for type errors

# Supabase (if working locally)
supabase login
supabase link --project-ref <your-ref>
supabase db push        # Push schema changes
```

## Project Architecture

### Technology Stack
- **Framework**: React 18 + Vite with SWC
- **UI**: ShadCN UI (Radix primitives) + Tailwind CSS
- **Auth**: Clerk (OAuth, user management)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **State**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM v6
- **AI Backend**: VoltAgent (custom SSE streaming system)

### Authentication Flow

**Clerk ↔ Supabase Sync Pattern**:
1. Clerk handles all authentication (sign-in, OAuth, sessions)
2. `useUserSync` hook (in `src/lib/auth/userSync.ts`) syncs users to Supabase on mount
3. Clerk JWT tokens are used to authenticate Supabase operations via custom JWT template
4. All protected routes use `<ProtectedRoute>` wrapper in `App.tsx`
5. **Critical**: Edge Functions receive `userId` from client, then use service role internally

**Authentication Setup**:
- Client code uses `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_SUPABASE_ANON_KEY`
- Edge Functions use `SUPABASE_SERVICE_ROLE_KEY` for database operations
- Never expose service role key to client code

### Database Architecture

**Schema Overview** (`supabase/schema.sql`):
- `users` - User profiles (1:1 with Clerk, stores job_title, skills, career_interests, etc.)
- `companies` - Y Combinator companies catalog (read-only for clients)
- `user_saved_companies` - Bookmarked companies per user
- `company_research` - AI-generated research data (business intel, technical landscape, key people, etc.)
- `project_ideas` - AI-generated project suggestions
- `projects` - User portfolio projects (with status: in_progress/completed/pitched)
- `outreach_emails` - Generated emails for companies
- `voltagent_executions` - Audit log for AI agent runs
- `clerk_webhook_events` - Webhook event log

**RLS (Row Level Security)**:
- Enabled on all tables with policies in `supabase/policies.sql`
- Users can only access/modify their own data
- Companies table is read-only to clients
- Edge Functions bypass RLS using service role

### VoltAgent Streaming System

**How It Works**:
- VoltAgent is a custom SSE (Server-Sent Events) streaming system for AI agents
- Located in `src/lib/voltagentClient.ts` (client) and `supabase/functions/voltagent-*/index.ts` (server)
- Three agent types: `research`, `project-generator`, `email-outreach`

**Streaming Pattern**:
```typescript
await streamVoltagent({
  endpoint: 'research',
  userId: clerkUserId,
  input: { companyId, userProfile },
  options: { regeneration: false }
}, {
  onProgress: (msg) => { /* status updates */ },
  onChunk: (data) => { /* partial results */ },
  onError: (err) => { /* handle errors */ },
  onDone: () => { /* finalize */ }
});
```

**Event Types**:
- `progress` - Status messages (e.g., "Researching company...")
- `chunk` - Partial data (e.g., incremental research findings)
- `error` - Error messages
- `done` - Stream complete

**Hook**: Use `useVoltagentStream` hook (in `src/hooks/useVoltagentStream.ts`) for React components

### File Structure Conventions

```
src/
├── components/
│   └── ui/              # ShadCN components (auto-generated, customize carefully)
├── pages/               # Route components (match React Router structure)
├── hooks/               # Custom React hooks
├── lib/
│   ├── auth/           # Authentication utilities
│   ├── supabaseClient.ts  # Supabase client factory
│   └── voltagentClient.ts # AI agent client
└── assets/             # Static assets

supabase/
├── functions/          # Edge Functions (Deno runtime)
│   ├── _shared/       # Shared utilities
│   └── voltagent-*/   # AI agent endpoints
└── *.sql              # Database schema and migrations
```

### Important Patterns

**1. Path Aliasing**:
- Use `@/` for src imports: `import { Button } from "@/components/ui/button"`
- Configured in `vite.config.ts` and `tsconfig.json`

**2. Supabase Client Usage**:
- **Browser**: Use `getSupabaseClient()` from `src/lib/supabaseClient.ts` (anon key)
- **Edge Functions**: Use service role client from `_shared/db.ts`
- Never use service role in browser code

**3. Protected Routes**:
- All authenticated pages wrapped in `<ProtectedRoute>` in `App.tsx`
- `useUserSync` hook ensures Supabase profile exists
- Redirects to sign-in if not authenticated

**4. Form Validation**:
- Use React Hook Form + Zod schemas
- ShadCN form components already integrated

**5. Data Fetching**:
- Use React Query for server state
- Mutations trigger invalidations for cache consistency
- Queries automatically retry and cache

### Environment Variables

**Required**:
```bash
# Clerk (Authentication)
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Supabase (Database)
VITE_SUPABASE_URL="https://xxx.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."  # Server-only!
SUPABASE_JWT_SECRET="xxx"           # Server-only!

# AI Models (for VoltAgent)
ANTHROPIC_API_KEY="sk-ant-..."      # Required
PERPLEXITY_API_KEY="pplx-..."       # For research features
OPENAI_API_KEY="sk-proj-..."        # Optional
```

**Important**: 
- `VITE_*` prefixed vars are exposed to browser
- Never prefix service role keys or JWT secrets with `VITE_`
- Use `.env.example` as template

### Task Master Integration

This project uses Task Master AI for development workflow management. See `.taskmaster/WARP.md` for detailed Task Master commands.

**Common Task Master workflows through Warp Agent Mode:**
- "What's my next task?" - Get next available task
- "Show me task details for [task-id]" - View specific task
- "Help me implement the authentication system" - Get task-specific implementation help
- "Mark current task as complete" - Update task status
- "Create a new task for fixing the login bug" - Add tasks on the fly

### Common Gotchas

1. **TypeScript Config**: `noImplicitAny: false` is set - be careful with type safety
2. **Vite Port**: Dev server runs on port **8080** (not 5173)
3. **Lovable Integration**: This project was created with Lovable.dev - commits may be auto-generated
4. **ShadCN Components**: Located in `src/components/ui/` - customize with care
5. **Edge Functions**: Use Deno runtime, not Node.js (different import syntax)
6. **RLS Policies**: Always test database operations with anon key to verify RLS works
7. **Streaming Responses**: VoltAgent uses SSE - don't use standard fetch for AI endpoints
8. **User Sync**: `useUserSync` must be called in `<ProtectedRoute>` to ensure Supabase profile exists

### Supabase Setup

**Initial Setup**:
1. Create Supabase project
2. Copy environment variables from Project Settings → API
3. Apply SQL files in order:
   - `supabase/schema.sql`
   - `supabase/triggers.sql`
   - `supabase/policies.sql`
   - `supabase/storage.sql`
   - `supabase/realtime.sql`
4. Configure Clerk webhook in Supabase Edge Functions

**Clerk-Supabase JWT Integration**:
1. In Clerk Dashboard → JWT Templates
2. Create "Supabase" template
3. Copy Supabase JWT Secret to template
4. Use template name "supabase" when getting tokens: `getToken({ template: 'supabase' })`

### Key Design Decisions

**Why Clerk + Supabase?**
- Clerk handles complex auth flows (OAuth, MFA, etc.)
- Supabase provides database + real-time + storage
- Clerk JWT tokens authorize Supabase RLS policies
- Best of both: great auth UX + flexible database

**Why VoltAgent (Custom SSE)?**
- Long-running AI operations need streaming feedback
- SSE provides progressive updates (better UX than loading spinners)
- Server-side caching and retry logic
- Audit trail in `voltagent_executions` table

**Why Edge Functions over API Routes?**
- Supabase Edge Functions run close to database (low latency)
- Deno runtime is secure and fast
- Built-in service role access pattern
- Easy deployment with Supabase CLI

---

_This guide helps Warp Agent Mode understand the Spearfish AI project context and architecture._
