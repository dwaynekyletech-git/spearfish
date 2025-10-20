# Spearfish AI 🐟

> AI-powered job hunting platform for Y Combinator companies - Build your portfolio, research companies, and generate personalized outreach.

## 🌟 Overview

Spearfish AI helps job seekers target Y Combinator companies by providing:
- **Company Discovery**: Browse and search 4000+ YC companies
- **AI Research**: Deep company insights (tech stack, culture, key people, pain points)
- **Project Ideas**: AI-generated portfolio project suggestions tailored to each company
- **Portfolio Management**: Track your projects from ideation to completion
- **Smart Outreach**: Generate personalized emails showcasing your relevant work

## ✨ Features

### 🔍 Company Research
- Access comprehensive Y Combinator company database
- Save and bookmark interesting companies
- AI-powered research using VoltAgent streaming system
- Get insights on business intel, technical landscape, and hiring signals

### 💡 Project Ideation
- AI generates project ideas tailored to each company's tech stack
- Estimates impact level and time investment
- Suggests relevant technologies to use

### 📂 Portfolio Builder
- Track project status (in-progress, completed, pitched)
- Add GitHub repos and deployment links
- Showcase your work to potential employers

### ✉️ Email Outreach
- Generate personalized cold emails
- Reference your portfolio projects
- Multiple tone options (professional, casual, enthusiastic)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- pnpm (install via `npm install -g pnpm`)
- Supabase account
- Clerk account
- Anthropic API key (for AI features)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd spearfish

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your API keys (see Environment Variables section)
```

### Environment Variables

Create a `.env` file with the following:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Supabase
VITE_SUPABASE_URL="https://xxx.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."  # Server-side only!
SUPABASE_JWT_SECRET="xxx"           # Server-side only!

# AI Models
ANTHROPIC_API_KEY="sk-ant-..."      # Required for VoltAgent
PERPLEXITY_API_KEY="pplx-..."       # Optional (for research)
OPENAI_API_KEY="sk-proj-..."        # Optional
```

### Database Setup

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login and link project
supabase login
supabase link --project-ref <your-project-ref>

# Apply database schema
supabase db push
```

Or manually run SQL files in Supabase Dashboard:
1. `supabase/schema.sql`
2. `supabase/triggers.sql`
3. `supabase/policies.sql`
4. `supabase/storage.sql`
5. `supabase/realtime.sql`

### Development

```bash
# Start development server (runs on port 8080)
pnpm dev

# Type checking
pnpm tsc --noEmit

# Lint
pnpm lint

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool with Turbopack
- **TypeScript** - Type safety
- **ShadCN UI** - Component library (Radix primitives)
- **Tailwind CSS** - Styling
- **React Query** - Server state management
- **React Router v6** - Client-side routing
- **React Hook Form + Zod** - Form handling and validation

### Backend & Services
- **Supabase** - PostgreSQL database with RLS
- **Supabase Edge Functions** - Serverless API (Deno runtime)
- **Clerk** - Authentication (OAuth, user management)
- **VoltAgent** - Custom AI streaming system (SSE)

### AI Integration
- **Anthropic Claude** - Primary AI model
- **Perplexity** - Research capabilities
- **OpenAI GPT** - Optional fallback

## 📚 Documentation

- **[WARP.md](./WARP.md)** - Comprehensive architecture guide for AI assistants
- **[.taskmaster/WARP.md](./.taskmaster/WARP.md)** - Task Master AI integration guide
- **[Supabase README](./supabase/README.md)** - Database setup instructions

## 🏛️ Architecture Highlights

### Authentication Flow
- Clerk handles OAuth and user sessions
- `useUserSync` hook automatically syncs users to Supabase
- JWT tokens authorize Supabase RLS policies
- Protected routes via `<ProtectedRoute>` wrapper

### VoltAgent Streaming
- Custom SSE (Server-Sent Events) implementation
- Three agent types: research, project-generator, email-outreach
- Real-time progress updates and partial results
- Audit trail in `voltagent_executions` table

### Database Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Edge Functions use service role for admin operations
- Companies table is read-only for clients

For detailed architecture information, see [WARP.md](./WARP.md).

## 🔧 Task Management

This project uses **Task Master AI** for development workflow:

```bash
# View tasks
task-master list

# Get next task
task-master next

# View task details
task-master show <id>

# Mark complete
task-master set-status --id=<id> --status=done
```

See [.taskmaster/WARP.md](./.taskmaster/WARP.md) for full Task Master documentation.

## 🤝 Contributing

This project is managed with Task Master AI. To contribute:

1. Check available tasks: `task-master list`
2. Pick a task: `task-master next`
3. Create a feature branch
4. Make your changes
5. Update task status: `task-master set-status --id=<id> --status=done`
6. Submit a pull request

## 📝 Development Notes

### Common Gotchas
- Dev server runs on **port 8080** (not 5173)
- TypeScript has `noImplicitAny: false` - be mindful of type safety
- ShadCN components in `src/components/ui/` are auto-generated
- Edge Functions use **Deno runtime**, not Node.js
- Always test RLS policies with anon key
- VoltAgent uses SSE - don't use standard fetch

### Path Aliasing
Use `@/` for src imports:
```typescript
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabaseClient"
```

## 🚢 Deployment

### Lovable (Recommended)
1. Visit [Lovable Dashboard](https://lovable.dev/projects/d0ee3ae5-4706-4e65-8da5-20955d721e30)
2. Click Share → Publish
3. Configure custom domain if needed

### Manual Deployment
```bash
# Build production bundle
pnpm build

# Deploy to your hosting provider
# Make sure to set all environment variables
```

## 📄 License

Private project - All rights reserved

## 🙋 Support

For questions or issues:
1. Check [WARP.md](./WARP.md) for architecture details
2. Review [.taskmaster/WARP.md](./.taskmaster/WARP.md) for task management
3. See Supabase and Clerk documentation for service-specific issues

---

**Built with ❤️ using React, Supabase, Clerk, and AI**
