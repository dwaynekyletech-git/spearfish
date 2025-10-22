// Client library for calling VoltAgent endpoints with SSE
export type VoltagentEndpoint = 'research' | 'project-generator' | 'email-outreach';

export interface StreamMetadata {
  resourceId?: string;
  userId?: string;
  companyId?: string;
  conversationId?: string;
}

export interface StreamHandlers<T = unknown> {
  onProgress?: (msg: string | undefined) => void;
  onChunk?: (data: T) => void;
  onError?: (message: string) => void;
  onDone?: (metadata?: StreamMetadata) => void;
}

export interface VoltagentRequest<I = unknown> {
  endpoint: VoltagentEndpoint;
  userId: string;
  input: I;
  options?: { regeneration?: boolean; cacheTTLSeconds?: number; model?: string; temperature?: number; maxTokens?: number };
}

export async function streamVoltagent<I = unknown, T = unknown>(req: VoltagentRequest<I>, handlers: StreamHandlers<T>) {
  // Get VoltAgent base URL from environment (defaults to localhost for dev)
  const baseUrl = import.meta.env.VITE_VOLTAGENT_BASE_URL || 'http://localhost:3141';
  
  // Map endpoints to custom SSE paths (not native VoltAgent endpoints)
  const agentPathMap: Record<VoltagentEndpoint, string> = {
    research: '/research/stream',
    'project-generator': '/project-generator/stream',
    'email-outreach': '/email-outreach/stream',
  };

  const url = `${baseUrl}${agentPathMap[req.endpoint]}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: req.input,
      userId: req.userId,
      ...req.options,
    }),
  });

  if (!res.ok || !res.body) {
    try {
      const errText = await res.text();
      handlers.onError?.(`HTTP ${res.status}${errText ? ` - ${errText}` : ''}`);
    } catch {
      handlers.onError?.(`HTTP ${res.status}`);
    }
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const block of lines) {
      for (const line of block.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const json = line.slice(6);
        try {
          const evt = JSON.parse(json) as { 
            type: string; 
            data?: unknown; 
            message?: string;
            metadata?: StreamMetadata;
          };
          switch (evt.type) {
            case 'progress':
              handlers.onProgress?.(evt.message);
              break;
            case 'chunk':
              handlers.onChunk?.(evt.data as T);
              break;
            case 'error':
              handlers.onError?.(evt.message || 'Unknown error');
              break;
            case 'done':
              handlers.onDone?.(evt.metadata);
              break;
          }
        } catch (_e) { /* malformed chunk */ }
      }
    }
  }
}
