// Shared types for Edge Functions
export type SSEEventType = 'progress' | 'chunk' | 'error' | 'done';

export interface SSEMessage<T = unknown> {
  type: SSEEventType;
  data?: T;
  message?: string;
}

export interface AgentRequestBase<I = unknown> {
  userId: string; // Clerk user ID or app user ID
  endpoint: 'research' | 'project-generator' | 'email-outreach';
  input: I;
  options?: {
    regeneration?: boolean;
    cacheTTLSeconds?: number;
    maxTokens?: number;
    temperature?: number;
    model?: string; // override
  };
}

export interface AgentExecutionLog {
  id: string;
  user_id: string;
  endpoint: string;
  request_hash: string;
  provider?: string;
  model?: string;
  tokens_in?: number;
  tokens_out?: number;
  started_at?: string;
  finished_at?: string;
  elapsed_ms?: number;
  cache_hit?: boolean;
  retry_count?: number;
  status: 'ok' | 'error';
  error_message?: string;
  parent_execution_id?: string | null;
}
