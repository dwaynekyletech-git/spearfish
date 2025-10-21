-- Migration: Link VoltAgent Memory Tables with Application Tables
-- This creates bi-directional relationships between AI conversations and their outputs
-- Run this after voltagent_memory_schema.sql and fix-user-id-types.sql

-- ============================================================================
-- STEP 1: Add conversation_id to application output tables
-- ============================================================================

-- Add conversation_id to company_research (links research output to AI conversation)
ALTER TABLE public.company_research 
  ADD COLUMN IF NOT EXISTS conversation_id TEXT;

-- Add conversation_id to project_ideas (links project ideas to AI conversation)
ALTER TABLE public.project_ideas 
  ADD COLUMN IF NOT EXISTS conversation_id TEXT;

-- Add conversation_id to outreach_emails (links emails to AI conversation)
ALTER TABLE public.outreach_emails 
  ADD COLUMN IF NOT EXISTS conversation_id TEXT;

-- ============================================================================
-- STEP 2: Add entity references to conversation table
-- ============================================================================

-- Add nullable foreign key columns to voltagent_memory_conversations
-- This allows conversations to exist before outputs are created

ALTER TABLE public.voltagent_memory_conversations 
  ADD COLUMN IF NOT EXISTS company_id UUID,
  ADD COLUMN IF NOT EXISTS research_id UUID,
  ADD COLUMN IF NOT EXISTS project_id UUID,
  ADD COLUMN IF NOT EXISTS outreach_id UUID;

-- ============================================================================
-- STEP 3: Create foreign key constraints
-- ============================================================================

-- Add foreign keys from conversations to application tables (nullable)
ALTER TABLE public.voltagent_memory_conversations
  ADD CONSTRAINT fk_memory_conv_company 
    FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_memory_conv_research 
    FOREIGN KEY (research_id) REFERENCES public.company_research(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_memory_conv_project 
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_memory_conv_outreach 
    FOREIGN KEY (outreach_id) REFERENCES public.outreach_emails(id) ON DELETE SET NULL;

-- Add foreign keys from application tables back to conversations (nullable)
ALTER TABLE public.company_research
  ADD CONSTRAINT fk_research_conversation
    FOREIGN KEY (conversation_id) REFERENCES public.voltagent_memory_conversations(id) ON DELETE SET NULL;

ALTER TABLE public.project_ideas
  ADD CONSTRAINT fk_project_idea_conversation
    FOREIGN KEY (conversation_id) REFERENCES public.voltagent_memory_conversations(id) ON DELETE SET NULL;

ALTER TABLE public.outreach_emails
  ADD CONSTRAINT fk_outreach_conversation
    FOREIGN KEY (conversation_id) REFERENCES public.voltagent_memory_conversations(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 4: Create indexes for performance
-- ============================================================================

-- Indexes on conversation_id columns in application tables
CREATE INDEX IF NOT EXISTS idx_company_research_conversation 
  ON public.company_research(conversation_id);

CREATE INDEX IF NOT EXISTS idx_project_ideas_conversation 
  ON public.project_ideas(conversation_id);

CREATE INDEX IF NOT EXISTS idx_outreach_emails_conversation 
  ON public.outreach_emails(conversation_id);

-- Indexes on entity references in conversations table
CREATE INDEX IF NOT EXISTS idx_memory_conv_company_id 
  ON public.voltagent_memory_conversations(company_id);

CREATE INDEX IF NOT EXISTS idx_memory_conv_research_id 
  ON public.voltagent_memory_conversations(research_id);

CREATE INDEX IF NOT EXISTS idx_memory_conv_project_id 
  ON public.voltagent_memory_conversations(project_id);

CREATE INDEX IF NOT EXISTS idx_memory_conv_outreach_id 
  ON public.voltagent_memory_conversations(outreach_id);

-- Composite index for looking up conversations by user and company
CREATE INDEX IF NOT EXISTS idx_memory_conv_user_company 
  ON public.voltagent_memory_conversations(user_id, company_id);

-- ============================================================================
-- STEP 5: Add RLS policies for voltagent_memory tables
-- ============================================================================

-- Enable RLS on VoltAgent memory tables
ALTER TABLE public.voltagent_memory_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltagent_memory_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltagent_memory_workflow_states ENABLE ROW LEVEL SECURITY;

-- Conversations: users can only access their own conversations
CREATE POLICY "memory_conversations_crud_own" ON public.voltagent_memory_conversations
  FOR ALL USING (
    user_id = (auth.jwt() ->> 'user_id')::text
  ) WITH CHECK (
    user_id = (auth.jwt() ->> 'user_id')::text
  );

-- Messages: users can only access messages in their conversations
CREATE POLICY "memory_messages_crud_own" ON public.voltagent_memory_messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM public.voltagent_memory_conversations 
      WHERE user_id = (auth.jwt() ->> 'user_id')::text
    )
  ) WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.voltagent_memory_conversations 
      WHERE user_id = (auth.jwt() ->> 'user_id')::text
    )
  );

-- Workflow states: users can only access their own workflow states
CREATE POLICY "memory_workflow_states_crud_own" ON public.voltagent_memory_workflow_states
  FOR ALL USING (
    user_id = (auth.jwt() ->> 'user_id')::text OR user_id IS NULL
  ) WITH CHECK (
    user_id = (auth.jwt() ->> 'user_id')::text OR user_id IS NULL
  );

-- ============================================================================
-- STEP 6: Create helper functions (optional but useful)
-- ============================================================================

-- Function to link a research record to its conversation
CREATE OR REPLACE FUNCTION link_research_to_conversation(
  p_research_id UUID,
  p_conversation_id TEXT
) RETURNS VOID AS $$
BEGIN
  -- Update research record
  UPDATE public.company_research 
  SET conversation_id = p_conversation_id
  WHERE id = p_research_id;
  
  -- Update conversation record
  UPDATE public.voltagent_memory_conversations 
  SET research_id = p_research_id
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation history for a company (useful for "continue research")
CREATE OR REPLACE FUNCTION get_company_conversations(
  p_company_id UUID,
  p_user_id TEXT
) RETURNS TABLE (
  conversation_id TEXT,
  resource_id TEXT,
  title TEXT,
  created_at TIMESTAMPTZ,
  has_research BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.resource_id,
    c.title,
    c.created_at,
    (c.research_id IS NOT NULL) as has_research
  FROM public.voltagent_memory_conversations c
  WHERE c.company_id = p_company_id 
    AND c.user_id = p_user_id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary of changes:
-- ✅ Added conversation_id columns to company_research, project_ideas, outreach_emails
-- ✅ Added company_id, research_id, project_id, outreach_id to voltagent_memory_conversations
-- ✅ Created bi-directional foreign keys (all nullable)
-- ✅ Created performance indexes
-- ✅ Added RLS policies for VoltAgent memory tables
-- ✅ Created helper functions for linking and querying

-- Usage examples:
-- 1. After AI generates research: CALL link_research_to_conversation(research_uuid, conversation_id);
-- 2. View user's research history: SELECT * FROM get_company_conversations(company_uuid, clerk_user_id);
-- 3. Find conversation for research: SELECT conversation_id FROM company_research WHERE id = research_uuid;
-- 4. Find research from conversation: SELECT research_id FROM voltagent_memory_conversations WHERE id = conversation_id;
