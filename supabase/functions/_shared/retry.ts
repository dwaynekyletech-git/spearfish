// Exponential backoff with jitter for fetch
export interface RetryOptions {
  retries?: number;
  minDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (res: Response | null, err: unknown) => boolean;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchWithRetry(input: RequestInfo | URL, init: RequestInit, opts: RetryOptions = {}) {
  const retries = opts.retries ?? 3;
  const min = opts.minDelayMs ?? 300;
  const max = opts.maxDelayMs ?? 2000;

  let attempt = 0;
  while (true) {
    let res: Response | null = null;
    let err: unknown = null;
    try {
      res = await fetch(input, init);
      const should = opts.shouldRetry
        ? opts.shouldRetry(res, null)
        : res.status >= 500 || res.status === 429;
      if (!should) return res;
    } catch (e) {
      err = e;
      const should = opts.shouldRetry ? opts.shouldRetry(null, err) : true;
      if (!should) throw e;
    }

    if (attempt >= retries) {
      if (res) return res; // give back last response
      throw err ?? new Error('fetch failed');
    }

    // honor Retry-After if present
    let delay = min * Math.pow(2, attempt) + Math.random() * 200;
    if (res) {
      const ra = res.headers.get('retry-after');
      const raMs = ra ? parseInt(ra, 10) * 1000 : NaN;
      if (!Number.isNaN(raMs)) delay = Math.max(delay, raMs);
    }
    delay = Math.min(delay, max);

    await sleep(delay);
    attempt += 1;
  }
}