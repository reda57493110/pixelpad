import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request)
    
    if (error) {
      return error
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Return user data without sensitive information
    const userData = user.userData
    if (userData && userData._id) {
      userData.id = userData._id.toString()
      delete userData._id
    }
    delete userData?.password

    return NextResponse.json(userData, { status: 200 })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    )
  }
}

