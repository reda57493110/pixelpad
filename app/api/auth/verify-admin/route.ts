import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrTeam } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAdminOrTeam(request)
    
    if (error) {
      return error
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Admin or team access required' },
        { status: 403 }
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
    console.error('Admin verify error:', error)
    return NextResponse.json(
      { error: 'Failed to verify admin access' },
      { status: 500 }
    )
  }
}

