import { Agent, createTool, Memory } from "@voltagent/core";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { CompanyResearchSchema } from "./schema";
import { SupabaseMemoryAdapter } from "@voltagent/supabase";
import { createClient } from "@supabase/supabase-js";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Makes a request to Perplexity API with retry logic
 */
async function perplexitySearch(query: string, options?: { recency?: string }) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY not set");
  }

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-reasoning",
      messages: [{
        role: "user",
        content: query
      }],
      search_recency_filter: options?.recency || "month",
      return_citations: true,
      return_images: false,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Perplexity API error (${response.status}): ${error}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    citations?: string[];
  };
  return {
    content: data.choices?.[0]?.message?.content || "",
    citations: data.citations || [],
  };
}

/**
 * Builds a focused search query for Perplexity
 */
function buildSearchQuery(companyName: string, searchType: string, context?: string): string {
  const queries: Record<string, string> = {
    funding: `${companyName} latest funding round, investors, valuation, Series A B C seed`,
    customers: `${companyName} notable customers, case studies, client testimonials, customer list`,
    growth: `${companyName} growth metrics, revenue growth, user growth, market expansion`,
    investors: `${companyName} investors, venture capital, funding backers, investment firms`,
    market_position: `${companyName} market position, competitive landscape, market share, competitors`,
    recent_news: `${companyName} latest news, recent announcements, press releases, product launches`,
  };

  const baseQuery = queries[searchType] || `${companyName} ${searchType}`;
  return context ? `${baseQuery} ${context}` : baseQuery;
}

/**
 * Parse GitHub repo URL into owner and name
 */
function parseRepoUrl(url: string): { owner: string; name: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    name: match[2].replace(/\.git$/, ""),
  };
}

// ============================================================================
// Tool 1: Perplexity Search Tool
// ============================================================================

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
    try {
      const query = buildSearchQuery(company_name, search_type, additional_context);
      const result = await perplexitySearch(query);
      
      return {
        success: true,
        content: result.content,
        sources: result.citations,
        search_type,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        search_type,
      };
    }
  },
});

// ============================================================================
// Tool 2: GitHub Analysis Tool
// ============================================================================

const githubAnalysisTool = createTool({
  name: "analyze_github_repository",
  
  description: `Analyze GitHub repositories to discover:
  - Tech stack (languages, frameworks, tools)
  - Development activity (commits, PRs, releases)
  - Pain points (issues with many comments/reactions)
  - Technical challenges (long-standing issues, discussions)
  
  IMPORTANT: This tool requires a GitHub repo URL. If no URL is provided in company data, 
  the company does not have a public GitHub repository. Do NOT attempt to search for it.`,
  
  parameters: z.object({
    company_name: z.string().describe("Company name"),
    repo_url: z.string().describe("GitHub repository URL from company database (required)"),
    analysis_focus: z.enum([
      "tech_stack",
      "recent_activity", 
      "pain_points",
      "all"
    ]).describe("What aspect to analyze"),
  }),
  
  execute: async ({ company_name, repo_url, analysis_focus }) => {
    try {
      // Validate GitHub URL is provided
      if (!repo_url || repo_url.trim() === "") {
        return {
          success: false,
          error: "No GitHub repository found in database",
          message: "This company does not have a public GitHub repository",
          company_name,
        };
      }

      const repo = parseRepoUrl(repo_url);
      if (!repo) {
        return {
          success: false,
          error: "Invalid GitHub URL",
          url: repo_url,
        };
      }

      // Use Perplexity to analyze the repo instead of GitHub API
      // This avoids needing a GitHub token and rate limits
      const analysisQuery = analysis_focus === "all"
        ? `Analyze GitHub repository ${repo_url}: 
           1. Tech stack (languages, frameworks, tools)
           2. Recent development activity (commits, releases)
           3. Pain points (top issues by reactions/comments)
           4. Technical challenges (long-standing issues)
           
           Be specific with issue numbers and dates.`
        : `Analyze GitHub repository ${repo_url} focusing on: ${analysis_focus}. Be specific with issue numbers, dates, and metrics.`;

      const result = await perplexitySearch(analysisQuery, { recency: "month" });

      return {
        success: true,
        repo_owner: repo.owner,
        repo_name: repo.name,
        repo_url,
        analysis_focus,
        findings: result.content,
        sources: result.citations,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        company_name,
      };
    }
  },
});

// ============================================================================
// Tool 3: Community Sentiment Tool
// ============================================================================

