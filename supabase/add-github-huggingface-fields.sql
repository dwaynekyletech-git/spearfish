-- Migration: Add GitHub and Hugging Face enrichment fields to companies table
-- Created: 2025-10-18
-- Description: Adds tags_highlighted (text[]), github (jsonb), and huggingface (jsonb)
--              columns to support enriched Y Combinator company data

-- Add tags_highlighted column (array of highlighted tags)
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS tags_highlighted text[] DEFAULT '{}';

-- Add github column (JSONB containing GitHub organization data)
-- Structure: { company_name, github_org, domain, total_count, repositories[] }
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS github jsonb;

-- Add huggingface column (JSONB containing Hugging Face data)
-- Structure: { company_name, company_url, search_terms[], models[], datasets[], spaces[], total_count }
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS huggingface jsonb;

-- Create GIN indexes for efficient JSONB querying
CREATE INDEX IF NOT EXISTS idx_companies_github ON public.companies USING gin (github);
CREATE INDEX IF NOT EXISTS idx_companies_huggingface ON public.companies USING gin (huggingface);
CREATE INDEX IF NOT EXISTS idx_companies_tags_highlighted ON public.companies USING gin (tags_highlighted);

-- Add comments for documentation
COMMENT ON COLUMN public.companies.tags_highlighted IS 'Array of highlighted tags for the company';
COMMENT ON COLUMN public.companies.github IS 'GitHub organization data including repositories, stars, and activity';
COMMENT ON COLUMN public.companies.huggingface IS 'Hugging Face presence including models, datasets, and spaces';

-- Rollback instructions (if needed):
-- ALTER TABLE public.companies DROP COLUMN IF EXISTS tags_highlighted;
-- ALTER TABLE public.companies DROP COLUMN IF EXISTS github;
-- ALTER TABLE public.companies DROP COLUMN IF EXISTS huggingface;
-- DROP INDEX IF EXISTS idx_companies_github;
-- DROP INDEX IF EXISTS idx_companies_huggingface;
-- DROP INDEX IF EXISTS idx_companies_tags_highlighted;
