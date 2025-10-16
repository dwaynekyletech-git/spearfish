// Simple hashing utility for request normalization
export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(hash));
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function stableHash(obj: unknown): Promise<string> {
  const json = JSON.stringify(obj, Object.keys(obj as Record<string, unknown>).sort());
  return sha256(json);
}
