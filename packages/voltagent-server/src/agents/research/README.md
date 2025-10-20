# Company Research Agent

A VoltAgent-powered AI agent that performs comprehensive intelligence gathering on Y Combinator companies. It combines web search (via Perplexity), GitHub analysis, and community sentiment to provide actionable insights for developers.

## Features

- **Business Intelligence**: Funding, investors, growth metrics, customers, market position
- **Technical Landscape**: Tech stack, GitHub activity, pain points from issues
- **Key People**: Leadership team, interests, recent activities
- **Community Feedback** (Critical): Pain points, product gaps, missing features, user workarounds from Reddit, HN, Stack Overflow
- **Opportunity Signals**: Hiring, funding rounds, technical challenges
- **Pain Points Summary**: Prioritized, actionable problems with evidence and potential solutions

## Tools

### 1. Perplexity Search Tool (`search_company_intelligence`)
- Real-time web search for business intelligence
- Searches for funding, customers, growth metrics, market position, news
- Uses Perplexity's online model with search recency filter

### 2. GitHub Analysis Tool (`analyze_github_repository`)
- Analyzes GitHub repositories for tech stack and pain points
- Extracts issue data, commit activity, and technical challenges
- Auto-discovers repository if URL not provided

### 3. Community Sentiment Tool (`analyze_community_feedback`)
- Searches Reddit, Hacker News, Stack Overflow, Twitter, Product Hunt
- Identifies pain points, missing features, workarounds, competitor mentions
- Provides specific citations (thread URLs, post IDs)

### 4. Company Data Tool (`lookup_company_data`)
- Placeholder for Supabase database queries
- Edge Function will inject actual company data

## Usage

### From VoltAgent Server

The agent is registered at startup and available via REST API:

```bash
# Generate complete research
POST http://localhost:3141/agents/company-research/generate
{
  "input": "Research Y Combinator company: Stripe (ID: stripe-123)",
  "schema": { ... CompanyResearchSchema ... }
}

# Stream research with progressive results
POST http://localhost:3141/agents/company-research/stream-object
{
  "input": "Research Y Combinator company: Notion (ID: notion-456)",
  "schema": { ... CompanyResearchSchema ... }
}
```

### From TypeScript

```typescript
import { researchCompany, streamResearchCompany } from "./agents/research";

// Generate complete research
const research = await researchCompany({
  companyId: "stripe-123",
  companyName: "Stripe",
});

console.log(research.business_intelligence.funding);
console.log(research.community_feedback.pain_points);

// Stream research with progressive results
const stream = await streamResearchCompany({
  companyId: "notion-456",
  companyName: "Notion",
});

for await (const partial of stream.partialObjectStream) {
  if (partial.community_feedback) {
    console.log("Community feedback:", partial.community_feedback);
  }
}

const finalResearch = await stream.object;
```

## Environment Variables

Required:
```bash
PERPLEXITY_API_KEY=pplx-xxx  # For web search and community analysis
ANTHROPIC_API_KEY=sk-ant-xxx # For Claude 3.5 Sonnet reasoning
```

Optional:
```bash
GITHUB_API_KEY=ghp-xxx       # For direct GitHub API access (not currently used)
```

## Agent Configuration

- **Model**: Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`)
- **Temperature**: 0.3 (precise, factual)
- **Max Steps**: 20 (thorough research)
- **Output**: Structured JSON via `CompanyResearchSchema`

## Output Schema

See `schema.ts` for complete Zod schema definitions. Key sections:

```typescript
{
  business_intelligence: {
    funding: string,
    investors: string[],
    growth_metrics: string,
    customers: string[],
    market_position: string,
  },
  technical_landscape: {
    tech_stack: string[],
    github_activity: string,
    pain_points: Array<{ title, severity, description }>,
    recent_releases: string[],
  },
  key_people: Array<{
    name: string,
    role: string,
    interests: string[],
    recent_activity: string,
  }>,
  community_feedback: {
    pain_points: string[],
    product_gaps: string[],
    missing_features: string[],
    user_workarounds: string[],
  },
  opportunity_signals: Array<{
    signal: string,
    description: string,
    urgency: "high" | "medium" | "low",
  }>,
  pain_points_summary: Array<{
    problem: string,
    severity: "critical" | "high" | "medium" | "low",
    evidence: string,
    potential_solution: string,
  }>,
}
```

## Integration with Supabase Edge Function

The Edge Function (`supabase/functions/voltagent-research/index.ts`) will:

1. Receive request with `companyId` and `userId`
2. Look up company data from database
3. Call VoltAgent server: `POST http://localhost:3141/agents/company-research/stream-object`
4. Stream partial results back to client via SSE
5. Cache final result in `voltagent_cache` table

## Testing

```bash
# Start VoltAgent server
cd packages/voltagent-server
pnpm dev

# Server starts at http://localhost:3141
# Swagger UI available at http://localhost:3141/ui

# Test with curl
curl -X POST http://localhost:3141/agents/company-research/generate \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Research Y Combinator company: Stripe",
    "options": {
      "maxSteps": 20,
      "temperature": 0.3
    }
  }'
```

## Observability

- View real-time execution traces at https://console.voltagent.dev
- Monitor tool usage, errors, and performance metrics
- See which tools the agent calls and in what order

## Architecture

- **Design Philosophy**: VoltAgent-native (no custom orchestration)
- **Tool-Driven**: Agent autonomously decides which tools to use
- **Parallel Execution**: VoltAgent automatically parallelizes independent tool calls
- **Structured Output**: Type-safe Zod schemas ensure consistency

See `architecture.md` for detailed design documentation.

## Next Steps

- [ ] Update Edge Function to call VoltAgent server
- [ ] Update Research UI to display structured output
- [ ] Add Community Feedback section to UI
- [ ] Test with real Y Combinator companies
- [ ] Optimize tool parameters based on results
- [ ] Add caching layer for repeated queries
