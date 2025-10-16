// Supabase Edge Function: onboarding-signed-upload
// Returns a signed upload URL for a user-scoped resume path
import { getSupabase } from "../_shared/db.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json", ...corsHeaders }, ...init });
}

interface Req {
  userId: string;
  filename: string;
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
      const input = (await req.json()) as Req;
      if (!input?.userId || !input?.filename) return json({ error: "Missing userId or filename" }, { status: 400 });

      const supabase = getSupabase(true);

      // Sanitize name and build path under user's folder
      const safeName = input.filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const path = `${input.userId}/${Date.now()}-${safeName}`;

      const { data, error } = await supabase.storage.from("resumes").createSignedUploadUrl(path, 60);
      if (error || !data) return json({ error: error?.message || "Failed to create signed URL" }, { status: 500 });

      return json({ path, token: data.token });
    } catch (e) {
      return json({ error: String(e) }, { status: 500 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
});
