// Deno/Supabase Edge Function: voltagent-research
// Placeholder implementation with SSE and stubs for rate limiting, caching, and logging.
// To deploy: supabase functions deploy voltagent-research
import { encodeSseEvent, sseResponse } from "../_shared/sse.ts";
import { AgentRequestBase, SSEMessage } from "../_shared/types.ts";
import { stableHash } from "../_shared/hash.ts";
import { getSupabase, getCacheEntry, upsertCacheEntry, rateCheck } from "../_shared/db.ts";
import { fetchWithRetry } from "../_shared/retry.ts";

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" }, ...init });
}

export const POST = async (req: Request) => {
  try {
    const input = (await req.json()) as AgentRequestBase<{ query: string; company?: unknown; context?: unknown }>;
    if (!input?.userId || !input?.input?.query) return json({ error: "Invalid request" }, { status: 400 });

    const inputHash = await stableHash({ endpoint: "research", input: input.input, userId: input.userId });

    // Rate limit
    try {
      const supabase = getSupabase(true);
      const rc = await rateCheck(supabase, input.userId, "research");
      if (!rc.allowed) {
        return json({ error: "Rate limit exceeded", retryAfterMs: rc.resetMs }, { status: 429 });
      }

      // Cache check
      if (!input.options?.regeneration) {
        const { data } = await getCacheEntry(supabase, input.userId, "research", inputHash);
        if (data && data.created_at) {
          const created = new Date(data.created_at).getTime();
          const ttl = (data.ttl_seconds ?? 86400) * 1000;
          if (Date.now() - created < ttl) {
            const cached = new ReadableStream<Uint8Array>({
              async start(controller) {
                const enc = new TextEncoder();
                controller.enqueue(enc.encode(encodeSseEvent({ type: "progress", message: "cache" })));
                controller.enqueue(enc.encode(encodeSseEvent({ type: "chunk", data: data.payload })));
                controller.enqueue(enc.encode(encodeSseEvent({ type: "done" })));
                controller.close();
                // best-effort log
                try {
                  await logExecution(supabase, input.userId, "research(cache)", { input: input.input }, data.payload, true);
                } catch (_e) { /* log best-effort */ }
              },
            });
            return sseResponse(cached);
          }
        }
      }
    } catch (_e) {
      // proceed without blocking if db unavailable
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (msg: SSEMessage) => controller.enqueue(encoder.encode(encodeSseEvent(msg)));

        send({ type: "progress", message: "started" });

        // TODO: check cache (voltagent_cache) using inputHash and userId
        // TODO: basic rate limit check (rate_limits)

        try {
          const apiKey = Deno.env.get("OPENAI_API_KEY");
          if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

          const model = input.options?.model || "gpt-4o-mini";
          const temperature = input.options?.temperature ?? 0.2;
          const max_tokens = input.options?.maxTokens ?? 800;

          const system = "You are a concise startup research assistant. Provide focused, actionable insights.";
          const userPrompt = `Query: ${input.input.query}` + (input.input.company ? `\nCompany Context: ${JSON.stringify(input.input.company).slice(0, 2000)}` : "");

const res = await fetchWithRetry("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              temperature,
              max_tokens,
              messages: [
                { role: "system", content: system },
                { role: "user", content: userPrompt },
              ],
              stream: false,
            }),
          }, { retries: 2 });

          if (!res.ok) {
            const errText = await res.text();
            send({ type: "error", message: `OpenAI error: ${res.status} ${errText}` });
            send({ type: "done" });
            controller.close();
            return;
          }

          const data = await res.json();
          const text = data.choices?.[0]?.message?.content ?? "";
          const payload = { text };
          send({ type: "chunk", data: payload });

          // best-effort cache write & log
          try {
            const supabase = getSupabase(true);
            await upsertCacheEntry(supabase, input.userId, "research", inputHash, payload, input.options?.cacheTTLSeconds ?? 86400);
            await logExecution(supabase, input.userId, "research", { input: input.input }, payload, true);
          } catch (_e) { /* cache/log best-effort */ }

          send({ type: "done" });
        } catch (err) {
          send({ type: "error", message: String(err) });
          // best-effort log
          try {
            const supabase = getSupabase(true);
            await logExecution(supabase, input.userId, "research", { input: input.input }, { error: String(err) }, false, String(err));
          } catch (_e) { /* log best-effort */ }
          send({ type: "done" });
        } finally {
          controller.close();
        }
      },
    });

    return sseResponse(stream);
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
};

export const OPTIONS = () => new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" } });
