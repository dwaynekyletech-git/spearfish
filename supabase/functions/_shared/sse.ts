// Minimal SSE utilities for Deno (Supabase Edge Functions)
export const sseHeaders = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
};

export function encodeSseEvent(event: { type: string; data?: unknown; message?: string }) {
  const payload = JSON.stringify({ type: event.type, data: event.data, message: event.message });
  return `data: ${payload}\n\n`;
}

export function sseResponse(stream: ReadableStream) {
  return new Response(stream, { headers: sseHeaders });
}
