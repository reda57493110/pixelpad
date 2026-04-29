import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ServiceRequest from '@/models/ServiceRequest'
import { requireAuth, requireAdminOrTeam } from '@/lib/auth-middleware'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) return error!

    const { id } = await context.params
    await connectDB()
    const serviceRequest = await ServiceRequest.findById(id)
    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    const isStaff = user.type === 'user' && (user.role === 'admin' || user.role === 'team')
    if (!isStaff) {
      const normalizedEmail = user.email.toLowerCase()
      const isOwner =
        serviceRequest.email?.toLowerCase?.() === normalizedEmail ||
        serviceRequest.userId === user.id ||
        serviceRequest.userId === normalizedEmail
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
    return NextResponse.json(serviceRequest)
  } catch (error) {
    console.error('Error fetching service request:', error)
    return NextResponse.json({ error: 'Failed to fetch service request' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdminOrTeam(request)
    if (error) return error

    const { id } = await context.params
    await connectDB()
    const body = await request.json()
    const serviceRequest = await ServiceRequest.findByIdAndUpdate(id, body, { new: true })
    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }
    return NextResponse.json(serviceRequest)
  } catch (error) {
    console.error('Error updating service request:', error)
    return NextResponse.json({ error: 'Failed to update service request' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdminOrTeam(request)
    if (error) return error

    const { id } = await context.params
    await connectDB()
    const serviceRequest = await ServiceRequest.findByIdAndDelete(id)
    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Service request deleted successfully' })
  } catch (error) {
    console.error('Error deleting service request:', error)
    return NextResponse.json({ error: 'Failed to delete service request' }, { status: 500 })
  }
}





