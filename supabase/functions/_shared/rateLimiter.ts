// Minimal token-bucket rate limiter interface
export interface RateCheck {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function nextResetMs(windowSeconds: number): number {
  return windowSeconds * 1000;
}
