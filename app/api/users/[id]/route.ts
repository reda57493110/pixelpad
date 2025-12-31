import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { requireAdminOrTeam, requireAdmin } from '@/lib/auth-middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAdminOrTeam(request)
    if (error) return error

    await connectDB()
    const userData = await User.findById(params.id).select('-password')
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userObj = userData.toObject()
    if (userObj._id) {
      userObj.id = userObj._id.toString()
      delete userObj._id
    }

    return NextResponse.json(userObj)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAdminOrTeam(request)
    if (error) return error

    // Only admins can update other users
    if (user?.id !== params.id && user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()
    const body = await request.json()
    // Don't allow password updates through this endpoint
    delete body.password
    
    const userData = await User.findByIdAndUpdate(
      params.id, 
      body, 
      { new: true, runValidators: true }
    ).select('-password')
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userObj = userData.toObject()
    if (userObj._id) {
      userObj.id = userObj._id.toString()
      delete userObj._id
    }

    return NextResponse.json(userObj)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAdmin(request)
    if (error) return error

    await connectDB()
    const userData = await User.findByIdAndDelete(params.id)
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}





