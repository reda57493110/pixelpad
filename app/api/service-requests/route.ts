import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ServiceRequest from '@/models/ServiceRequest'
import { requireAuth } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) return error!

    await connectDB()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userId = searchParams.get('userId')
    
    let query: any = {}
    const isStaff = user.type === 'user' && (user.role === 'admin' || user.role === 'team')
    if (isStaff) {
      if (email) query.email = email.toLowerCase()
      if (userId) query.userId = userId
    } else {
      const normalizedEmail = user.email.toLowerCase()
      query = {
        $or: [
          { email: normalizedEmail },
          { userId: normalizedEmail },
          { userId: user.id },
        ],
      }
    }
    
    const requests = await ServiceRequest.find(query).sort({ date: -1 })
    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching service requests:', error)
    return NextResponse.json({ error: 'Failed to fetch service requests' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const serviceRequest = await ServiceRequest.create(body)
    return NextResponse.json(serviceRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating service request:', error)
    return NextResponse.json({ error: 'Failed to create service request' }, { status: 500 })
  }
}

