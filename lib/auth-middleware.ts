import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromRequest, JWTPayload } from './jwt'
import connectDB from './mongodb'
import User from '@/models/User'
import Customer from '@/models/Customer'
import { checkPermission, Permission } from './permissions'

export interface AuthRequest extends NextRequest {
  user?: JWTPayload & {
    userData?: any
  }
}

export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: JWTPayload & { userData: any } | null; error: NextResponse | null }> {
  try {
    // Try to connect to database with error handling
    try {
      await connectDB()
    } catch (dbError: any) {
      // If database connection fails, log but don't fail authentication
      // This allows the app to continue functioning even if DB is temporarily unavailable
      if (process.env.NODE_ENV === 'development') {
        // Only log the error message, not full stack trace for SSL errors
        if (dbError.message?.includes('tlsv1') || dbError.message?.includes('SSL') || dbError.message?.includes('TLS')) {
          console.error('Database connection error during authentication: SSL/TLS network issue')
        } else {
          console.error('Database connection error during authentication:', dbError.message)
        }
      }
      // Return null user but no error - let the calling code handle it
      return { user: null, error: null }
    }

    const token = getTokenFromRequest(request)
    
    if (!token) {
      return { user: null, error: null }
    }

    const payload = verifyToken(token)
    if (!payload) {
      return { user: null, error: null }
    }

    // Fetch user data based on type
    let userData
    try {
      if (payload.type === 'user') {
        userData = await User.findById(payload.id).select('-password')
        if (!userData || !userData.isActive) {
          return { user: null, error: null }
        }
      } else if (payload.type === 'customer') {
        userData = await Customer.findById(payload.id).select('-password')
        if (!userData) {
          return { user: null, error: null }
        }
      } else {
        return { user: null, error: null }
      }
    } catch (dbError: any) {
      // Handle database errors during user lookup
      if (process.env.NODE_ENV === 'development') {
        console.error('Database error during user lookup:', dbError.message)
      }
      return { user: null, error: null }
    }

    return {
      user: {
        ...payload,
        userData: userData?.toObject ? userData.toObject() : userData,
      },
      error: null,
    }
  } catch (error: any) {
    // Only log unexpected errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Authentication error:', error?.message || error)
    }
    return { user: null, error: null }
  }
}

export async function requireAuth(
  request: NextRequest
): Promise<{ user: JWTPayload & { userData: any } | null; error: NextResponse | null }> {
  const { user, error } = await authenticateRequest(request)
  
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    }
  }

  return { user, error: null }
}

export async function requireAdmin(
  request: NextRequest
): Promise<{ user: JWTPayload & { userData: any } | null; error: NextResponse | null }> {
  const { user, error } = await requireAuth(request)
  
  if (error) {
    return { user: null, error }
  }

  if (!user || user.type !== 'user' || user.role !== 'admin') {
    return {
      user: null,
      error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    }
  }

  return { user, error: null }
}

export async function requireAdminOrTeam(
  request: NextRequest
): Promise<{ user: JWTPayload & { userData: any } | null; error: NextResponse | null }> {
  const { user, error } = await requireAuth(request)
  
  if (error) {
    return { user: null, error }
  }

  if (!user || user.type !== 'user' || (user.role !== 'admin' && user.role !== 'team')) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Admin or team access required' }, { status: 403 }),
    }
  }

  return { user, error: null }
}

/**
 * Require a specific permission
 */
export async function requirePermission(
  request: NextRequest,
  permission: Permission
): Promise<{ user: JWTPayload & { userData: any } | null; error: NextResponse | null }> {
  const { user, error } = await requireAuth(request)
  
  if (error) {
    return { user: null, error }
  }

  if (!user || user.type !== 'user') {
    return {
      user: null,
      error: NextResponse.json({ error: 'User access required' }, { status: 403 }),
    }
  }

  // Admin has all permissions
  if (user.role === 'admin') {
    return { user, error: null }
  }

  // Check if user has the required permission
  const userData = user.userData
  if (!checkPermission(userData, permission)) {
    return {
      user: null,
      error: NextResponse.json({ 
        error: 'Insufficient permissions',
        required: permission 
      }, { status: 403 }),
    }
  }

  return { user, error: null }
}

/**
 * Require any of the specified permissions
 */
export async function requireAnyPermission(
  request: NextRequest,
  permissions: Permission[]
): Promise<{ user: JWTPayload & { userData: any } | null; error: NextResponse | null }> {
  const { user, error } = await requireAuth(request)
  
  if (error) {
    return { user: null, error }
  }

  if (!user || user.type !== 'user') {
    return {
      user: null,
      error: NextResponse.json({ error: 'User access required' }, { status: 403 }),
    }
  }

  // Admin has all permissions
  if (user.role === 'admin') {
    return { user, error: null }
  }

  // Check if user has any of the required permissions
  const userData = user.userData
  const hasPermission = permissions.some(permission => 
    checkPermission(userData, permission)
  )

  if (!hasPermission) {
    return {
      user: null,
      error: NextResponse.json({ 
        error: 'Insufficient permissions',
        required: permissions 
      }, { status: 403 }),
    }
  }

  return { user, error: null }
}
