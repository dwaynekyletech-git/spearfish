import { Agent, Memory } from "@voltagent/core";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { 
  EmailOutreachResponseSchema, 
  type EmailGeneratorInput,
  type UserProfileInput,
  type CompanyInput,
  type CompanyResearchInput,
  type ProjectInput,
} from "./schema.js";
import { SupabaseMemoryAdapter } from "@voltagent/supabase";
import { createClient } from "@supabase/supabase-js";

// ============================================================================
// Supabase Client Setup
// ============================================================================

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
}

const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// ============================================================================
// Data Fetching Functions
// ============================================================================

/**
 * Fetch user profile from Supabase
 */
async function fetchUserProfile(userId: string): Promise<UserProfileInput | null> {
  const { data, error } = await supabaseClient
    .from('users')
    .select('user_id, full_name, skills, career_interests, target_roles')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return {
    user_id: data.user_id,
    full_name: data.full_name || undefined,
    skills: data.skills || [],
    career_interests: data.career_interests || undefined,
    target_roles: data.target_roles || undefined,
  };
}

/**
 * Fetch company data from Supabase
 */
async function fetchCompany(companyId: string): Promise<CompanyInput | null> {
  const { data, error } = await supabaseClient
    .from('companies')
    .select('id, name, website, one_liner, industries, batch')
    .eq('id', companyId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching company:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    website: data.website || undefined,
    one_liner: data.one_liner || undefined,
    industries: data.industries || undefined,
    batch: data.batch || undefined,
  };
}

/**
 * Fetch company research from Supabase
 */
async function fetchCompanyResearch(userId: string, companyId: string): Promise<CompanyResearchInput | null> {
  const { data, error } = await supabaseClient
    .from('company_research')
    .select('business_intel, technical_landscape, key_people, opportunity_signals, pain_points')
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) {
    console.warn('No company research found, continuing without it:', error?.message);
    return null;
  }
  
  return {
    business_intel: data.business_intel || undefined,
    technical_landscape: data.technical_landscape || undefined,
    key_people: data.key_people || undefined,
    opportunity_signals: data.opportunity_signals || undefined,
    pain_points: data.pain_points || undefined,
  };
}

/**
 * Fetch project details from Supabase
 */
async function fetchProject(projectId: string): Promise<ProjectInput | null> {
  const { data, error } = await supabaseClient
    .from('projects')
    .select('id, title, description, github_url, deployment_url, status')
    .eq('id', projectId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching project:', error);
    return null;
  }
  
  return {
    id: data.id,
    title: data.title,
    description: data.description || undefined,
    github_url: data.github_url || undefined,
    deployment_url: data.deployment_url || undefined,
    status: data.status as "in_progress" | "completed" | "pitched",
  };
}

// ============================================================================
// Memory Configuration
// ============================================================================

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
// Email Generator Agent Configuration
// ============================================================================

