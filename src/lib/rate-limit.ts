/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window approach keyed by IP address.
 * No external dependencies (no Redis needed).
 * 
 * Note: On Vercel serverless, each function instance has its own memory,
 * so this provides per-instance limiting — sufficient for basic protection.
 */

const windowMs = 60 * 1000; // 1 minute window
const store = new Map<string, { count: number; resetTime: number }>();

// Clean up stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if a request should be rate-limited.
 * 
 * @param ip - The client IP address (or any unique key)
 * @param maxRequests - Maximum requests per minute (default: 20)
 * @returns null if allowed, or a Response object if rate-limited
 */
export function checkRateLimit(
  ip: string | null,
  maxRequests: number = 20
): Response | null {
  const key = ip || "unknown";
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or window expired — start fresh
    store.set(key, { count: 1, resetTime: now + windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(maxRequests),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}

/**
 * Extract client IP from request headers.
 * Works on Vercel (x-forwarded-for) and other platforms.
 */
export function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || null;
}
