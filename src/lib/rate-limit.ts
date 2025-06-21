// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis }     from "@upstash/redis";

// Create a Redis-backed sliding window limiter: 100 requests per minute per key
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),                         // reads UPSTASH_REDIS_REST_URL & TOKEN
  limiter: Ratelimit.slidingWindow(100, "1 m"),   // 100 reqs per 1 minute
  analytics: true,                                // optional: Upstash analytics
});
