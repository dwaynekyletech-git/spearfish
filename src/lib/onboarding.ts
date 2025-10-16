// Client utilities for onboarding submission and resume upload
import { createClient } from "@supabase/supabase-js";

export interface OnboardingData {
  full_name?: string;
  job_title?: string;
  skills?: string[];
  career_interests?: string[];
  target_roles?: string[];
  resume_file?: File | null;
}

const MAX_RESUME_MB = 10;

/**
 * Create Supabase client for onboarding operations
 * 
 * Uses anon key for authorization because:
 * 1. Supabase gateway requires Authorization header (even for public functions)
 * 2. The anon key itself is a valid JWT that Supabase accepts
 * 3. Our Edge Functions use service role internally for database operations
 * 4. Clerk JWT integration with Supabase Edge Functions has limitations
 * 
 * This pattern: Browser (anon JWT) → Edge Function (service role) → Database
 * Alternative broken pattern: Browser (Clerk JWT) → Edge Function (fails 401)
 */
function createSupabaseClient() {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
  return createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    anonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${anonKey}`,
        },
      },
    }
  );
}

export async function uploadResume(
  userId: string,
  file: File
): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Resume must be a PDF file");
  }
  if (file.size > MAX_RESUME_MB * 1024 * 1024) {
    throw new Error(`Resume exceeds ${MAX_RESUME_MB}MB limit`);
  }

  const supabase = createSupabaseClient();

  // Request a signed upload URL from the Edge Function
  const { data: signed, error: signErr } = await supabase.functions.invoke("onboarding-signed-upload", {
    body: { userId, filename: file.name },
  });
  if (signErr) throw new Error(`Failed to create upload URL: ${signErr.message || String(signErr)}`);
  if (!signed?.path || !signed?.token) throw new Error("Signed upload URL response missing path or token");

  // Upload using the signed URL token
  const { error: upErr } = await supabase.storage
    .from("resumes")
    .uploadToSignedUrl(signed.path as string, signed.token as string, file);
  if (upErr) throw new Error(`Upload failed: ${upErr.message || String(upErr)}`);

  return signed.path as string;
}

export async function submitOnboarding(
  userId: string,
  data: OnboardingData
) {
  const supabase = createSupabaseClient();

  let resume_url: string | null = null;
  if (data.resume_file) {
    resume_url = await uploadResume(userId, data.resume_file);
  }

  // Call Edge Function via supabase-js (preferred)
  const payload = {
    userId,
    full_name: data.full_name,
    job_title: data.job_title,
    skills: data.skills,
    career_interests: data.career_interests,
    target_roles: data.target_roles,
    resume_url,
  };

  const { data: fnData, error: fnError } = await supabase.functions.invoke("onboarding-submit", {
    body: payload,
  });
  if (fnError) throw fnError;
  return fnData;
}
