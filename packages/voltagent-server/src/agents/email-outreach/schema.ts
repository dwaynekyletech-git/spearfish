import { z } from "zod";

/**
 * Email Outreach Schema
 * 
 * This schema defines the structured output format for the email generator agent.
 * It generates 3 variations of outreach emails based on user profile, company research,
 * and project details.
 */

// ============================================================================
// Email Variation Schema
// ============================================================================

export const EmailVariationSchema = z.object({
  type: z.enum(["technical", "value-first", "personal"]).describe("Email approach type"),
  
  title: z.string().describe("Human-readable title for this variation (e.g., 'Technical Focus')"),
  
  description: z.string().describe("Brief explanation of this email's approach and tone"),
  
  subject: z.string().describe("Compelling email subject line"),
  
  body: z.string().describe("Complete email body text, personalized and ready to send"),
  
  rationale: z.string().describe("Why this approach works for this company and project"),
});

export type EmailVariation = z.infer<typeof EmailVariationSchema>;

// ============================================================================
// Email Outreach Response (Agent Output)
// ============================================================================

export const EmailVariationsCollectionSchema = z.object({
  variations: z.array(EmailVariationSchema)
    .length(3)
    .describe("Exactly 3 email variations: technical, value-first, and personal"),
});

export const EmailOutreachResponseSchema = z.object({
  email_variations: EmailVariationsCollectionSchema.describe("Collection of 3 email variations"),
  
  recommendation: z.string().describe("Which email variation to use and why"),
  
  key_talking_points: z.array(z.string()).describe("Main points to emphasize based on company research"),
  
  personalization_notes: z.string().describe("Specific personalization tips for this company and user"),
});

export type EmailOutreachResponse = z.infer<typeof EmailOutreachResponseSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * User profile for personalization
 */
export const UserProfileInputSchema = z.object({
  user_id: z.string().describe("Clerk user ID"),
  full_name: z.string().optional().describe("User's full name"),
  skills: z.array(z.string()).describe("User's technical skills"),
  career_interests: z.array(z.string()).optional().describe("Career focus areas"),
  target_roles: z.array(z.string()).optional().describe("Desired job titles"),
});

export type UserProfileInput = z.infer<typeof UserProfileInputSchema>;

/**
 * Company data from database
 */
export const CompanyInputSchema = z.object({
  id: z.string().describe("Company UUID"),
  name: z.string().describe("Company name"),
  website: z.string().optional().describe("Company website"),
  one_liner: z.string().optional().describe("Company tagline"),
  industries: z.array(z.string()).optional().describe("Industry categories"),
  batch: z.string().optional().describe("Y Combinator batch"),
});

export type CompanyInput = z.infer<typeof CompanyInputSchema>;

/**
 * Company research data
 */
export const CompanyResearchInputSchema = z.object({
  business_intel: z.any().optional().describe("Business intelligence data"),
  technical_landscape: z.any().optional().describe("Technical stack and challenges"),
  key_people: z.any().optional().describe("Key personnel information"),
  opportunity_signals: z.any().optional().describe("Hiring, funding, growth signals"),
  pain_points: z.any().optional().describe("Pain points summary"),
});

export type CompanyResearchInput = z.infer<typeof CompanyResearchInputSchema>;

/**
 * Project details
 */
export const ProjectInputSchema = z.object({
  id: z.string().describe("Project UUID"),
  title: z.string().describe("Project title"),
  description: z.string().optional().describe("Project description"),
  github_url: z.string().optional().describe("GitHub repository URL"),
  deployment_url: z.string().optional().describe("Live demo URL"),
  status: z.enum(["in_progress", "completed", "pitched"]).describe("Project status"),
});

export type ProjectInput = z.infer<typeof ProjectInputSchema>;

/**
 * Complete input for email generator agent
 */
export const EmailGeneratorInputSchema = z.object({
  user_id: z.string().describe("User ID for fetching profile"),
  company_id: z.string().describe("Company UUID"),
  project_id: z.string().describe("Project UUID"),
  tone_preference: z.enum(["professional", "friendly", "enthusiastic"]).optional().describe("Overall tone preference"),
  additional_context: z.string().optional().describe("Any additional context or special instructions"),
});

export type EmailGeneratorInput = z.infer<typeof EmailGeneratorInputSchema>;

// ============================================================================
// Database Mapping Helpers
// ============================================================================

/**
 * Transform EmailVariation to database insert format
 */
export function emailVariationToDbFormat(
  variation: EmailVariation,
  userId: string,
  companyId: string,
  projectId: string
) {
  return {
    user_id: userId,
    company_id: companyId,
    project_id: projectId,
    subject: variation.subject,
    body: variation.body,
    tone: variation.type,
    sent_at: null, // User marks as sent later
  };
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates email outreach response
 */
export function validateEmailOutreach(data: unknown): EmailOutreachResponse {
  return EmailOutreachResponseSchema.parse(data);
}

/**
 * Partial validation for streaming
 */
export function validatePartialEmailOutreach(data: unknown): Partial<EmailOutreachResponse> {
  return EmailOutreachResponseSchema.partial().parse(data);
}
