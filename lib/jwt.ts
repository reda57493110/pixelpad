import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Validate JWT_SECRET is set and not using default
if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production environment variables')
  }
  console.warn('⚠️  WARNING: JWT_SECRET is not set or using default value. This is insecure in production!')
}

export interface JWTPayload {
  id: string
  email: string
  role?: 'admin' | 'team' | 'customer'
  type: 'user' | 'customer'
}

export function signToken(payload: JWTPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!JWT_SECRET) {
      return null
    }
    const decoded = jwt.verify(token, JWT_SECRET)
    // Type guard to ensure decoded is an object with required properties
    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded && 'email' in decoded && 'type' in decoded) {
      return decoded as JWTPayload
    }
    return null
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

