import { NextRequest, NextResponse } from 'next/server'

export interface CorsOptions {
  origin?: string | string[] | ((origin: string | null) => boolean)
  methods?: string[]
  allowedHeaders?: string[]
  credentials?: boolean
}

const defaultOptions: CorsOptions = {
  origin: process.env.NEXT_PUBLIC_SITE_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}

function isOriginAllowed(
  origin: string | null,
  allowedOrigin: string | string[] | ((origin: string | null) => boolean) | undefined
): boolean {
  if (!origin) return false
  if (!allowedOrigin || allowedOrigin === '*') return true
  if (typeof allowedOrigin === 'function') return allowedOrigin(origin)
  if (typeof allowedOrigin === 'string') return origin === allowedOrigin
  return allowedOrigin.includes(origin)
}

export function cors(options: CorsOptions = {}) {
  const opts = { ...defaultOptions, ...options }

  return (request: NextRequest, handler: (request: NextRequest) => Promise<NextResponse>) => {
    const origin = request.headers.get('origin')
    const isAllowed = isOriginAllowed(origin, opts.origin)

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const headers = new Headers()
      
      if (isAllowed && origin) {
        headers.set('Access-Control-Allow-Origin', origin)
      }
      
      if (opts.credentials) {
        headers.set('Access-Control-Allow-Credentials', 'true')
      }
      
      if (opts.methods) {
        headers.set('Access-Control-Allow-Methods', opts.methods.join(', '))
      }
      
      if (opts.allowedHeaders) {
        headers.set('Access-Control-Allow-Headers', opts.allowedHeaders.join(', '))
      }
      
      headers.set('Access-Control-Max-Age', '86400') // 24 hours
      
      return new NextResponse(null, { status: 204, headers })
    }

    // Execute handler and add CORS headers to response
    return handler(request).then(response => {
      const headers = new Headers(response.headers)
      
      if (isAllowed && origin) {
        headers.set('Access-Control-Allow-Origin', origin)
      } else if (opts.origin === '*') {
        headers.set('Access-Control-Allow-Origin', '*')
      }
      
      if (opts.credentials) {
        headers.set('Access-Control-Allow-Credentials', 'true')
      }
      
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    })
  }
}

// Pre-configured CORS middleware
export const defaultCors = cors()

