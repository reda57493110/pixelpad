import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limit store
// In production, consider using Redis for distributed rate limiting
interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes (only in Node.js environment)
if (typeof global !== 'undefined' && typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })
  }, 5 * 60 * 1000)
}

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  max: number // Maximum number of requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean // Don't count successful requests
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
  } = options

  return async (
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    // Get client identifier (IP address)
    const ip = 
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const key = `rate-limit:${ip}`
    const now = Date.now()

    // Get or create rate limit entry
    let entry = store[key]
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      }
      store[key] = entry
    }

    // Check if limit exceeded
    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
      return NextResponse.json(
        {
          error: message,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
          },
        }
      )
    }

    // Increment counter
    entry.count++

    // Execute handler
    const response = await handler(request)

    // If skip successful requests and response is successful, don't count it
    if (skipSuccessfulRequests && response.status >= 200 && response.status < 300) {
      entry.count--
    }

    // Add rate limit headers to response
    const remaining = Math.max(0, max - entry.count)
    response.headers.set('X-RateLimit-Limit', max.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(entry.resetTime).toISOString())

    return response
  }
}

// Pre-configured rate limiters for common use cases
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts. Please try again in 15 minutes.',
})

export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests. Please slow down.',
})

export const strictRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests. Please try again later.',
})

export const orderTrackingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 tracking attempts per 15 minutes
  message: 'Too many tracking requests. Please try again in 15 minutes.',
})

