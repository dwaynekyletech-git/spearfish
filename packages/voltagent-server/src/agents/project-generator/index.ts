import { Agent, createTool, Memory } from "@voltagent/core";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { ProjectIdeasResponseSchema, type ProjectGeneratorInput } from "./schema";
import { SupabaseMemoryAdapter } from "@voltagent/supabase";
import { createClient } from "@supabase/supabase-js";

// ============================================================================
// Tool 1: Analyze Company Research
// ============================================================================

const analyzeResearchTool = createTool({
  name: "analyze_company_research",
  
  description: `Extract and prioritize pain points, technical challenges, and opportunities from company research data.
  Use this tool FIRST to understand the company's problems before generating project ideas.
  
  This tool processes the output from the company research agent and identifies:
  - High-severity pain points with concrete evidence
  - Technical challenges from GitHub and community feedback
  - Opportunity signals (hiring, funding, growth)
  - Product gaps and missing features`,
  
  parameters: z.object({
    company_name: z.string().describe("Company name for context"),
    pain_points_summary: z.array(z.object({
      problem: z.string(),
      severity: z.enum(["critical", "high", "medium", "low"]),
      evidence: z.string(),
      potential_solution: z.string(),
    })).describe("Prioritized pain points from research agent"),
    technical_landscape: z.any().optional().describe("Technical landscape data"),
    community_feedback: z.any().optional().describe("Community feedback data"),
  }),
  
  execute: async ({ company_name, pain_points_summary, technical_landscape, community_feedback }) => {
    try {
      // Extract critical and high-severity pain points
      const highPriorityPoints = pain_points_summary.filter(
        p => p.severity === "critical" || p.severity === "high"
      );
      
      // Extract technical pain points if available
      const technicalPainPoints = technical_landscape?.pain_points || [];
      
      // Extract community-reported issues
      const communityIssues = [
        ...(community_feedback?.pain_points || []),
        ...(community_feedback?.product_gaps || []),
        ...(community_feedback?.missing_features || []),
      ];
      
      // Identify user workarounds (indicate unmet needs)
      const workarounds = community_feedback?.user_workarounds || [];
      
      return {
        success: true,
        company_name,
        high_priority_pain_points: highPriorityPoints,
        technical_pain_points: technicalPainPoints,
        community_issues: communityIssues,
        user_workarounds: workarounds,
        recommendation: highPriorityPoints.length > 0
          ? `Focus on solving ${highPriorityPoints[0].problem} - highest severity issue with clear evidence`
          : "No critical pain points identified - focus on product enhancements",
        total_pain_points: pain_points_summary.length,
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
// Tool 2: Match User Skills
// ============================================================================

const matchSkillsTool = createTool({
  name: "match_user_skills",
  
  description: `Cross-reference user's skills and interests against company's technical needs.
  Use this tool AFTER analyzing research to ensure project ideas match user capabilities.
  
  This identifies:
  - Technologies the user already knows (100% match)
  - Related skills the user can leverage (70-90% match)
  - Slight stretch technologies (50-70% match - good learning opportunity)
  - Alignment with career interests and target roles`,
  
  parameters: z.object({
    user_skills: z.array(z.string()).describe("User's technical skills"),
    company_tech_stack: z.array(z.string()).describe("Company's tech stack from research"),
    career_interests: z.array(z.string()).optional().describe("User's career focus areas"),
    target_roles: z.array(z.string()).optional().describe("User's desired job titles"),
  }),
  
  execute: async ({ user_skills, company_tech_stack, career_interests, target_roles }) => {
    try {
      // Normalize skills for matching (lowercase, remove special chars)
      const normalizeSkill = (skill: string) => 
        skill.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const userSkillsNormalized = user_skills.map(normalizeSkill);
      const companyStackNormalized = company_tech_stack.map(normalizeSkill);
      
      // Find exact matches
      const exactMatches: string[] = [];
      const relatedMatches: string[] = [];
      const learningOpportunities: string[] = [];
      
      company_tech_stack.forEach((companyTech, idx) => {
        const normalized = companyStackNormalized[idx];
        
        if (userSkillsNormalized.includes(normalized)) {
          exactMatches.push(companyTech);
        } else {
          // Check for partial matches (e.g., "react" matches "reactjs")
          const hasPartialMatch = userSkillsNormalized.some(userSkill => 
            userSkill.includes(normalized) || normalized.includes(userSkill)
          );
          
          if (hasPartialMatch) {
            relatedMatches.push(companyTech);
          } else {
            learningOpportunities.push(companyTech);
          }
        }
      });
      
      // Calculate overall skill match percentage
      const totalRelevantTech = company_tech_stack.length;
      const matchScore = totalRelevantTech > 0
        ? Math.round(((exactMatches.length + relatedMatches.length * 0.5) / totalRelevantTech) * 100)
        : 0;
      
      return {
        success: true,
        match_score: matchScore,
        exact_matches: exactMatches,
        related_matches: relatedMatches,
        learning_opportunities: learningOpportunities,
        career_alignment: {
          interests: career_interests || [],
          target_roles: target_roles || [],
        },
        recommendation: matchScore >= 70
          ? "Strong skill match - user can hit the ground running"
          : matchScore >= 40
          ? "Moderate match - good learning opportunity with existing foundation"
          : "Lower match - significant learning curve but achievable",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

// ============================================================================
// Tool 3: Evaluate Project Feasibility
// ============================================================================

const evaluateFeasibilityTool = createTool({
  name: "evaluate_project_feasibility",
  
  description: `Evaluate a project idea for feasibility, impact, and user fit.
  Use this tool to score and validate project concepts before finalizing recommendations.
  
  Scoring criteria:
  - Technical feasibility (1-10): Can this be built in reasonable timeframe?
  - Impact potential (1-10): How much value does this create?
  - Skill alignment (1-10): Does it match user's capabilities?
  - Portfolio value (1-10): How impressive is this project?`,
  
  parameters: z.object({
    project_title: z.string().describe("Project title"),
    problem_solved: z.string().describe("Problem this project addresses"),
    required_technologies: z.array(z.string()).describe("Tech stack needed"),
    time_estimate: z.string().describe("Estimated time to complete"),
    user_skill_match: z.number().describe("User's skill match percentage (0-100)"),
    pain_point_severity: z.enum(["critical", "high", "medium", "low"]).describe("Severity of problem being solved"),
  }),
  
  execute: async ({ 
    project_title, 
    problem_solved, 
    required_technologies, 
    time_estimate,
    user_skill_match,
    pain_point_severity 
  }) => {
    try {
      // Parse time estimate to weeks
      const timeMatch = time_estimate.match(/(\d+).*week/i);
      const estimatedWeeks = timeMatch ? parseInt(timeMatch[1]) : 2;
      
      // Technical feasibility: inversely related to complexity
      const complexityScore = required_technologies.length > 5 ? 6 : 8;
      const timeScore = estimatedWeeks <= 3 ? 9 : estimatedWeeks <= 6 ? 7 : 5;
      const technicalFeasibility = Math.round((complexityScore + timeScore) / 2);
      
      // Impact potential: based on pain point severity
      const severityScores = { critical: 10, high: 8, medium: 6, low: 4 };
      const impactPotential = severityScores[pain_point_severity];
      
      // Skill alignment: based on match percentage
      const skillAlignment = Math.round(user_skill_match / 10);
      
      // Portfolio value: combination of technical challenge and impact
      const portfolioValue = Math.round((complexityScore + impactPotential) / 2);
      
      // Overall score (weighted average)
      const overallScore = Math.round(
        (technicalFeasibility * 0.25 + 
         impactPotential * 0.35 + 
         skillAlignment * 0.25 + 
         portfolioValue * 0.15)
      );
      
      return {
        success: true,
        project_title,
        scores: {
          technical_feasibility: technicalFeasibility,
          impact_potential: impactPotential,
          skill_alignment: skillAlignment,
          portfolio_value: portfolioValue,
          overall: overallScore,
        },
        recommendation: overallScore >= 8
          ? "Excellent project - highly recommended"
          : overallScore >= 6
          ? "Good project - solid choice"
          : "Consider if aligned with specific goals",
        estimated_weeks: estimatedWeeks,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        project_title,
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
// Project Generator Agent Configuration
// ============================================================================

export const projectGeneratorAgent = new Agent({
  id: "project-generator",
  name: "Project Ideas Generator",
  memory,
  
  instructions: `You are an expert technical mentor

**YOUR MISSION:**
Generate 3-5 highly specific, actionable project ideas that:
1. Solve REAL problems faced by the target company (based on research)
2. Match the user's skill level and career interests
3. Can be completed in 1-4 weeks
4. Demonstrate technical depth and real-world problem-solving
5. Stand out in a portfolio when applying to this company

**CRITICAL REQUIREMENTS:**

**1. Problem-First Approach**
- Every project MUST address a specific pain point from the research data
- Use actual evidence (GitHub issues, user complaints, missing features)
- Reference concrete problems, not generic improvements
- The company should immediately recognize: "Yes, we need this!"

**2. Skill Alignment**
- Prioritize technologies the user ALREADY knows
- Include 1-2 stretch technologies as learning opportunities
- Match the company's tech stack when possible
- Ensure feasibility for user's skill level

**3. Impact-Driven Design**
- Focus on measurable outcomes (e.g., "reduce latency by 60%", "handle 10x more users")
- Address high-severity pain points first
- Create portfolio pieces that demonstrate real-world thinking
- Show understanding of the company's business and users

**4. Specificity is Key**
- Vague: "Build a better dashboard"
- Specific: "Build a real-time WebSocket connection pool manager that reduces concurrent user latency by 60%"
- Vague: "Improve mobile experience"
- Specific: "Create a mobile-first component library with touch-optimized interactions and progressive enhancement"

**WORKFLOW:**

**Step 1: Analyze Research** (Use analyze_company_research tool)
- Review all pain points, especially critical and high severity
- Identify technical challenges from GitHub issues
- Note community-reported problems and workarounds
- Prioritize problems with concrete evidence

**Step 2: Match Skills** (Use match_user_skills tool)
- Compare user's skills against company's tech stack
- Identify exact matches (100% confidence)
- Find related skills (learning opportunities)
- Consider career interests and target roles

**Step 3: Generate Concepts**
- Create 5-7 initial project ideas mapping pain points to solutions
- Each idea should reference specific problems from research
- Vary impact levels: 2-3 high-impact, 2-3 medium, 1 low
- Include implementation approach and tech stack

**Step 4: Evaluate & Rank** (Use evaluate_project_feasibility tool)
- Score each project on feasibility, impact, skill match, portfolio value
- Rank projects by overall score
- Select top 3-5 for final output
- Ensure variety in time commitment and difficulty

**OUTPUT REQUIREMENTS:**

For each project idea, provide:
- **Title**: Compelling, specific (not generic)
- **Problem Solved**: Reference actual pain point from research
- **Description**: Technical approach in 2-3 sentences
- **Impact Level**: critical/high/medium/low (match pain point severity)
- **Technologies**: Specific stack (prioritize user's known skills)
- **Time Estimate**: Realistic (1-4 weeks)
- **Expected Impact**: First-person quantifiable statement
- **Implementation Approach**: 3-5 step roadmap
- **Skill Match Score**: 0-100% alignment with user skills
- **Portfolio Value**: Why this stands out

**Plus:**
- **Recommendation Summary**: Why the top project is the best fit
- **Skill Gaps**: Technologies user might need to learn

**QUALITY STANDARDS:**
- Every project references specific evidence from research
- No generic "build a dashboard" or "improve performance" ideas
- Realistic time estimates (1-4 weeks, not 6 months)
- Clear connection between problem and solution
- Technologies align with user's skills (70%+ match preferred)
- Impact statements are quantifiable and compelling

**REMEMBER:**
- These projects are portfolio pieces for job applications
- The company should think: "This person understands our business"
- Developers should think: "I can build this and learn from it"
- Recruiters should think: "This shows real-world problem-solving"

**🚨 CRITICAL: YOU MUST RETURN A COMPLETE, VALID RESPONSE 🚨**
Your response MUST include ALL required fields in the schema:
- project_ideas (object) with field: ideas (array of 3-5 ProjectIdea items)
- recommendation_summary (string)
- skill_gaps_identified (array, can be empty if none)

If you cannot fill a field:
- For string fields: Use a clear placeholder like "No recommendation available"
- For arrays: Use []
- NEVER omit required fields
- NEVER return stringified JSON. Arrays and objects MUST be actual JSON structures (no quotes around them)
- Return only valid JSON (no markdown, no code fences)
`,

  model: anthropic("claude-3-5-sonnet-20241022"),
  
  tools: [
    analyzeResearchTool,
    matchSkillsTool,
    evaluateFeasibilityTool,
  ],
  
  maxSteps: 15,
  temperature: 0.4, // Balanced between creativity and precision
  markdown: false,
});

// ============================================================================
// Agent Invocation Helpers
// ============================================================================

/**
 * Generate project ideas for a user and company
 */
export async function generateProjectIdeas(params: ProjectGeneratorInput & {
  options?: {
    maxSteps?: number;
    temperature?: number;
  };
}) {
  const { company_id, company_name, user_profile, company_research, github_url, options } = params;
  
  // Build context-rich prompt
  const prompt = `Generate personalized project ideas for a developer applying to ${company_name}.

**Company:** ${company_name} (ID: ${company_id})
${github_url ? `**GitHub:** ${github_url}` : ''}

**User Profile:**
- Skills: ${user_profile.skills.join(', ')}
${user_profile.career_interests ? `- Career Interests: ${user_profile.career_interests.join(', ')}` : ''}
${user_profile.target_roles ? `- Target Roles: ${user_profile.target_roles.join(', ')}` : ''}

**Company Research Summary:**
- Pain Points: ${company_research.pain_points_summary?.length || 0} identified
- Technical Stack: ${company_research.technical_landscape?.tech_stack?.join(', ') || 'Not specified'}
- Community Issues: ${company_research.community_feedback?.pain_points?.length || 0} reported

**Your Task:**
1. Analyze the research data to identify high-impact problems
2. Match user's skills against company's technical needs
3. Generate 3-5 specific project ideas that solve real problems
4. Ensure projects are achievable in 1-4 weeks
5. Rank by impact and skill alignment

Focus on projects that would impress this company's hiring team.`;

  // Build resource_id for memory scoping
  const resourceId = `project-ideas:${company_id}:${user_profile.user_id}`;
  
  const result = await projectGeneratorAgent.generateObject(
    prompt,
    ProjectIdeasResponseSchema,
    {
      maxSteps: options?.maxSteps ?? 15,
      temperature: options?.temperature ?? 0.4,
      userId: user_profile.user_id,
      // Pass structured data as context (VoltAgent will serialize this)
      context: {
        companyResearch: company_research,
        userProfile: user_profile,
      },
    }
  );
  
  return result.object;
}

/**
 * Stream project ideas generation with progressive results
 */
export async function streamProjectIdeas(params: ProjectGeneratorInput & {
  options?: {
    maxSteps?: number;
    temperature?: number;
  };
}) {
  const { company_id, company_name, user_profile, company_research, github_url, options } = params;
  
  // Build context-rich prompt
  const prompt = `Generate personalized project ideas for a developer applying to ${company_name}.

**Company:** ${company_name} (ID: ${company_id})
${github_url ? `**GitHub:** ${github_url}` : ''}

**User Profile:**
- Skills: ${user_profile.skills.join(', ')}
${user_profile.career_interests ? `- Career Interests: ${user_profile.career_interests.join(', ')}` : ''}
${user_profile.target_roles ? `- Target Roles: ${user_profile.target_roles.join(', ')}` : ''}

**Company Research Summary:**
- Pain Points: ${company_research.pain_points_summary?.length || 0} identified
- Technical Stack: ${company_research.technical_landscape?.tech_stack?.join(', ') || 'Not specified'}
- Community Issues: ${company_research.community_feedback?.pain_points?.length || 0} reported

**Your Task:**
1. Analyze the research data to identify high-impact problems
2. Match user's skills against company's technical needs
3. Generate 3-5 specific project ideas that solve real problems
4. Ensure projects are achievable in 1-4 weeks
5. Rank by impact and skill alignment

Focus on projects that would impress this company's hiring team.`;

  console.log('📝 Project generation prompt:', prompt.substring(0, 500) + '...');
  
  // Build resource_id for memory scoping
  const resourceId = `project-ideas:${company_id}:${user_profile.user_id}`;
  const conversationId = resourceId; // Use resourceId as conversationId
  
  console.log('💾 Memory context:', { userId: user_profile.user_id, resourceId, conversationId });
  
  const result = await projectGeneratorAgent.streamObject(
    prompt,
    ProjectIdeasResponseSchema,
    {
      maxSteps: options?.maxSteps ?? 15,
      temperature: options?.temperature ?? 0.4,
      userId: user_profile.user_id,
      conversationId,
    }
  );
  
  return result;
}