const communitySentimentTool = createTool({
  name: "analyze_community_feedback",
  
  description: `Search social platforms for user feedback, pain points, and product gaps. 
  Focus on finding:
  - User complaints and frustrations
  - Missing features users wish existed
  - Workarounds and scripts users have built
  - Comparisons with competitors`,
  
  parameters: z.object({
    company_name: z.string().describe("Company name to search for"),
    platforms: z.array(
      z.enum(["reddit", "hackernews", "stackoverflow", "twitter", "producthunt"])
    ).describe("Which platforms to search"),
    search_focus: z.enum([
      "pain_points",
      "missing_features",
      "workarounds",
      "competitors",
      "all"
    ]).describe("What to focus on"),
  }),
  
  execute: async ({ company_name, platforms, search_focus }) => {
    try {
      const platformQueries: Record<string, string> = {
        reddit: `site:reddit.com "${company_name}" (problem OR issue OR bug OR missing OR wish OR frustrating)`,
        hackernews: `site:news.ycombinator.com "${company_name}" (Show HN OR Ask HN OR comment)`,
        stackoverflow: `site:stackoverflow.com "${company_name}" (error OR problem OR issue)`,
        twitter: `site:twitter.com OR site:x.com "${company_name}" (frustrating OR broken OR needs OR missing)`,
        producthunt: `site:producthunt.com "${company_name}" (review OR comment OR feedback)`,
      };

      const results: Array<{
        platform: string;
        findings: string;
        sources: string[];
      }> = [];

      // Search each platform
      for (const platform of platforms) {
        const baseQuery = platformQueries[platform] || `${company_name} ${platform}`;
        
        const focusPrompt = search_focus === "all"
          ? `From these discussions about ${company_name}, extract:
             1. Pain points: specific problems users mention
             2. Missing features: things users wish existed
             3. Workarounds: tools or scripts users built
             4. Competitor mentions: alternatives users compare to
             
             Cite specific thread URLs, comment IDs, or post titles.`
          : `From discussions about ${company_name}, focus on: ${search_focus}. Cite specific sources.`;

        const query = `${baseQuery}\n\n${focusPrompt}`;
        
        try {
          const result = await perplexitySearch(query);
          results.push({
            platform,
            findings: result.content,
            sources: result.citations,
          });
        } catch (error) {
          // Continue with other platforms if one fails
          results.push({
            platform,
            findings: `Error: ${error instanceof Error ? error.message : String(error)}`,
            sources: [],
          });
        }
      }

      return {
        success: true,
        company_name,
        search_focus,
        results,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        company_name,
      };
    }
  },
});

// ============================================================================
// Tool 4: Company Data Tool (Supabase)
// ============================================================================

const companyDataTool = createTool({
  name: "lookup_company_data",
  
  description: "Fetch company data from the YC companies database",
  
  parameters: z.object({
    company_id: z.string().describe("Company ID from URL or database"),
  }),
  
  execute: async ({ company_id }) => {
    try {
      // Note: In production, import and use the actual Supabase client
      // For now, this is a placeholder that returns an error
      // The Edge Function will handle the actual Supabase query
      
      return {
        success: false,
        error: "This tool should be called from the Edge Function with Supabase access",
        note: "The Edge Function will inject company data from the database",
        company_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        company_id,
      };
    }
  },
});

// ============================================================================
// Memory Configuration
// ============================================================================

// Initialize Supabase client for memory storage
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
}

const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// Create memory instance with Supabase storage adapter
const memory = new Memory({
  storage: new SupabaseMemoryAdapter({
    client: supabaseClient,
  }),
  workingMemory: {
    enabled: true,
    scope: "conversation",
  },
});

// ============================================================================
// Research Agent Configuration
// ============================================================================

