import { getSupabaseAuthed } from './supabaseClient';

/**
 * Type definitions for Project Ideas
 */
export interface ProjectIdea {
  title: string;
  problem_solved: string;
  description: string;
  impact_level: "critical" | "high" | "medium" | "low";
  technologies: string[];
  time_estimate: string;
  expected_impact: string;
  implementation_approach: string;
  skill_match_score: number;
  portfolio_value: string;
}

export interface ProjectIdeasResponse {
  project_ideas: {
    ideas: ProjectIdea[];
  };
  recommendation_summary: string;
  skill_gaps_identified?: string[];
}

/**
 * Saves multiple project ideas to the database with conversation linking
 * 
 * @param userId - Clerk user ID
 * @param companyId - Company UUID
 * @param projectIdeas - Array of AI-generated project ideas
 * @param resourceId - VoltAgent resource ID (e.g., "project-ideas:uuid:userId")
 * @returns Array of saved project idea IDs and conversation metadata
 */
export async function saveProjectIdeas(
  userId: string,
  companyId: string,
  projectIdeas: ProjectIdea[],
  resourceId: string
): Promise<{ ids: string[]; conversationId: string | null }> {
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

  // Step 2: Batch insert project ideas
  const ideaRecords = projectIdeas.map(idea => ({
    user_id: userId,
    company_id: companyId,
    title: idea.title,
    description: idea.description,
    impact_level: idea.impact_level,
    technologies: idea.technologies,
    time_estimate: idea.time_estimate,
    expected_impact: idea.expected_impact,
    conversation_id: conversationId,
    // Store additional metadata as JSONB if needed
    // Note: Supabase schema may need a `metadata` JSONB column
  }));

  const { data: savedIdeas, error: insertError } = await supabase
    .from('project_ideas')
    .insert(ideaRecords)
    .select('id');

  if (insertError) {
    throw new Error(`Failed to save project ideas: ${insertError.message}`);
  }

  const ids = savedIdeas?.map(idea => idea.id) || [];

  // Step 3: Update conversation with company_id (bi-directional link)
  if (conversationId && ids.length > 0) {
    const { error: updateError } = await supabase
      .from('voltagent_memory_conversations')
      .update({
        company_id: companyId,
        // Note: project_id is for single projects, not project ideas
        // If you want to link the conversation to a specific project idea,
        // you'll need to modify the schema or use a different approach
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      // Don't throw - ideas are already saved
    }
  }

  return {
    ids,
    conversationId,
  };
}

/**
 * Gets existing project ideas for a company
 * 
 * @param userId - Clerk user ID
 * @param companyId - Company UUID
 * @returns Array of project ideas with conversation info
 */
export async function getProjectIdeas(
  userId: string,
  companyId: string
) {
  const supabase = await getSupabaseAuthed();

  const { data, error } = await supabase
    .from('project_ideas')
    .select(`
      id,
      title,
      description,
      impact_level,
      technologies,
      time_estimate,
      expected_impact,
      created_at,
      conversation_id
    `)
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch project ideas: ${error.message}`);
  }

  return data || [];
}

/**
 * Checks if project ideas already exist for a company
 * 
 * @param userId - Clerk user ID
 * @param companyId - Company UUID
 * @returns Boolean indicating if ideas exist
 */
export async function hasExistingProjectIdeas(
  userId: string,
  companyId: string
): Promise<boolean> {
  const supabase = await getSupabaseAuthed();

  const { count, error } = await supabase
    .from('project_ideas')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('company_id', companyId);

  if (error) {
    console.error('Error checking existing project ideas:', error);
    return false;
  }

  return (count || 0) > 0;
}

/**
 * Deletes project ideas for a company (for regeneration)
 * 
 * @param userId - Clerk user ID
 * @param companyId - Company UUID
 */
export async function deleteProjectIdeas(
  userId: string,
  companyId: string
): Promise<void> {
  const supabase = await getSupabaseAuthed();

  const { error } = await supabase
    .from('project_ideas')
    .delete()
    .eq('user_id', userId)
    .eq('company_id', companyId);

  if (error) {
    throw new Error(`Failed to delete project ideas: ${error.message}`);
  }
}
