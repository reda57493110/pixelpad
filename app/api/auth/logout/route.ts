import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/jwt'
import { requireSameOriginMutation } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { error } = requireSameOriginMutation(request)
  if (error) return error

  const response = NextResponse.json({ success: true })
  clearAuthCookie(response)
  return response
}

