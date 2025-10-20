import { z } from "zod";

/**
 * Company Research Schema
 * 
 * This schema defines the structured output format for the research agent.
 * It matches the UI requirements in src/pages/Research.tsx and includes
 * all necessary fields for comprehensive company intelligence.
 */

// ============================================================================
// Business Intelligence
// ============================================================================

export const BusinessIntelligenceSchema = z.object({
  funding: z.string().describe("Latest funding round with amount and lead investor (e.g., '$15M Series A led by Sequoia Capital')"),
  
  investors: z.array(z.string()).describe("List of key investors and VC firms"),
  
  growth_metrics: z.string().describe("Growth trajectory with specific metrics (e.g., '300% YoY revenue growth, 50K+ active users')"),
  
  customers: z.array(z.string()).describe("Notable customers and case studies"),
  
  market_position: z.string().describe("Market positioning and competitive landscape summary"),
});

export type BusinessIntelligence = z.infer<typeof BusinessIntelligenceSchema>;

// ============================================================================
// Technical Landscape
// ============================================================================

export const TechnicalPainPointSchema = z.object({
  title: z.string().describe("Concise problem title"),
  
  severity: z.enum(["critical", "high", "medium", "low"]).describe("Severity level based on impact and frequency"),
  
  description: z.string().describe("Detailed description with specific evidence (GitHub issue #, user complaints, etc.)"),
});

export const TechnicalLandscapeSchema = z.object({
  tech_stack: z.array(z.string()).describe("Technologies, languages, frameworks, and tools used"),
  
  github_activity: z.string().describe("Summary of GitHub activity: commit frequency, contributors, recent releases"),
  
  pain_points: z.array(TechnicalPainPointSchema).describe("Technical pain points extracted from GitHub issues, discussions, and user reports"),
  
  recent_releases: z.array(z.string()).describe("Recent software releases with dates and key features"),
});

export type TechnicalLandscape = z.infer<typeof TechnicalLandscapeSchema>;
export type TechnicalPainPoint = z.infer<typeof TechnicalPainPointSchema>;

// ============================================================================
// Key People
// ============================================================================

export const KeyPersonSchema = z.object({
  name: z.string().describe("Full name"),
  
  role: z.string().describe("Job title (e.g., 'CTO & Co-founder', 'VP of Engineering')"),
  
  interests: z.array(z.string()).describe("Professional interests and expertise areas"),
  
  recent_activity: z.string().describe("Recent public activities: conference talks, blog posts, tweets, hiring announcements"),
});

export type KeyPerson = z.infer<typeof KeyPersonSchema>;

// ============================================================================
// Community Feedback (NEW - Key Addition)
// ============================================================================

export const CommunityFeedbackSchema = z.object({
  pain_points: z.array(z.string()).describe("User-reported pain points from Reddit, HN, Stack Overflow (cite specific threads)"),
  
  product_gaps: z.array(z.string()).describe("Missing features users wish existed (cite discussions)"),
  
  missing_features: z.array(z.string()).describe("Features competitors have but this product lacks"),
  
  user_workarounds: z.array(z.string()).describe("Tools, scripts, or hacks users built to solve problems (cite examples)"),
});

export type CommunityFeedback = z.infer<typeof CommunityFeedbackSchema>;

// ============================================================================
// Opportunity Signals
// ============================================================================

export const OpportunitySignalSchema = z.object({
  signal: z.string().describe("Signal name (e.g., 'Active Hiring', 'Recent Funding', 'Technical Challenges')"),
  
  description: z.string().describe("Detailed description with evidence"),
  
  urgency: z.enum(["high", "medium", "low"]).describe("Urgency level indicating how time-sensitive this opportunity is"),
});

export type OpportunitySignal = z.infer<typeof OpportunitySignalSchema>;

// ============================================================================
// Pain Points Summary (Most Important Section)
// ============================================================================

export const PainPointSummaryItemSchema = z.object({
  problem: z.string().describe("Clear, specific problem statement"),
  
  severity: z.enum(["critical", "high", "medium", "low"]).describe("Severity based on impact, frequency, and user frustration"),
  
  evidence: z.string().describe("Concrete evidence: GitHub issue numbers, Reddit post links, HN comments, Stack Overflow questions, number of affected users"),
  
  potential_solution: z.string().describe("Specific project idea that could solve this problem (e.g., 'Build WebSocket optimization library', 'Create mobile-first component kit')"),
});

