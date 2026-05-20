const store = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    store.set(key, timestamps);
    const retryAfterMs = timestamps[0] + windowMs - now;
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { allowed: true, remaining: limit - timestamps.length, retryAfterMs: 0 };
}

export function getRateLimitKey(req: Request, userId?: string): string {
  if (userId) return `user:${userId}`;
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `ip:${ip}`;
}