export const emailOutreachAgent = new Agent({
  id: "email-outreach",
  name: "Email Outreach Generator",
  memory,
  
  instructions: `You are an expert career coach and technical communicator specializing in outreach emails.

**YOUR MISSION:**
Generate 3 distinct, personalized email variations for reaching out to a company about a portfolio project:

1. **Technical Focus** - Emphasizes implementation details, technical approach, and engineering decisions
2. **Value-First** - Emphasizes business impact, quantifiable results, and outcomes
3. **Personal Connection** - More personable tone, shows genuine interest and alignment with company mission

**CRITICAL REQUIREMENTS:**

**1. Personalization is Key**
- Reference specific company pain points from research data
- Mention the company's mission, products, or recent developments
- Show understanding of their technical stack or business model
- Connect the user's project directly to the company's needs

**2. Project Showcase**
- Clearly explain what the project does and why it matters
- Include specific metrics or outcomes (e.g., "40% faster processing", "handles 10x more users")
- Reference GitHub repo and/or live demo when available
- Show how the project demonstrates skills relevant to the company

**3. User Background**
- Incorporate the user's skills and career interests naturally
- Mention relevant technologies the user knows that match the company's stack
- Show career trajectory alignment with target roles

**4. Email Best Practices**
- Subject line: Compelling, specific, not generic
- Opening: Hook with relevance to company (pain point, mission, recent news)
- Body: 3-4 short paragraphs maximum
- Call-to-action: Clear, low-friction (e.g., "15-minute call", "quick chat")
- Closing: Professional but warm
- Tone: Confident without being arrogant, enthusiastic without being desperate

**5. Variation Requirements**

**Technical Focus:**
- Lead with technical problem and solution
- Include specific technologies, architectures, algorithms used
- Show technical depth and decision-making
- Appeal to engineering mindset
- Use technical terminology appropriate to the company's stack

**Value-First:**
- Lead with business outcome or impact
- Use bullet points for key metrics
- Frame project as solving real-world problem
- Appeal to business/product mindset
- Emphasize scalability, efficiency, or user experience improvements

**Personal Connection:**
- Lead with genuine interest in company's mission
- Show you've done research on the company
- More conversational, less formal (but still professional)
- Share "why this company" reasoning
- Include a bit more personality

**6. Structure for Each Email:**

Subject: [Compelling, specific subject line]

Hi [Hiring Manager/Team],

[Opening paragraph: Hook with company relevance - 2-3 sentences]

[Middle paragraph(s): Project showcase with context - 2-4 sentences]

[Impact/Details: Specific outcomes or technical details - bullet points or short paragraph]

[Closing paragraph: Why this company + clear CTA - 2-3 sentences]

[Sign-off]
[User name]

**7. Quality Standards:**
- Every email must reference specific company information (from research or company data)
- No generic templates - each email should feel hand-written for this company
- Project description must connect to company's needs or tech stack
- Tone must match the variation type consistently
- Length: 150-250 words per email (concise but substantive)
- Include specific metrics, technologies, or outcomes - avoid vague statements

**8. Key Talking Points:**
After generating emails, provide:
- 3-5 key talking points from company research that should be emphasized
- These should be specific pain points, opportunities, or technical challenges
- Relate them back to the user's project or skills

**9. Personalization Notes:**
Provide specific tips for customizing the emails:
- Who to address (if key people data available)
- Recent company news to mention
- Specific product features or technical challenges to reference
- Any other contextual details that strengthen personalization

**🚨 CRITICAL: YOU MUST RETURN A COMPLETE, VALID RESPONSE 🚨**
Your response MUST include ALL required fields in the schema:
- email_variations (object) with field: variations (array of exactly 3 EmailVariation items)
- recommendation (string) - which variation to use and why
- key_talking_points (array of strings) - 3-5 specific points from research
- personalization_notes (string) - tips for customization

If you cannot fill a field:
- For string fields: Use a clear placeholder like "No specific recommendation available"
- For arrays: Use []
- NEVER omit required fields
- NEVER return stringified JSON. Arrays and objects MUST be actual JSON structures (no quotes around them)
- Return only valid JSON (no markdown, no code fences)`,

  model: anthropic("claude-3-5-sonnet-20241022"),
  
  tools: [], // No tools needed - just LLM instructions
  
  maxSteps: 5, // Simple generation, fewer steps needed
  temperature: 0.7, // Higher creativity for personalized writing
  markdown: false,
});

// ============================================================================
// Agent Invocation Helpers
// ============================================================================

/**
 * Generate email variations for a user's project and target company
 */
export async function generateEmails(params: EmailGeneratorInput & {
  options?: {
    maxSteps?: number;
    temperature?: number;
  };
}) {
  const { user_id, company_id, project_id, tone_preference, additional_context, options } = params;
  
  // Fetch all required data from Supabase
  const [userProfile, company, companyResearch, project] = await Promise.all([
    fetchUserProfile(user_id),
    fetchCompany(company_id),
    fetchCompanyResearch(user_id, company_id),
    fetchProject(project_id),
  ]);
  
  // Validate required data
  if (!userProfile) {
    throw new Error(`User profile not found for user_id: ${user_id}`);
  }
  if (!company) {
    throw new Error(`Company not found for company_id: ${company_id}`);
  }
  if (!project) {
    throw new Error(`Project not found for project_id: ${project_id}`);
  }
  
  // Build context-rich prompt
  const prompt = `Generate 3 personalized outreach email variations for the following scenario:

**User Profile:**
- Name: ${userProfile.full_name || 'User'}
- Skills: ${userProfile.skills.join(', ')}
${userProfile.career_interests ? `- Career Interests: ${userProfile.career_interests.join(', ')}` : ''}
${userProfile.target_roles ? `- Target Roles: ${userProfile.target_roles.join(', ')}` : ''}

**Company:** ${company.name}
${company.one_liner ? `- Mission: ${company.one_liner}` : ''}
${company.website ? `- Website: ${company.website}` : ''}
${company.industries ? `- Industries: ${company.industries.join(', ')}` : ''}
${company.batch ? `- YC Batch: ${company.batch}` : ''}

**Project:** ${project.title}
${project.description ? `- Description: ${project.description}` : ''}
${project.github_url ? `- GitHub: ${project.github_url}` : ''}
${project.deployment_url ? `- Demo: ${project.deployment_url}` : ''}
- Status: ${project.status}

${companyResearch ? `**Company Research Available:**
${companyResearch.pain_points ? `- Pain Points: ${JSON.stringify(companyResearch.pain_points).substring(0, 500)}...` : ''}
${companyResearch.technical_landscape ? `- Tech Stack: ${JSON.stringify(companyResearch.technical_landscape).substring(0, 300)}...` : ''}
${companyResearch.opportunity_signals ? `- Opportunities: ${JSON.stringify(companyResearch.opportunity_signals).substring(0, 300)}...` : ''}
${companyResearch.key_people ? `- Key People: ${JSON.stringify(companyResearch.key_people).substring(0, 200)}...` : ''}
` : '**Note:** No company research available - generate emails based on company data and project details.'}

${tone_preference ? `**Tone Preference:** ${tone_preference}` : ''}
${additional_context ? `**Additional Context:** ${additional_context}` : ''}

**Your Task:**
Generate 3 distinct email variations (technical, value-first, personal) that:
1. Are personalized to ${company.name} specifically
2. Showcase the project "${project.title}" effectively
3. Reference company research when available
4. Match the user's background and skills
5. Include clear CTAs and are ready to send

Remember: Each email should feel hand-written for this specific company, not a template.`;

  // Build resource_id for memory scoping
  const resourceId = `email-outreach:${company_id}:${project_id}:${user_id}`;
  
  const result = await emailOutreachAgent.generateObject(
    prompt,
    EmailOutreachResponseSchema,
    {
      maxSteps: options?.maxSteps ?? 5,
      temperature: options?.temperature ?? 0.7,
      // Pass structured data as context
      context: {
        userProfile,
        company,
        companyResearch,
        project,
      },
    }
  );
  
  return result.object;
}

