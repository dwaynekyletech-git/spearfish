// Client library for calling Voltagent endpoints with SSE
export type VoltagentEndpoint = 'research' | 'project-generator' | 'email-outreach';

export interface StreamHandlers<T = unknown> {
  onProgress?: (msg: string | undefined) => void;
  onChunk?: (data: T) => void;
  onError?: (message: string) => void;
  onDone?: () => void;
}

export interface VoltagentRequest<I = unknown> {
  endpoint: VoltagentEndpoint;
  userId: string;
  input: I;
  options?: { regeneration?: boolean; cacheTTLSeconds?: number; model?: string; temperature?: number; maxTokens?: number };
}

export async function streamVoltagent<I = unknown, T = unknown>(req: VoltagentRequest<I>, handlers: StreamHandlers<T>) {
  const pathMap: Record<VoltagentEndpoint, string> = {
    research: '/functions/v1/voltagent-research',
    'project-generator': '/functions/v1/voltagent-project-generator',
    'email-outreach': '/functions/v1/voltagent-email-outreach',
  };

  const url = pathMap[req.endpoint];
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!res.ok || !res.body) {
    handlers.onError?.(`HTTP ${res.status}`);
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
          const evt = JSON.parse(json) as { type: string; data?: unknown; message?: string };
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
              handlers.onDone?.();
              break;
          }
        } catch (_e) { /* malformed chunk */ }
      }
    }
  }
}