export type PainPointSummaryItem = z.infer<typeof PainPointSummaryItemSchema>;

// ============================================================================
// Complete Company Research Output
// ============================================================================

export const CompanyResearchSchema = z.object({
  business_intelligence: BusinessIntelligenceSchema,
  
  technical_landscape: TechnicalLandscapeSchema,
  
  key_people: z.array(KeyPersonSchema).describe("Leadership team and key technical personnel"),
  
  community_feedback: CommunityFeedbackSchema.describe("CRITICAL: User pain points and product gaps from social platforms"),
  
  opportunity_signals: z.array(OpportunitySignalSchema).describe("Signals indicating hiring, funding, technical challenges, visibility"),
  
  pain_points_summary: z.array(PainPointSummaryItemSchema).describe("MOST IMPORTANT: Prioritized, actionable pain points with evidence and project opportunities"),
});

export type CompanyResearch = z.infer<typeof CompanyResearchSchema>;

// ============================================================================
// Helper Types for API Responses
// ============================================================================

/**
 * Research request input
 */
export const ResearchRequestSchema = z.object({
  company_id: z.string().describe("Company ID from database"),
  company_name: z.string().describe("Company name for search queries"),
  user_id: z.string().optional().describe("User ID for personalization (optional)"),
  focus_areas: z.array(
    z.enum([
      "all",
      "business",
      "technical",
      "community",
      "people",
      "opportunities",
    ])
  ).optional().describe("Specific focus areas (defaults to 'all')"),
});

export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;

/**
 * Streaming progress updates
 */
export const ResearchProgressSchema = z.object({
  stage: z.enum([
    "initializing",
    "searching_business_intel",
    "analyzing_github",
    "gathering_community_feedback",
    "researching_key_people",
    "identifying_opportunities",
    "synthesizing_results",
    "complete",
  ]),
  message: z.string().describe("Human-readable progress message"),
  progress_percent: z.number().min(0).max(100).describe("Progress percentage"),
});

export type ResearchProgress = z.infer<typeof ResearchProgressSchema>;

/**
 * Error response
 */
export const ResearchErrorSchema = z.object({
  error: z.string().describe("Error message"),
  code: z.string().optional().describe("Error code"),
  details: z.any().optional().describe("Additional error details"),
});

export type ResearchError = z.infer<typeof ResearchErrorSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates that a company research object meets all requirements
 */
export function validateCompanyResearch(data: unknown): CompanyResearch {
  return CompanyResearchSchema.parse(data);
}

/**
 * Partial validation for streaming updates
 */
export function validatePartialCompanyResearch(data: unknown): Partial<CompanyResearch> {
  return CompanyResearchSchema.partial().parse(data);
}

/**
 * Type guard for research errors
 */
export function isResearchError(data: unknown): data is ResearchError {
  return ResearchErrorSchema.safeParse(data).success;
}

// ============================================================================
// Example Usage
// ============================================================================

/*
Example agent invocation:

```typescript
import { CompanyResearchSchema } from "./schema";
import { Agent } from "@voltagent/core";

const researchAgent = new Agent({
  // ... agent config
});

const result = await researchAgent.generateObject(
  "Research Y Combinator company: Stripe (ID: stripe-123)",
  CompanyResearchSchema,
  {
    maxSteps: 20,
    temperature: 0.3,
  }
);

// Fully typed result
const research: CompanyResearch = result.object;
console.log(research.business_intelligence.funding);
console.log(research.community_feedback.pain_points);
console.log(research.pain_points_summary[0].potential_solution);
```

Example streaming:

```typescript
const stream = await researchAgent.streamObject(
  "Research Y Combinator company: Notion (ID: notion-456)",
  CompanyResearchSchema
);

for await (const partial of stream.partialObjectStream) {
  // partial is Partial<CompanyResearch>
  if (partial.business_intelligence) {
    console.log("Got business intel:", partial.business_intelligence);
  }
  if (partial.community_feedback) {
    console.log("Got community feedback:", partial.community_feedback);
  }
}

const finalResearch: CompanyResearch = await stream.object;
```
*/
