# Spearfishin AI - Warp Agent Mode Project Guide

## Project Overview

This is a React/Vite application with ShadCN UI components, managed with Task Master AI for development workflow organization.

## Key Project Information

### Technology Stack
- **Framework**: React 18 with Vite
- **UI Components**: ShadCN UI (Radix UI primitives)
- **Styling**: Tailwind CSS with CSS animations
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React
- **Package Manager**: npm (has package-lock.json, bun.lockb, pnpm-lock.yaml)

### Project Structure
```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── lib/               # Utilities and configurations
├── styles/            # Global styles
└── types/             # TypeScript type definitions

public/                # Static assets
```

### Development Commands
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run build:dev      # Build in development mode
npm run preview        # Preview production build
npm run lint           # Run ESLint
```

## Warp Agent Mode Workflows

### Task Master Integration

This project uses Task Master AI for development workflow management. See `.taskmaster/WARP.md` for detailed Task Master commands.

**Common Task Master workflows through Warp Agent Mode:**
- "What's my next task?" - Get next available task
- "Show me task details for [task-id]" - View specific task
- "Help me implement the authentication system" - Get task-specific implementation help
- "Mark current task as complete" - Update task status
- "Create a new task for fixing the login bug" - Add tasks on the fly

### Development Workflows

**Starting a new feature:**
1. "Help me start working on the next available task"
2. Warp Agent Mode will get the task, show details, and suggest implementation approach
3. "Create a new component for [feature]" - Scaffold new React components
4. "Set up the routing for this feature" - Configure React Router
5. "Add the necessary API calls" - Implement data fetching with React Query

**Code Quality & Testing:**
- "Lint and format my code" - Run ESLint and fix formatting
- "Create tests for this component" - Generate unit tests
- "Check if my changes break anything" - Run build and validation
- "Review my changes before committing" - Git diff and review

**Component Development:**
- "Create a new ShadCN component for [purpose]" - Scaffold UI components
- "Style this component with Tailwind" - Apply responsive styling
- "Make this component accessible" - Add ARIA labels and keyboard navigation
- "Add form validation with Zod" - Implement form schemas

### Git & Deployment Workflows

**Version Control:**
- "Create a feature branch for task [id]" - Git branching with task context
- "Commit my changes with a good message" - Contextual commit messages
- "Prepare this for code review" - Stage, commit, and create PR
- "Merge this feature and clean up" - Complete feature workflow

**Deployment:**
- "Build the production version" - Run build command
- "Check the production build" - Run preview and validation
- "Deploy to production" - Handle deployment workflow

## Project-Specific Context

### Component Libraries
- Use ShadCN UI components as the foundation
- Extend with custom components in `src/components/`
- Follow the established component patterns
- Use Tailwind CSS for styling

### State Management Patterns
- Use React Query for server state
- Local component state with useState/useReducer
- Context for shared UI state (themes, modals)

### File Organization
- Components in `src/components/` with co-located styles/tests
- Pages in `src/pages/` following route structure
- Custom hooks in `src/hooks/`
- Utilities in `src/lib/`
- Types in `src/types/`

### Code Quality Standards
- TypeScript strict mode enabled
- ESLint with React and TypeScript rules
- Consistent component patterns
- Accessible UI components
- Responsive design patterns

## Environment & Configuration

### Environment Variables
Check `.env.example` for required environment variables.
Configure your `.env` file with:
- API keys for external services
- Task Master AI API keys
- Development/production flags

### Development Setup
```bash
npm install            # Install dependencies
npm run dev            # Start development server
```

### Task Master Setup
```bash
task-master init       # Initialize Task Master (if not done)
task-master models --setup  # Configure AI models
```

## Common Warp Agent Mode Requests

### Development
- "Help me implement [feature] following this project's patterns"
- "Create a new page component for [route]"
- "Add form validation for [form]"
- "Style this component to match the design system"
- "Fix this TypeScript error"
- "Add error handling to this API call"

### Task Management
- "Show me my project roadmap"
- "What are the high priority tasks?"
- "Break down this complex feature into subtasks"
- "Update my progress on the current task"

### Code Quality
- "Review this code for best practices"
- "Make this component more accessible"
- "Optimize this component's performance"
- "Add comprehensive error boundaries"

---

_This guide helps Warp Agent Mode understand the project context and provide relevant assistance for the Spearfishin AI React application._