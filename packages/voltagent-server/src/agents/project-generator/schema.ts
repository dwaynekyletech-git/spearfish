import { z } from "zod";

/**
 * Project Ideas Schema
 * 
 * This schema defines the structured output format for the project generator agent.
 * It matches the UI requirements in src/pages/ProjectIdeas.tsx and the database
 * structure of the project_ideas table.
 */

// ============================================================================
// Project Idea Schema
// ============================================================================

export const ProjectIdeaSchema = z.object({
  title: z.string().describe("Clear, compelling project title (e.g., 'Real-time Collaboration Performance Optimizer')"),
  
  problem_solved: z.string().describe("Specific problem this project addresses (reference pain point from research)"),
  
  description: z.string().describe("Detailed technical approach: architecture, key features, implementation strategy (2-3 sentences)"),
  
  impact_level: z.enum(["critical", "high", "medium", "low"]).describe("Impact level based on pain point severity, user demand, and strategic value"),
  
  technologies: z.array(z.string()).describe("Specific tech stack needed (languages, frameworks, tools) - match user's skills when possible"),
  
  time_estimate: z.string().describe("Realistic time investment (e.g., '2-3 weeks', '1 month')"),
  
  expected_impact: z.string().describe("Quantifiable impact statement in first-person (e.g., 'I reduced latency by 60% and increased capacity by 3x')"),
  
  implementation_approach: z.string().describe("Step-by-step implementation roadmap (3-5 key phases)"),
  
  skill_match_score: z.number().min(0).max(100).describe("How well this project matches user's skills (0-100%)"),
  
  portfolio_value: z.string().describe("Why this project stands out in a portfolio (technical complexity, real-world impact, uniqueness)"),
});

export type ProjectIdea = z.infer<typeof ProjectIdeaSchema>;

// ============================================================================
// Project Ideas Response (Agent Output)
// ============================================================================

// Wrap project ideas in a nested object to avoid top-level array issues with Claude
export const ProjectIdeasCollectionSchema = z.object({
  ideas: z.array(ProjectIdeaSchema)
    .min(3)
    .max(5)
    .describe("3-5 tailored project ideas, ranked by impact and skill match"),
});

export const ProjectIdeasResponseSchema = z.object({
  project_ideas: ProjectIdeasCollectionSchema.describe("Collection of project ideas with ranking"),
  
  recommendation_summary: z.string().describe("Executive summary: top recommendation and why it's the best fit for this user"),
  
  skill_gaps_identified: z.array(z.string()).optional().describe("Skills the user might need to learn for these projects"),
});

export type ProjectIdeasResponse = z.infer<typeof ProjectIdeasResponseSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * User profile for personalization
 */
export const UserProfileSchema = z.object({
  user_id: z.string().describe("Clerk user ID"),
  skills: z.array(z.string()).describe("User's technical skills (languages, frameworks, tools)"),
  career_interests: z.array(z.string()).optional().describe("Career focus areas"),
  target_roles: z.array(z.string()).optional().describe("Desired job titles"),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Company research data (from research agent)
 */
export const CompanyResearchInputSchema = z.object({
  business_intelligence: z.any().optional(),
  technical_landscape: z.any().optional(),
  key_people: z.any().optional(),
  community_feedback: z.any().optional(),
  opportunity_signals: z.any().optional(),
  pain_points_summary: z.array(z.object({
    problem: z.string(),
    severity: z.enum(["critical", "high", "medium", "low"]),
    evidence: z.string(),
    potential_solution: z.string(),
  })).describe("CRITICAL: Prioritized pain points from research agent"),
});

export type CompanyResearchInput = z.infer<typeof CompanyResearchInputSchema>;

/**
 * Complete input for project generator agent
 */
export const ProjectGeneratorInputSchema = z.object({
  company_id: z.string().describe("Company UUID"),
  company_name: z.string().describe("Company name for context"),
  user_profile: UserProfileSchema.describe("User's skills and interests for personalization"),
  company_research: CompanyResearchInputSchema.describe("Research data from company research agent"),
  github_url: z.string().optional().describe("GitHub repository URL for additional context"),
});

export type ProjectGeneratorInput = z.infer<typeof ProjectGeneratorInputSchema>;

// ============================================================================
// Progress Updates (for streaming)
// ============================================================================

export const ProjectGenerationProgressSchema = z.object({
  stage: z.enum([
    "initializing",
    "analyzing_pain_points",
    "matching_user_skills",
    "generating_concepts",
    "evaluating_feasibility",
    "ranking_ideas",
    "complete",
  ]),
  message: z.string().describe("Human-readable progress message"),
  progress_percent: z.number().min(0).max(100).describe("Progress percentage"),
});

export type ProjectGenerationProgress = z.infer<typeof ProjectGenerationProgressSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates project ideas response
 */
export function validateProjectIdeas(data: unknown): ProjectIdeasResponse {
  return ProjectIdeasResponseSchema.parse(data);
}

/**
 * Partial validation for streaming
 */
export function validatePartialProjectIdeas(data: unknown): Partial<ProjectIdeasResponse> {
  return ProjectIdeasResponseSchema.partial().parse(data);
}

// ============================================================================
// Database Mapping Helpers
// ============================================================================

/**
 * Transforms ProjectIdea to database insert format
 */
export function projectIdeaToDbFormat(
  idea: ProjectIdea,
  userId: string,
  companyId: string,
  conversationId?: string
) {
  return {
    user_id: userId,
    company_id: companyId,
    title: idea.title,
    description: idea.description,
    impact_level: idea.impact_level,
    technologies: idea.technologies,
    time_estimate: idea.time_estimate,
    expected_impact: idea.expected_impact,
    conversation_id: conversationId || null,
    // Additional metadata stored in JSONB if needed
    metadata: {
      problem_solved: idea.problem_solved,
      implementation_approach: idea.implementation_approach,
      skill_match_score: idea.skill_match_score,
      portfolio_value: idea.portfolio_value,
    },
  };
}

// ============================================================================
// Example Usage
// ============================================================================

/*
Example agent invocation:

```typescript
import { ProjectIdeasResponseSchema, ProjectGeneratorInputSchema } from "./schema";
import { Agent } from "@voltagent/core";

const projectAgent = new Agent({
  // ... agent config
});

const result = await projectAgent.streamObject(
  "Generate project ideas for this user and company",
  ProjectIdeasResponseSchema,
  {
    maxSteps: 15,
    temperature: 0.4,
  }
);

for await (const partial of result.partialObjectStream) {
  if (partial.project_ideas) {
    console.log("Got project ideas:", partial.project_ideas);
  }
}

const finalIdeas: ProjectIdeasResponse = await result.object;
console.log(finalIdeas.project_ideas[0].title);
console.log(finalIdeas.recommendation_summary);
```
*/
