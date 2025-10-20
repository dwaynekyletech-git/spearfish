-- VoltAgent Memory Tables Schema for Supabase
-- Run this in your Supabase SQL Editor to enable memory persistence

-- Users table (for user-scoped working memory)
CREATE TABLE IF NOT EXISTS voltagent_memory_users (
  id TEXT PRIMARY KEY,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Conversations table
CREATE TABLE IF NOT EXISTS voltagent_memory_conversations (
  id TEXT PRIMARY KEY,
  resource_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Messages table (UIMessage format)
CREATE TABLE IF NOT EXISTS voltagent_memory_messages (
  conversation_id TEXT NOT NULL REFERENCES voltagent_memory_conversations(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  parts JSONB,
  metadata JSONB,
  format_version INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (conversation_id, message_id)
);

-- Workflow states (for suspension/resume)
CREATE TABLE IF NOT EXISTS voltagent_memory_workflow_states (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  status TEXT NOT NULL,
  suspension JSONB,
  user_id TEXT,
  conversation_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voltagent_memory_conversations_user_id
  ON voltagent_memory_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_voltagent_memory_conversations_resource_id
  ON voltagent_memory_conversations(resource_id);

CREATE INDEX IF NOT EXISTS idx_voltagent_memory_messages_conversation_id
  ON voltagent_memory_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_voltagent_memory_messages_created_at
  ON voltagent_memory_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_voltagent_memory_workflow_states_workflow_id
  ON voltagent_memory_workflow_states(workflow_id);

CREATE INDEX IF NOT EXISTS idx_voltagent_memory_workflow_states_status
  ON voltagent_memory_workflow_states(status);
