import { getSupabaseAuthed } from './supabaseClient';

/**
 * Type definitions matching the CompanyResearch schema from VoltAgent
 */
export interface BusinessIntelligence {
  funding: string;
  investors: string[];
  growth_metrics: string;
  customers: string[];
  market_position: string;
}

export interface TechnicalPainPoint {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
}

export interface TechnicalLandscape {
  tech_stack: string[];
  github_activity: string;
  pain_points: TechnicalPainPoint[];
  recent_releases: string[];
}

export interface KeyPerson {
  name: string;
  role: string;
  interests: string[];
  recent_activity: string;
}

export interface CommunityFeedback {
  pain_points: string[];
  product_gaps: string[];
  missing_features: string[];
  user_workarounds: string[];
}

export interface OpportunitySignal {
  signal: string;
  description: string;
  urgency: "high" | "medium" | "low";
}

export interface PainPointSummaryItem {
  problem: string;
  severity: "critical" | "high" | "medium" | "low";
  evidence: string;
  potential_solution: string;
}

export interface CompanyResearchData {
  business_intelligence: BusinessIntelligence;
  technical_landscape: TechnicalLandscape;
  key_people: KeyPerson[];
  community_feedback: CommunityFeedback;
  opportunity_signals: OpportunitySignal[];
  pain_points_summary: PainPointSummaryItem[];
}

/**
 * Saves company research to the database with conversation linking
 * 
 * @param userId - Clerk user ID
 * @param companyId - Company UUID
 * @param researchData - AI-generated research data
 * @param resourceId - VoltAgent resource ID (e.g., "company-research:uuid")
 * @returns The saved research record with ID
 */
export async function saveCompanyResearch(
  userId: string,
  companyId: string,
  researchData: CompanyResearchData,
  resourceId: string
): Promise<{ id: string; conversationId: string | null }> {
  const supabase = await getSupabaseAuthed();

  // Step 1: Find the conversation by resource_id and user_id
  const { data: conversation, error: convError } = await supabase
    .from('voltagent_memory_conversations')
    .select('id')
    .eq('resource_id', resourceId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (convError) {
    console.error('Error finding conversation:', convError);
  }

  const conversationId = conversation?.id || null;

  // Step 2: Insert research record
  const { data: research, error: researchError } = await supabase
    .from('company_research')
    .insert({
      user_id: userId,
      company_id: companyId,
      business_intel: researchData.business_intelligence,
      technical_landscape: researchData.technical_landscape,
      key_people: researchData.key_people,
      opportunity_signals: researchData.opportunity_signals,
      pain_points: researchData.pain_points_summary,
      conversation_id: conversationId,
    })
    .select('id')
    .single();

  if (researchError) {
    throw new Error(`Failed to save research: ${researchError.message}`);
  }

  // Step 3: Update conversation with company_id and research_id (bi-directional link)
  if (conversationId && research) {
    const { error: updateError } = await supabase
      .from('voltagent_memory_conversations')
      .update({
        company_id: companyId,
        research_id: research.id,
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      // Don't throw - research is already saved
    }
  }

  return {
    id: research.id,
    conversationId,
  };
}

/**
 * Gets conversation history for a company
 * 
 * @param userId - Clerk user ID
 * @param companyId - Company UUID
 * @returns Array of conversation records
 */
export async function getCompanyConversations(
  userId: string,
  companyId: string
) {
  const supabase = await getSupabaseAuthed();

  const { data, error } = await supabase
    .from('voltagent_memory_conversations')
    .select('id, resource_id, title, created_at, research_id')
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }

  return data || [];
}

/**
 * Gets existing research for a company
 * 
 * @param userId - Clerk user ID
 * @param companyId - Company UUID
 * @returns Array of research records with conversation info
 */
export async function getCompanyResearch(
  userId: string,
  companyId: string
) {
  const supabase = await getSupabaseAuthed();

  const { data, error } = await supabase
    .from('company_research')
    .select(`
      id,
      business_intel,
      technical_landscape,
      key_people,
      opportunity_signals,
      pain_points,
      created_at,
      conversation_id
    `)
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch research: ${error.message}`);
  }

  return data || [];
}

/**
 * Checks if research already exists for a company
 * 
 * @param userId - Clerk user ID
 * @param companyId - Company UUID
 * @returns Boolean indicating if research exists
 */
export async function hasExistingResearch(
  userId: string,
  companyId: string
): Promise<boolean> {
  const supabase = await getSupabaseAuthed();

  const { count, error } = await supabase
    .from('company_research')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('company_id', companyId);

  if (error) {
    console.error('Error checking existing research:', error);
    return false;
  }

  return (count || 0) > 0;
}
