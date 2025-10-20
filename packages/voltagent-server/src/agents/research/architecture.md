# Research Agent Architecture

## Overview

The Company Research Agent is a VoltAgent-powered AI agent that performs comprehensive intelligence gathering on Y Combinator companies. It uses multiple specialized tools to collect data from various sources and synthesizes findings into structured, actionable insights.

## Design Philosophy

- **VoltAgent-Native**: Uses VoltAgent's built-in patterns—no custom orchestration
- **Tool-Driven Intelligence**: Agent autonomously decides which tools to use based on context
- **Structured Output**: Type-safe Zod schemas ensure data consistency with UI requirements
- **Multi-Source Research**: Combines web search, GitHub analysis, and community sentiment

## Agent Configuration

```typescript
const researchAgent = new Agent({
  id: "company-research",
  name: "Company Research Agent",
  
  instructions: `You are an expert Y Combinator company research analyst. Your goal is to provide comprehensive, actionable intelligence for developers seeking to build projects that solve real problems for these companies.

**Research Process:**

1. **Company Intelligence**
   - Find latest funding rounds, investors, and valuations
   - Identify key customers and growth metrics
   - Assess market position and competitive landscape

2. **Technical Analysis**
   - Determine tech stack from GitHub repos and job postings
   - Analyze GitHub activity: commit frequency, open issues, PRs
   - Extract pain points from issue discussions and user complaints

3. **Community Feedback** (CRITICAL)
   - Search Reddit, Hacker News, Stack Overflow for user discussions
   - Identify pain points: "X doesn't work", "Y is missing", "Z is frustrating"
   - Find product gaps: features competitors have that this product lacks
   - Discover workarounds: tools/scripts users build to fill gaps

4. **Key People**
   - Identify founders, CTO, VP Engineering, Head of Product
   - Find their recent conference talks, blog posts, tweets
   - Note their stated priorities and pain points

5. **Opportunity Signals**
   - Active hiring for engineering roles
   - Recent funding rounds (expansion phase)
   - Public technical challenges in GitHub issues
   - Conference presence (raising visibility)

6. **Synthesis**
   - Prioritize pain points by severity and evidence
   - Connect pain points to potential project opportunities
   - Provide specific, actionable recommendations

