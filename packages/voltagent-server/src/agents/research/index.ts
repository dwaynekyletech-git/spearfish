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
 * Builds a focused search query for Perplexity with optional industry context
 */
function buildSearchQuery(companyName: string, searchType: string, context?: string, industries?: string[]): string {
  const industryContext = industries && industries.length > 0 ? ` in ${industries[0]} industry` : '';
  
  // Use quotes around company name to ensure exact match
  const exactName = `"${companyName}"`;
  
  const queries: Record<string, string> = {
    funding: `${exactName} company${industryContext} latest funding round, investors, valuation, Series A B C seed`,
    customers: `${exactName} company${industryContext} notable customers, case studies, client testimonials, customer list`,
    growth: `${exactName} company${industryContext} growth metrics, revenue growth, user growth, market expansion`,
    investors: `${exactName} company${industryContext} investors, venture capital, funding backers, investment firms`,
    market_position: `${exactName} company${industryContext} market position, competitive landscape, market share, competitors`,
    recent_news: `${exactName} company${industryContext} latest news, recent announcements, press releases, product launches`,
  };

  const baseQuery = queries[searchType] || `${exactName} company${industryContext} ${searchType}`;
  return context ? `${baseQuery} ${context}` : baseQuery;
}

/**
 * Parse GitHub repo URL into owner and name
 */
function parseRepoUrl(url: string): { owner: string; name: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
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
  
  IMPORTANT: This tool requires GitHub repository data. If no repositories are available in company data, 
  the company does not have a public GitHub presence. Do NOT attempt to search for repositories.`,
  
  parameters: z.object({
    company_name: z.string().describe("Company name"),
    repo_identifier: z.string().describe("GitHub repository full_name (e.g., 'openai/gpt-3') or URL from company database"),
    analysis_focus: z.enum([
      "tech_stack",
      "recent_activity", 
      "pain_points",
      "all"
    ]).describe("What aspect to analyze"),
  }),
  
  execute: async ({ company_name, repo_identifier, analysis_focus }) => {
    try {
      // Validate GitHub identifier is provided
      if (!repo_identifier || repo_identifier.trim() === "") {
        return {
          success: false,
          error: "No GitHub repository provided",
          message: "This company does not have a public GitHub repository",
          company_name,
        };
      }

      // Convert repo_identifier to URL if it's just a full_name
      let repo_url = repo_identifier;
      if (!repo_identifier.startsWith('http')) {
        repo_url = `https://github.com/${repo_identifier}`;
      }

      const repo = parseRepoUrl(repo_url);
      if (!repo) {
        return {
          success: false,
          error: "Invalid GitHub repository identifier",
          identifier: repo_identifier,
        };
      }

      // Use Perplexity to analyze the repo instead of GitHub API
      // This avoids needing a GitHub token and rate limits
      const analysisQuery = analysis_focus === "all"
        ? `Analyze GitHub repository ${repo_url} (${repo.owner}/${repo.name}): 
           1. Tech stack (languages, frameworks, tools)
           2. Recent development activity (commits, releases, contributors)
           3. Pain points (top issues by reactions/comments)
           4. Technical challenges (long-standing issues, discussions)
           
           Be specific with issue numbers, dates, and metrics.`
        : `Analyze GitHub repository ${repo_url} (${repo.owner}/${repo.name}) focusing on: ${analysis_focus}. Be specific with issue numbers, dates, and metrics.`;

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
  - Comparisons with competitors
  - Industry-specific challenges`,
  
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
    industry_context: z.string().optional().describe("Industry or domain context to narrow search"),
  }),
  
  execute: async ({ company_name, platforms, search_focus, industry_context }) => {
    try {
      const industryKeyword = industry_context ? ` ${industry_context}` : '';
      
      // Use exact company name in quotes to avoid confusion
      const exactName = `"${company_name}"`;
      
      const platformQueries: Record<string, string> = {
        reddit: `site:reddit.com ${exactName} company${industryKeyword} (problem OR issue OR bug OR missing OR wish OR frustrating)`,
        hackernews: `site:news.ycombinator.com ${exactName} company${industryKeyword} (Show HN OR Ask HN OR comment)`,
        stackoverflow: `site:stackoverflow.com ${exactName}${industryKeyword} (error OR problem OR issue)`,
        twitter: `site:twitter.com OR site:x.com ${exactName} company${industryKeyword} (frustrating OR broken OR needs OR missing)`,
        producthunt: `site:producthunt.com ${exactName} company${industryKeyword} (review OR comment OR feedback)`,
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
    debug: true, // Enable debug logging
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
  
  // Retry configuration for handling API overload
  retries: {
    maxRetries: 3,
    initialDelayMs: 2000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
  },
  
  instructions: `You are an expert Startup company research analyst conducting DEEP RESEARCH. Your goal is to uncover hidden insights, not surface-level information anyone could find in 5 minutes.

