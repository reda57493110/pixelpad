import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-middleware'
import connectDB from '@/lib/mongodb'
import ServiceRequest from '@/models/ServiceRequest'

export async function DELETE(request: NextRequest) {
  try {
    // Require admin authentication
    const { user, error } = await requireAdmin(request)
    if (error) return error

    if (!user) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    const result = await ServiceRequest.deleteMany({})
    if (process.env.NODE_ENV === 'development') {
      console.log(`Deleted ${result.deletedCount} service requests`)
    }
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} service requests`,
      count: result.deletedCount
    })
  } catch (error) {
    console.error('Error deleting all service requests:', error)
    return NextResponse.json(
      { error: 'Failed to delete service requests' },
      { status: 500 }
    )
  }
}


