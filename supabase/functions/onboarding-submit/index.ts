// Supabase Edge Function: onboarding-submit
// Receives onboarding profile data and upserts into public.users for the authenticated user
// Deploy: supabase functions deploy onboarding-submit
import { getSupabase } from "../_shared/db.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json", ...corsHeaders }, ...init });
}

interface OnboardingPayload {
  userId?: string; // optional: if not provided, we infer from auth context when possible
  full_name?: string;
  job_title?: string;
  skills?: string[];
  career_interests?: string[];
  target_roles?: string[];
  resume_url?: string | null;
}

// Unified handler to handle OPTIONS first (before any auth checks)
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  // Handle POST
  if (req.method === "POST") {
    try {
      const input = (await req.json()) as OnboardingPayload;
      if (!input) return json({ error: "Missing body" }, { status: 400 });

      const supabase = getSupabase(true);

      // Prefer explicit userId in payload; otherwise accept x-user-id header (from trusted caller)
      const userId = input.userId || req.headers.get("x-user-id") || null;
      if (!userId) return json({ error: "Missing userId" }, { status: 400 });

      const updates = {
        user_id: userId,
        full_name: input.full_name ?? null,
        job_title: input.job_title ?? null,
        skills: input.skills ?? null,
        career_interests: input.career_interests ?? null,
        target_roles: input.target_roles ?? null,
        resume_url: input.resume_url ?? null,
        updated_at: new Date().toISOString(),
      } as const;

      // Upsert user profile
      const { error } = await supabase
        .from("users")
        .upsert(updates, { onConflict: "user_id" })
        .select()
        .single();

      if (error) return json({ error: String(error.message || error) }, { status: 500 });

      return json({ ok: true });
    } catch (e) {
      return json({ error: String(e) }, { status: 500 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
});
