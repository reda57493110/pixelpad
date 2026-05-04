/**
 * Fails non-zero if production-required env vars are missing or weak.
 * Run in CI before deploy: NODE_ENV=production node scripts/verify-env.mjs
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const isProd = process.env.NODE_ENV === 'production'
const errors = []

if (!process.env.MONGODB_URI) {
  errors.push('MONGODB_URI is not set')
}

if (isProd) {
  const jwt = process.env.JWT_SECRET
  if (!jwt || jwt.length < 32) {
    errors.push('JWT_SECRET must be set and at least 32 characters in production')
  }
  if (jwt === 'your-secret-key-change-in-production') {
    errors.push('JWT_SECRET must not use the placeholder value in production')
  }

  const cors = process.env.CORS_ALLOWED_ORIGINS
  const site = process.env.NEXT_PUBLIC_SITE_URL
  if (!cors && !site) {
    errors.push('Set CORS_ALLOWED_ORIGINS or NEXT_PUBLIC_SITE_URL for production CORS defaults')
  }
}

if (errors.length) {
  console.error('verify-env failed:\n', errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}

console.log(isProd ? 'verify-env: production checks passed' : 'verify-env: base checks passed (set NODE_ENV=production for full audit)')