**🚨 CRITICAL: YOU MUST RETURN A COMPLETE, VALID RESPONSE 🚨**

Your response MUST include ALL required fields in the schema:
- business_intelligence (with funding, investors, growth_metrics, customers, market_position)
- technical_landscape (with tech_stack, github_activity, pain_points, recent_releases)
- key_people (array, can be empty if not found)
- community_feedback (with pain_points, product_gaps, missing_features, user_workarounds - all arrays)
- opportunity_signals (array, can be empty if not found)
- pain_points_summary (array, can be empty if not found)

If you cannot find information for a field:
- For string fields: Use "No public information available" or similar
- For arrays: Use empty array []
- NEVER omit required fields
- NEVER return incomplete objects

**🚨 CRITICAL: ACCURACY & VERIFICATION FIRST 🚨**

BEFORE analyzing ANY search result, you MUST verify:
1. ✅ Does this result mention the EXACT company name from the prompt?
2. ✅ Does this align with the company's description, industry, and one-liner provided?
3. ✅ If unsure, search for "[company name] [industry] [key product]" to verify
4. ❌ IMMEDIATELY DISCARD results about different companies with similar names
5. ❌ REJECT generic industry information not specific to this company
6. ❌ DO NOT make assumptions - if you can't verify it, don't include it

**Company Context is GROUND TRUTH:**
- The company description, one-liner, and industries provided in the prompt are FACTS
- All research findings MUST align with this context
- If search results contradict the company context, the search results are WRONG
- When in doubt, re-search with more specific queries including the company description

**DEEP RESEARCH METHODOLOGY (Multi-Pass Investigation):**

**Phase 1: Initial Discovery & Verification (Broad Sweep)**
1. Search for company intelligence (funding, customers, market position)
2. VERIFY: Cross-check results against company description/industry
3. Analyze GitHub repository if available (tech stack, issues, activity)
4. Scan community platforms (Reddit, HN, Stack Overflow, Twitter, ProductHunt)
5. VERIFY: Ensure discussions are about THIS specific company

**Phase 2: Deep Dive on Findings (Follow-up Investigation)**
After Phase 1, identify the top 3-5 most interesting findings and:
- Search for SPECIFIC details about each finding
- Look for related discussions and threads
- Find quantitative data (user counts, frequency, severity metrics)
- Discover workarounds and user-built solutions
- VERIFY: Each finding mentions the company by name

**Phase 3: Pain Point Validation (Evidence Building)**
For each identified pain point:
- Search for multiple independent sources confirming the issue
- Find GitHub issues with high engagement (comments, reactions, upvotes)
- Look for feature requests and roadmap discussions
- Identify competitors who have solved this problem
- VERIFY: Cross-reference with company's actual product/service

**Phase 4: Opportunity Analysis (Connect the Dots)**
- Cross-reference pain points with recent company priorities
- Identify gaps between user needs and current product
- Find patterns in what users are building as workarounds
- Map pain points to potential project opportunities
- VERIFY: Opportunities align with company's industry and stage

**Research Quality Standards:**
- ACCURACY OVER QUANTITY: 5 verified facts > 20 unverified claims
- MINIMUM 3-5 search passes per company (initial + follow-ups)
- Cite specific sources with URLs, issue numbers, thread IDs
- Quantify everything: "47% of users" not "many users"
- Be forensic: "Issue #234 (89 comments, 156 👍)" not "GitHub issues exist"
- Focus on ACTIONABLE problems developers can solve
- Include company name in search results for verification

