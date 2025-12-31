import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ServiceRequest from '@/models/ServiceRequest'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userId = searchParams.get('userId')
    
    let query: any = {}
    if (email) query.email = email
    if (userId) query.userId = userId
    
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

