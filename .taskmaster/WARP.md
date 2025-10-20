# Task Master AI - Warp Agent Mode Integration Guide

## Essential Commands

### Core Workflow Commands

```bash
# Project Setup
task-master init                                    # Initialize Task Master in current project
task-master parse-prd .taskmaster/docs/prd.txt      # Generate tasks from PRD document
task-master models --setup                        # Configure AI models interactively

# Daily Development Workflow
task-master list                                   # Show all tasks with status
task-master next                                   # Get next available task to work on
task-master show <id>                             # View detailed task information (e.g., task-master show 1.2)
task-master set-status --id=<id> --status=done    # Mark task complete

# Task Management
task-master add-task --prompt="description" --research        # Add new task with AI assistance
task-master expand --id=<id> --research --force              # Break task into subtasks
task-master update-task --id=<id> --prompt="changes"         # Update specific task
task-master update --from=<id> --prompt="changes"            # Update multiple tasks from ID onwards
task-master update-subtask --id=<id> --prompt="notes"        # Add implementation notes to subtask

# Analysis & Planning
task-master analyze-complexity --research          # Analyze task complexity
task-master complexity-report                      # View complexity analysis
task-master expand --all --research               # Expand all eligible tasks

# Dependencies & Organization
task-master add-dependency --id=<id> --depends-on=<id>       # Add task dependency
task-master move --from=<id> --to=<id>                       # Reorganize task hierarchy
task-master validate-dependencies                            # Check for dependency issues
task-master generate                                         # Update task markdown files (usually auto-called)
```

## Warp Agent Mode Integration

### Natural Language Task Management

Instead of remembering commands, use natural language with Warp Agent Mode:

- "Show me all my tasks" → `task-master list`
- "What's my next task?" → `task-master next`
- "Show me details for task 1.2" → `task-master show 1.2`
- "Mark task 2.1 as complete" → `task-master set-status --id=2.1 --status=done`
- "Add implementation notes to task 3.2" → `task-master update-subtask --id=3.2 --prompt="..."`
- "Break down task 1.5 into smaller subtasks" → `task-master expand --id=1.5 --research`

### Smart Workflow Automation

Ask Warp Agent Mode to handle multi-step workflows. All workflows MUST include a planning step that uses Warp's built-in TODO checklist (not a markdown file) and MUST check off items as they are completed.

**"Help me start working on the next available task"**
1. Gets next task with `task-master next`
2. Shows task details with `task-master show <id>`
3. Creates an implementation plan using Warp's built-in TODO checklist
4. Executes step-by-step, marking each TODO as done immediately upon completion
5. Updates the Task Master subtask with progress notes (`task-master update-subtask`)
6. Verifies acceptance criteria/tests
7. Marks the Task Master task as complete when done (`task-master set-status --id=<id> --status=done`)

**"Analyze my project's task complexity and expand all eligible tasks"**
1. Runs `task-master analyze-complexity --research`
2. Reviews the complexity report
3. Runs `task-master expand --all --research` for high-complexity tasks
4. Shows updated task structure

### Planning & Execution Protocol (Warp TODOs)

These directives govern how Warp should plan and track progress when working on tasks and subtasks:

- Always plan before implementing, especially for subtasks. If complexity is unclear, create a minimal 3–5 step plan.
- Use Warp's built-in TODO checklist feature for the plan (no markdown files). Keep items small, actionable, and outcome-oriented.
- Include success criteria or acceptance checks within the plan where appropriate.
- Immediately check off a TODO item as soon as its step completes. Reflect the updated checklist to the user after each completion.
- If a step expands, add new TODO items to the checklist before proceeding. Keep the plan current.
- Never proceed through multiple steps without updating the checklist state.

#### TODO Lifecycle for a Subtask

1) Inspect context: `task-master show <subtask-id>` to gather requirements and acceptance criteria.
2) Propose a TODO checklist in Warp (built-in checklist UI) covering 3–7 concrete steps.
3) Execute the first step; upon completion, immediately check it off and surface the updated checklist state.
4) Continue step-by-step, always checking off completed items and adjusting the plan if new work is discovered.
5) If blocked, add a "Blocked: <reason>" TODO item, set Task Master status to `blocked`, and surface what is needed to proceed.
6) On completion, run validation/verification (tests, lints, type checks if applicable), then mark the Task Master subtask as `done`.

#### Task Master Progress Sync

- At start: `task-master set-status --id=<id> --status=in-progress`.
- During work: `task-master update-subtask --id=<id> --prompt="progress notes, decisions, diffs"` at meaningful milestones (after 1–2 TODOs).
- At end: `task-master set-status --id=<id> --status=done` and optionally `task-master next`.

### Common Anti-Patterns to Avoid

- Skipping the planning phase for subtasks.
- Creating a checklist but not checking off items as they are completed.
- Completing multiple steps without reflecting progress to the checklist.
- Losing context between steps (always re-open task details if context is uncertain).
- Failing to update Task Master with progress notes for significant milestones.

## Configuration & Setup

### API Keys Required

At least **one** of these API keys must be configured in `.env`:

- `ANTHROPIC_API_KEY` (Claude models) - **Recommended for Warp Agent Mode**
- `PERPLEXITY_API_KEY` (Research features) - **Highly recommended**
- `OPENAI_API_KEY` (GPT models)
- `GOOGLE_API_KEY` (Gemini models)
- `MISTRAL_API_KEY` (Mistral models)
- `OPENROUTER_API_KEY` (Multiple models)
- `XAI_API_KEY` (Grok models)

### Model Configuration

```bash
# Interactive setup (recommended)
task-master models --setup

# Set specific models optimized for Warp workflows
task-master models --set-main claude-3-5-sonnet-20241022
task-master models --set-research perplexity-llama-3.1-sonar-large-128k-online
task-master models --set-fallback gpt-4o-mini
```

## Task Structure & IDs

### Task ID Format
- Main tasks: `1`, `2`, `3`, etc.
- Subtasks: `1.1`, `1.2`, `2.1`, etc.
- Sub-subtasks: `1.1.1`, `1.1.2`, etc.

### Task Status Values
- `pending` - Ready to work on
- `in-progress` - Currently being worked on
- `done` - Completed and verified
- `deferred` - Postponed
- `cancelled` - No longer needed
- `blocked` - Waiting on external factors

## Best Practices with Warp Agent Mode

### Daily Development Loop
1. Ask: "What's my next task and how should I implement it?"
2. Let Warp Agent Mode handle the Task Master commands automatically
3. During implementation: "Log my progress on this task"
4. On completion: "Mark this task as complete"

### Complex Workflows
1. Create a PRD file: "Help me create a PRD for [feature]"
2. Parse with Task Master: "Parse this PRD and create tasks"
3. Expand tasks: "Analyze and expand the new tasks"
4. Work systematically: "Help me work through these tasks one by one"

## Important Notes

- AI-powered commands may take up to a minute to complete
- Never manually edit `tasks.json` - use commands instead
- Use `--research` flag for complex technical tasks
- Let Warp Agent Mode translate natural language into Task Master operations

---

_This guide enables Warp Agent Mode to seamlessly integrate with Task Master for efficient development workflows._