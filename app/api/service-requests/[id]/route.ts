import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ServiceRequest from '@/models/ServiceRequest'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const serviceRequest = await ServiceRequest.findById(params.id)
    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }
    return NextResponse.json(serviceRequest)
  } catch (error) {
    console.error('Error fetching service request:', error)
    return NextResponse.json({ error: 'Failed to fetch service request' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const body = await request.json()
    const serviceRequest = await ServiceRequest.findByIdAndUpdate(params.id, body, { new: true })
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const serviceRequest = await ServiceRequest.findByIdAndDelete(params.id)
    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Service request deleted successfully' })
  } catch (error) {
    console.error('Error deleting service request:', error)
    return NextResponse.json({ error: 'Failed to delete service request' }, { status: 500 })
  }
}





