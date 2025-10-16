// Simple in-DB cache interface (implement queries in each function as needed)
export interface CacheEntry<T = unknown> {
  user_id: string;
  endpoint: string;
  input_hash: string;
  payload: T;
  ttl_seconds: number;
  created_at?: string;
}

export function isFresh(createdAt: string, ttlSeconds: number): boolean {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return now - created < ttlSeconds * 1000;
}