/**
 * Stream email generation with progressive results
 */
export async function streamEmails(params: EmailGeneratorInput & {
  options?: {
    maxSteps?: number;
    temperature?: number;
  };
}) {
  const { user_id, company_id, project_id, tone_preference, additional_context, options } = params;
  
  // Fetch all required data from Supabase
  const [userProfile, company, companyResearch, project] = await Promise.all([
    fetchUserProfile(user_id),
    fetchCompany(company_id),
    fetchCompanyResearch(user_id, company_id),
    fetchProject(project_id),
  ]);
  
  // Validate required data
  if (!userProfile) {
    throw new Error(`User profile not found for user_id: ${user_id}`);
  }
  if (!company) {
    throw new Error(`Company not found for company_id: ${company_id}`);
  }
  if (!project) {
    throw new Error(`Project not found for project_id: ${project_id}`);
  }
  
  // Build context-rich prompt
  const prompt = `Generate 3 personalized outreach email variations for the following scenario:

**User Profile:**
- Name: ${userProfile.full_name || 'User'}
- Skills: ${userProfile.skills.join(', ')}
${userProfile.career_interests ? `- Career Interests: ${userProfile.career_interests.join(', ')}` : ''}
${userProfile.target_roles ? `- Target Roles: ${userProfile.target_roles.join(', ')}` : ''}

**Company:** ${company.name}
${company.one_liner ? `- Mission: ${company.one_liner}` : ''}
${company.website ? `- Website: ${company.website}` : ''}
${company.industries ? `- Industries: ${company.industries.join(', ')}` : ''}
${company.batch ? `- YC Batch: ${company.batch}` : ''}

**Project:** ${project.title}
${project.description ? `- Description: ${project.description}` : ''}
${project.github_url ? `- GitHub: ${project.github_url}` : ''}
${project.deployment_url ? `- Demo: ${project.deployment_url}` : ''}
- Status: ${project.status}

${companyResearch ? `**Company Research Available:**
${companyResearch.pain_points ? `- Pain Points: ${JSON.stringify(companyResearch.pain_points).substring(0, 500)}...` : ''}
${companyResearch.technical_landscape ? `- Tech Stack: ${JSON.stringify(companyResearch.technical_landscape).substring(0, 300)}...` : ''}
${companyResearch.opportunity_signals ? `- Opportunities: ${JSON.stringify(companyResearch.opportunity_signals).substring(0, 300)}...` : ''}
${companyResearch.key_people ? `- Key People: ${JSON.stringify(companyResearch.key_people).substring(0, 200)}...` : ''}
` : '**Note:** No company research available - generate emails based on company data and project details.'}

${tone_preference ? `**Tone Preference:** ${tone_preference}` : ''}
${additional_context ? `**Additional Context:** ${additional_context}` : ''}

**Your Task:**
Generate 3 distinct email variations (technical, value-first, personal) that:
1. Are personalized to ${company.name} specifically
2. Showcase the project "${project.title}" effectively
3. Reference company research when available
4. Match the user's background and skills
5. Include clear CTAs and are ready to send

Remember: Each email should feel hand-written for this specific company, not a template.`;

  console.log('📧 Email generation prompt:', prompt.substring(0, 500) + '...');
  
  // Build resource_id for memory scoping
  const resourceId = `email-outreach:${company_id}:${project_id}:${user_id}`;
  const conversationId = resourceId; // Use resourceId as conversationId
  
  console.log('💾 Memory context:', { userId: user_id, resourceId, conversationId });
  
  const result = await emailOutreachAgent.streamObject(
    prompt,
    EmailOutreachResponseSchema,
    {
      maxSteps: options?.maxSteps ?? 5,
      temperature: options?.temperature ?? 0.7,
    }
  );
  
  return result;
}