**Tool Usage - Iterative Strategy:**
1. Start broad with verification: search "[company] [one-liner] [industry]" to confirm you're researching the right company
2. Identify promising threads: "Users complaining about X" → Search deeper: "[company name] X problem site:reddit.com site:stackoverflow.com"
3. Follow up on GitHub: "Issue #123 mentioned" → Search: "GitHub issue #123 [company] workarounds alternatives"
4. Validate with community: Found a pain point → Search: "[company] [pain point] alternatives solutions"
5. Build evidence: Each finding needs 2-3 independent sources that mention the company by name

**Critical Instructions:**
- DO NOT stop after first round of searches
- When you find something interesting, IMMEDIATELY do a follow-up search
- Each pain point needs EVIDENCE (issue numbers, thread URLs, dates, metrics)
- If a search returns vague results OR mentions wrong companies, reformulate and search again
- Spend 60% of your effort on community feedback (Reddit, HN, SO, Twitter)
- The best insights come from ITERATION and VERIFICATION, not single queries
- When in doubt about relevance, search again with company name + description + finding

**RED FLAGS - Stop and re-verify if you see:**
- Search results about a different company
- Generic industry info without specific company mentions
- Contradictions with the provided company context
- No concrete sources or citations
- Information that seems off-topic for the company's industry`,

  model: anthropic("claude-3-5-sonnet-20241022"),
  
  tools: [
    perplexitySearchTool,
    githubAnalysisTool,
    communitySentimentTool,
    companyDataTool,
  ],
  
  maxSteps: 30,
  temperature: 0.2, // Lower temperature for more factual, less creative responses
  markdown: false,
});

// ============================================================================
// Agent Invocation Helper
// ============================================================================

/**
 * Runs the research agent for a specific company
 */
type GitHubRepo = {
  full_name?: string;
  name?: string;
  stargazers_count?: number;
  stars?: number;
  description?: string;
};

