import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ServiceRequest from '@/models/ServiceRequest'
import { requireAuth, requireSameOriginMutation } from '@/lib/auth-middleware'
import { z } from 'zod'
import { validateBody } from '@/lib/validation'

const createServiceRequestSchema = z.object({
  userId: z.string().trim().min(1).max(120).optional(),
  email: z.string().email().max(254).optional(),
  fullName: z.string().trim().min(2).max(120),
  companyName: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(120),
  emailOrPhone: z.string().trim().min(3).max(120),
  phone: z.string().trim().max(30).optional(),
  numberOfComputers: z.string().trim().min(1).max(40),
  needCameras: z.string().trim().min(1).max(40),
  preferredDate: z.string().trim().max(40).optional(),
  additionalDetails: z.string().trim().max(2000).optional(),
})

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
    const { error: csrfError } = requireSameOriginMutation(req)
    if (csrfError) return csrfError

    const { user } = await requireAuth(req)
    await connectDB()
    const body = await req.json()
    const parsed = validateBody(createServiceRequestSchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const cleanBody = parsed.data

    const payload = {
      userId: user?.id || String(cleanBody.userId || '').trim(),
      email: (user?.email || cleanBody.email || '').toLowerCase().trim(),
      fullName: cleanBody.fullName,
      companyName: cleanBody.companyName,
      city: cleanBody.city,
      emailOrPhone: cleanBody.emailOrPhone,
      phone: cleanBody.phone,
      numberOfComputers: cleanBody.numberOfComputers,
      needCameras: cleanBody.needCameras,
      preferredDate: cleanBody.preferredDate,
      additionalDetails: cleanBody.additionalDetails,
    }

    if (!payload.userId || !payload.email || !payload.fullName || !payload.city || !payload.emailOrPhone || !payload.numberOfComputers || !payload.needCameras) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const serviceRequest = await ServiceRequest.create(payload)
    return NextResponse.json(serviceRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating service request:', error)
    return NextResponse.json({ error: 'Failed to create service request' }, { status: 500 })
  }
}

