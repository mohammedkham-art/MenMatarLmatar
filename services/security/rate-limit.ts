type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  timestamps: number[];
};

type RateLimitStore = Map<string, RateLimitBucket>;

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

const globalRateLimitStore = globalThis as typeof globalThis & {
  __menMatarRateLimits?: RateLimitStore;
};

function getStore() {
  globalRateLimitStore.__menMatarRateLimits ??= new Map();

  return globalRateLimitStore.__menMatarRateLimits;
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
  now = Date.now(),
): RateLimitResult {
  const store = getStore();
  const cutoff = now - windowMs;
  const bucket = store.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((timestamp) => timestamp > cutoff);

  if (bucket.timestamps.length >= limit) {
    const resetAt = bucket.timestamps[0] + windowMs;
    store.set(key, bucket);

    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    };
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);

  const resetAt = bucket.timestamps[0] + windowMs;

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    resetAt,
    retryAfterSeconds: 0,
  };
}