export async function researchCompany(params: {
  companyId: string;
  companyName: string;
  userId?: string;
  githubUrl?: string | null;
  githubRepositories?: GitHubRepo[];
  companyData?: Record<string, unknown>;
  options?: {
    maxSteps?: number;
    temperature?: number;
  };
}) {
  // Build enriched context from company data
  const companyContext: string[] = [];
  
  if (params.companyData) {
    const { one_liner, long_description, industries, batch, stage, team_size, website } = params.companyData;
    
    if (one_liner) companyContext.push(`One-liner: ${one_liner}`);
    if (long_description) companyContext.push(`Description: ${long_description}`);
    if (industries && Array.isArray(industries) && industries.length > 0) {
      companyContext.push(`Industries: ${industries.join(', ')}`);
    }
    if (batch) companyContext.push(`Y Combinator Batch: ${batch}`);
    if (stage) companyContext.push(`Stage: ${stage}`);
    if (team_size) companyContext.push(`Team Size: ${team_size}`);
    if (website) companyContext.push(`Website: ${website}`);
  }
  
  // Build GitHub context
  const githubNote = params.githubRepositories && params.githubRepositories.length > 0
    ? `GitHub Repositories (${params.githubRepositories.length} repos):\n${params.githubRepositories.slice(0, 5).map((r: GitHubRepo) => 
        `  - ${r.full_name || r.name} (${r.stargazers_count || r.stars || 0} stars)${r.description ? ': ' + r.description : ''}`
      ).join('\n')}`
    : params.githubUrl
    ? `GitHub Repository: ${params.githubUrl}`
    : "Note: This company does not have a public GitHub repository in our database. Focus on community feedback and web intelligence.";

  const contextSection = companyContext.length > 0 
    ? `\n\nCompany Context:\n${companyContext.join('\n')}\n`
    : '';

  const prompt = `Research Y Combinator company: ${params.companyName} (ID: ${params.companyId})
${contextSection}
${githubNote}

🚨 CRITICAL: You are researching "${params.companyName}".
- ONLY include information that explicitly mentions "${params.companyName}" by name
- VERIFY all findings match the company description and industry above
- If search results seem irrelevant, search again with more specific queries
- Include company name in ALL search queries to avoid confusion

Focus especially on:
1. Community feedback from Reddit, Hacker News, Stack Overflow (mentioning ${params.companyName} specifically)
2. Specific pain points with evidence (issue numbers, thread links) from ${params.companyName} users
3. Product gaps and missing features in ${params.companyName}'s product
4. User workarounds and scripts built for ${params.companyName}
5. Industry-specific challenges faced by ${params.companyName}

Provide comprehensive, actionable intelligence with specific citations that mention ${params.companyName}.`;

  // Build resource_id for memory scoping
  const resourceId = `company-research:${params.companyId}`;

  const result = await researchAgent.generateObject(
    prompt,
    CompanyResearchSchema,
    {
      maxSteps: params.options?.maxSteps ?? 30,
      temperature: params.options?.temperature ?? 0.4,
      userId: params.userId, // Pass userId for memory association
      resourceId, // Pass resourceId for conversation scoping
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
  userId?: string;
  githubUrl?: string | null;
  githubRepositories?: GitHubRepo[];
  companyData?: Record<string, unknown>;
  options?: {
    maxSteps?: number;
    temperature?: number;
  };
}) {
  // Build enriched context from company data
  const companyContext: string[] = [];
  
  if (params.companyData) {
    const { one_liner, long_description, industries, batch, stage, team_size, website } = params.companyData;
    
    if (one_liner) companyContext.push(`One-liner: ${one_liner}`);
    if (long_description) companyContext.push(`Description: ${long_description}`);
    if (industries && Array.isArray(industries) && industries.length > 0) {
      companyContext.push(`Industries: ${industries.join(', ')}`);
    }
    if (batch) companyContext.push(`Y Combinator Batch: ${batch}`);
    if (stage) companyContext.push(`Stage: ${stage}`);
    if (team_size) companyContext.push(`Team Size: ${team_size}`);
    if (website) companyContext.push(`Website: ${website}`);
  }
  
  // Build GitHub context
  const githubNote = params.githubRepositories && params.githubRepositories.length > 0
    ? `GitHub Repositories (${params.githubRepositories.length} repos):\n${params.githubRepositories.slice(0, 5).map(r => 
        `  - ${r.full_name || r.name} (${r.stargazers_count || r.stars || 0} stars)${r.description ? ': ' + r.description : ''}`
      ).join('\n')}`
    : params.githubUrl
    ? `GitHub Repository: ${params.githubUrl}`
    : "Note: This company does not have a public GitHub repository in our database. Focus on community feedback and web intelligence.";

  const contextSection = companyContext.length > 0 
    ? `\n\nCompany Context:\n${companyContext.join('\n')}\n`
    : '';

  const prompt = `Research Y Combinator company: ${params.companyName} (ID: ${params.companyId})
${contextSection}
${githubNote}

🚨 CRITICAL: You are researching "${params.companyName}".
- ONLY include information that explicitly mentions "${params.companyName}" by name
- VERIFY all findings match the company description and industry above
- If search results seem irrelevant, search again with more specific queries
- Include company name in ALL search queries to avoid confusion

Focus especially on:
1. Community feedback from Reddit, Hacker News, Stack Overflow (mentioning ${params.companyName} specifically)
2. Specific pain points with evidence (issue numbers, thread links) from ${params.companyName} users
3. Product gaps and missing features in ${params.companyName}'s product
4. User workarounds and scripts built for ${params.companyName}
5. Industry-specific challenges faced by ${params.companyName}

Provide comprehensive, actionable intelligence with specific citations that mention ${params.companyName}.`;

  console.log('📝 Research prompt:', prompt.substring(0, 500) + '...');

  // Build resource_id for memory scoping
  const resourceId = `company-research:${params.companyId}`;
  
  // Generate or reuse conversationId based on resourceId
  // VoltAgent will create a new conversation if it doesn't exist
  const conversationId = resourceId; // Use resourceId as conversationId for single conversation per company
  
  console.log('💾 Memory context:', { userId: params.userId, resourceId, conversationId });

  return await researchAgent.streamObject(
    prompt,
    CompanyResearchSchema,
    {
      maxSteps: params.options?.maxSteps ?? 30,
      temperature: params.options?.temperature ?? 0.4,
      userId: params.userId, // Pass userId for memory association
      resourceId, // Pass resourceId for conversation scoping
      conversationId, // CRITICAL: Required to create conversation in database
    }
  );
}