**Output Quality Guidelines:**
- Cite specific sources (GitHub issue #, HN thread, Reddit post)
- Quantify whenever possible (# of users affected, upvotes, occurrences)
- Be specific: "Mobile app crashes on iOS 17+" not "mobile issues"
- Focus on problems developers can solve with projects`,

  model: anthropic("claude-3-5-sonnet-20241022"), // Strong reasoning for synthesis
  
  tools: [
    perplexitySearchTool,      // Real-time web intelligence
    githubAnalysisTool,        // Repository insights
    communitySentimentTool,    // Social platforms analysis
    companyDataTool,           // YC database lookup (if needed)
  ],
  
  maxSteps: 20,     // Allow thorough multi-tool research
  markdown: false,   // Use structured output only
  temperature: 0.3,  // Precise, factual responses
});
```

## Tool Definitions

### 1. Perplexity Search Tool

**Purpose**: Real-time web search for business intelligence and market data

```typescript
const perplexitySearchTool = createTool({
  name: "search_company_intelligence",
  
  description: `Search the web for company information. Use this tool to find:
  - Funding rounds, investors, and valuations
  - Customer testimonials and case studies
  - Growth metrics and market position
  - Recent news and announcements
  - Competitor analysis`,
  
  parameters: z.object({
    company_name: z.string().describe("Full company name"),
    search_type: z.enum([
      "funding", 
      "customers", 
      "growth", 
      "investors", 
      "market_position",
      "recent_news"
    ]).describe("Type of intelligence to search for"),
    additional_context: z.string().optional().describe("Additional search context or keywords"),
  }),
  
  execute: async ({ company_name, search_type, additional_context }) => {
    const query = buildSearchQuery(company_name, search_type, additional_context);
    
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [{
          role: "user",
          content: query
        }],
        search_recency_filter: "month", // Prioritize recent information
      })
    });
    
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      sources: data.citations || [],
    };
  },
});
```

### 2. GitHub Analysis Tool

**Purpose**: Extract technical insights from repository activity

```typescript
const githubAnalysisTool = createTool({
  name: "analyze_github_repository",
  
  description: `Analyze GitHub repositories to discover:
  - Tech stack (languages, frameworks, tools)
  - Development activity (commits, PRs, releases)
  - Pain points (issues with many comments/reactions)
  - Technical challenges (long-standing issues, discussions)`,
  
  parameters: z.object({
    company_name: z.string(),
    repo_url: z.string().optional().describe("If known, the GitHub repo URL"),
    analysis_focus: z.enum([
      "tech_stack",
      "recent_activity", 
      "pain_points",
      "all"
    ]),
  }),
  
  execute: async ({ company_name, repo_url, analysis_focus }) => {
    // 1. Find repo if not provided (search GitHub API)
    // 2. Fetch repo metadata: languages, topics, description
    // 3. Get recent commits, PRs, releases
    // 4. Analyze issues: high-reaction issues, long-standing bugs
    // 5. Check discussions for feature requests
    
    const octokit = new Octokit({ auth: process.env.GITHUB_API_KEY });
    
    // Find repository
    const repo = repo_url 
      ? parseRepoUrl(repo_url)
      : await findCompanyRepo(octokit, company_name);
    
    if (!repo) {
      return { error: "Repository not found" };
    }
    
    // Gather data based on analysis focus
    const results = {
      tech_stack: [],
      recent_activity: "",
      pain_points: [],
    };
    
    if (analysis_focus === "all" || analysis_focus === "tech_stack") {
      const { data: repoData } = await octokit.rest.repos.get({
        owner: repo.owner,
        repo: repo.name,
      });
      results.tech_stack = Object.keys(repoData.languages || {});
    }
    
    if (analysis_focus === "all" || analysis_focus === "pain_points") {
      const { data: issues } = await octokit.rest.issues.listForRepo({
        owner: repo.owner,
        repo: repo.name,
        state: "open",
        sort: "reactions",
        per_page: 20,
      });
      
      results.pain_points = issues.map(issue => ({
        title: issue.title,
        url: issue.html_url,
        reactions: issue.reactions.total_count,
        comments: issue.comments,
        created_at: issue.created_at,
      }));
    }
    
    return results;
  },
});
```

### 3. Community Sentiment Tool

**Purpose**: Discover user pain points and product gaps from social platforms

```typescript
const communitySentimentTool = createTool({
  name: "analyze_community_feedback",
  
  description: `Search social platforms for user feedback, pain points, and product gaps. 
  Focus on finding:
  - User complaints and frustrations
  - Missing features users wish existed
  - Workarounds and scripts users have built
  - Comparisons with competitors`,
  
  parameters: z.object({
    company_name: z.string(),
    platforms: z.array(
      z.enum(["reddit", "hackernews", "stackoverflow", "twitter", "producthunt"])
    ),
    search_focus: z.enum([
      "pain_points",
      "missing_features",
      "workarounds",
      "competitors",
      "all"
    ]),
  }),
  
  execute: async ({ company_name, platforms, search_focus }) => {
    // Use Perplexity to search specific platforms
    // Construct targeted queries for each platform
    
    const platformQueries = {
      reddit: `site:reddit.com "${company_name}" (problem OR issue OR bug OR missing OR wish)`,
      hackernews: `site:news.ycombinator.com "${company_name}" (Show HN OR Ask HN)`,
      stackoverflow: `site:stackoverflow.com "${company_name}" (error OR problem)`,
      twitter: `"${company_name}" (frustrating OR broken OR needs OR missing)`,
    };
    
    const results = {
      pain_points: [],
      product_gaps: [],
      user_workarounds: [],
    };
    
    for (const platform of platforms) {
      const query = platformQueries[platform];
      
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-large-128k-online",
          messages: [{
            role: "user",
            content: `${query}

Extract:
1. Pain points: specific problems users mention
2. Missing features: things users wish existed
3. Workarounds: tools or scripts users built to solve problems`
          }],
        })
      });
      
      const data = await response.json();
      // Parse response and categorize findings
      const findings = parseCommunitySentiment(data.choices[0].message.content);
      
      results.pain_points.push(...findings.pain_points);
      results.product_gaps.push(...findings.product_gaps);
      results.user_workarounds.push(...findings.workarounds);
    }
    
    return results;
  },
});
```

### 4. Company Data Tool (Optional)

**Purpose**: Quick lookup from YC database

```typescript
const companyDataTool = createTool({
  name: "lookup_company_data",
  description: "Fetch company data from Supabase YC companies table",
  parameters: z.object({
    company_id: z.string().describe("Company ID from URL or database"),
  }),
  execute: async ({ company_id }) => {
    // Query Supabase companies table
    const supabase = getSupabase(true); // Service role
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", company_id)
      .single();
    
    if (error) throw new Error(`Company not found: ${error.message}`);
    return data;
  },
});
```

## Agent Invocation

```typescript
// Call the agent with structured output
const result = await researchAgent.generateObject(
  `Research Y Combinator company: ${companyName} (ID: ${companyId})
  
  Focus especially on community feedback—find specific pain points from Reddit, HN, Stack Overflow.`,
  
  CompanyResearchSchema, // Zod schema for structured output
  
  {
    maxSteps: 20,
    temperature: 0.3,
  }
);

// result.object contains fully typed research data
const research = result.object;
```

## Output Schema

See `schema.ts` for the complete Zod schema definition. The schema ensures the agent's output matches the UI's data requirements exactly.

## Integration Points

### With Supabase Edge Function

The Edge Function (`supabase/functions/voltagent-research/index.ts`) will:
1. Receive request with `companyId` and `userId`
2. Call VoltAgent server endpoint: `POST /agents/company-research/stream-object`
3. Stream partial results back to client via SSE
4. Cache final result in `voltagent_cache` table

### With Research UI

The UI (`src/pages/Research.tsx`) will:
1. Parse structured JSON output from agent
2. Map fields to existing UI sections
3. Add new "Community Feedback" section
4. Display progressive results during streaming

## Performance Considerations

- **Parallel tool execution**: VoltAgent automatically parallelizes independent tool calls
- **Caching**: Edge Function caches results for 24 hours (configurable)
- **Rate limiting**: Token bucket algorithm prevents API quota exhaustion
- **Streaming**: Partial results shown to user as they're generated

## Observability

- VoltAgent server automatically logs to VoltOps console
- View real-time execution traces at https://console.voltagent.dev
- Monitor tool usage, errors, and performance metrics

---

**Next Steps:**
1. Implement tool functions with real API integrations
2. Test agent with sample companies
3. Refine instructions based on output quality
4. Optimize tool parameters for best results