export const researchAgent = new Agent({
  id: "company-research",
  name: "Company Research Agent",
  memory,
  
  instructions: `You are an expert Startup company research analyst conducting DEEP RESEARCH. Your goal is to uncover hidden insights, not surface-level information anyone could find in 5 minutes.

**DEEP RESEARCH METHODOLOGY (Multi-Pass Investigation):**

**Phase 1: Initial Discovery (Broad Sweep)**
1. Search for company intelligence (funding, customers, market position)
2. Analyze GitHub repository if available (tech stack, issues, activity)
3. Scan community platforms (Reddit, HN, Stack Overflow, Twitter, ProductHunt)

**Phase 2: Deep Dive on Findings (Follow-up Investigation)**
After Phase 1, identify the top 3-5 most interesting findings and:
- Search for SPECIFIC details about each finding
- Look for related discussions and threads
- Find quantitative data (user counts, frequency, severity metrics)
- Discover workarounds and user-built solutions

**Phase 3: Pain Point Validation (Evidence Building)**
For each identified pain point:
- Search for multiple independent sources confirming the issue
- Find GitHub issues with high engagement (comments, reactions, upvotes)
- Look for feature requests and roadmap discussions
- Identify competitors who have solved this problem

**Phase 4: Opportunity Analysis (Connect the Dots)**
- Cross-reference pain points with recent company priorities
- Identify gaps between user needs and current product
- Find patterns in what users are building as workarounds
- Map pain points to potential project opportunities

**Research Quality Standards:**
- MINIMUM 3-5 search passes per company (initial + follow-ups)
- Cite specific sources with URLs, issue numbers, thread IDs
- Quantify everything: "47% of users" not "many users"
- Be forensic: "Issue #234 (89 comments, 156 👍)" not "GitHub issues exist"
- Focus on ACTIONABLE problems developers can solve

**Tool Usage - Iterative Strategy:**
1. Start broad: search company intelligence, GitHub analysis, community scan
2. Identify promising threads: "Users complaining about X" → Search deeper: "X problem site:reddit.com site:stackoverflow.com"
3. Follow up on GitHub: "Issue #123 mentioned" → Search: "GitHub issue #123 [company] workarounds alternatives"
4. Validate with community: Found a pain point → Search: "[company] [pain point] alternatives solutions"
5. Build evidence: Each finding needs 2-3 independent sources

**Critical Instructions:**
- DO NOT stop after first round of searches
- When you find something interesting, IMMEDIATELY do a follow-up search
- Each pain point needs EVIDENCE (issue numbers, thread URLs, dates, metrics)
- If a search returns vague results, reformulate and search again
- Spend 60% of your effort on community feedback (Reddit, HN, SO, Twitter)
- The best insights come from ITERATION, not single queries`,

  model: anthropic("claude-3-5-sonnet-20241022"),
  
  tools: [
    perplexitySearchTool,
    githubAnalysisTool,
    communitySentimentTool,
    companyDataTool,
  ],
  
  maxSteps: 30,
  temperature: 0.4,
  markdown: false,
});

// ============================================================================
// Agent Invocation Helper
// ============================================================================

/**
 * Runs the research agent for a specific company
 */
export async function researchCompany(params: {
  companyId: string;
  companyName: string;
  githubUrl?: string | null;
  options?: {
    maxSteps?: number;
    temperature?: number;
  };
}) {
  const githubNote = params.githubUrl 
    ? `GitHub Repository: ${params.githubUrl}`
    : "Note: This company does not have a public GitHub repository in our database. Focus on community feedback and web intelligence.";

  const prompt = `Research Y Combinator company: ${params.companyName} (ID: ${params.companyId})

${githubNote}

Focus especially on:
1. Community feedback from Reddit, Hacker News, Stack Overflow
2. Specific pain points with evidence (issue numbers, thread links)
3. Product gaps and missing features
4. User workarounds and scripts

Provide comprehensive, actionable intelligence with specific citations.`;

  const result = await researchAgent.generateObject(
    prompt,
    CompanyResearchSchema,
    {
      maxSteps: params.options?.maxSteps ?? 30,
      temperature: params.options?.temperature ?? 0.4,
    }
  );

  return result.object;
}

/**
 * Streams research for a company with progressive results
 */
export async function streamResearchCompany(params: {
  companyId: string;
  companyName: string;
  githubUrl?: string | null;
  options?: {
    maxSteps?: number;
    temperature?: number;
  };
}) {
  const githubNote = params.githubUrl 
    ? `GitHub Repository: ${params.githubUrl}`
    : "Note: This company does not have a public GitHub repository in our database. Focus on community feedback and web intelligence.";

  const prompt = `Research Y Combinator company: ${params.companyName} (ID: ${params.companyId})

${githubNote}

Focus especially on:
1. Community feedback from Reddit, Hacker News, Stack Overflow
2. Specific pain points with evidence (issue numbers, thread links)
3. Product gaps and missing features
4. User workarounds and scripts

Provide comprehensive, actionable intelligence with specific citations.`;

  return await researchAgent.streamObject(
    prompt,
    CompanyResearchSchema,
    {
      maxSteps: params.options?.maxSteps ?? 30,
      temperature: params.options?.temperature ?? 0.4,
    }
  );
}
