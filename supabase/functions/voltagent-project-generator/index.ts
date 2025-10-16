// Deno/Supabase Edge Function: voltagent-project-generator
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
    const input = (await req.json()) as AgentRequestBase<{ company?: unknown; skills?: string[]; goal?: string }>;
    if (!input?.userId) return json({ error: "Invalid request" }, { status: 400 });

    const inputHash = await stableHash({ endpoint: "project-generator", input: input.input, userId: input.userId });

    // Rate limit & cache check
    try {
      const supabase = getSupabase(true);
      const rc = await rateCheck(supabase, input.userId, "project-generator");
      if (!rc.allowed) return json({ error: "Rate limit exceeded", retryAfterMs: rc.resetMs }, { status: 429 });
      if (!input.options?.regeneration) {
        const { data } = await getCacheEntry(supabase, input.userId, "project-generator", inputHash);
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
                try {
                  await logExecution(supabase, input.userId, "project-generator(cache)", { input: input.input }, data.payload, true);
                } catch (_e) { /* log best-effort */ }
              },
            });
            return sseResponse(cached);
          }
        }
      }
    } catch (_e) { /* ignore DB failures */ }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (msg: SSEMessage) => controller.enqueue(encoder.encode(encodeSseEvent(msg)));
        send({ type: "progress", message: "started" });

        try {
          const apiKey = Deno.env.get("OPENAI_API_KEY");
          if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

          const model = input.options?.model || "gpt-4o-mini";
          const temperature = input.options?.temperature ?? 0.4;
          const max_tokens = input.options?.maxTokens ?? 900;

          const system = "You design concise, high-impact project ideas tailored to a user's skills and a target company.";
          const userPrompt = `Company: ${JSON.stringify(input.input?.company ?? {}).slice(0, 1200)}\nSkills: ${JSON.stringify(input.input?.skills ?? [])}\nGoal: ${input.input?.goal ?? "portfolio impact"}`;

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
                { role: "user", content: `${userPrompt}\nReturn 3 ideas as JSON with fields: title, description, impact, technologies, time_estimate.` },
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
          const payload = { ideasText: text };
          send({ type: "chunk", data: payload });
          try {
            const supabase = getSupabase(true);
            await upsertCacheEntry(supabase, input.userId, "project-generator", inputHash, payload, input.options?.cacheTTLSeconds ?? 86400);
            await logExecution(supabase, input.userId, "project-generator", { input: input.input }, payload, true);
          } catch (_e) { /* cache/log best-effort */ }
          send({ type: "done" });
        } catch (err) {
          send({ type: "error", message: String(err) });
          try {
            const supabase = getSupabase(true);
            await logExecution(supabase, input.userId, "project-generator", { input: input.input }, { error: String(err) }, false, String(err));
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
