import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 5 sign-up attempts per hour per IP
export const signUpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'rl:signup',
});

// 10 sign-in attempts per 15 minutes per IP (brute-force protection)
export const signInLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'),
  prefix: 'rl:signin',
});

// 5 checkout attempts per hour per IP (prevent subscription spam)
export const checkoutLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'rl:checkout',
});

// 60 requests per minute per IP for all other API routes
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  prefix: 'rl:api',
});

// For use inside server actions (comments, uploads, etc.)
// 20 mutations per minute per user
export const actionLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'rl:action',
});

// 200 page requests per minute per IP (DDoS protection for page routes)
export const pageLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, '1 m'),
  prefix: 'rl:page',

  // Ephemeral cache reduces Redis calls for legitimate users
  ephemeralCache: new Map(),
});
