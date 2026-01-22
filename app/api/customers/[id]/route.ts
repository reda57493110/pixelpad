import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Customer from '@/models/Customer'
import { requireAuth } from '@/lib/auth-middleware'
import bcrypt from 'bcryptjs'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { user, error } = await requireAuth(request)
    if (error) return error

    await connectDB()
    const customer = await Customer.findById(id).select('-password')
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Users can only view their own profile unless admin
    if (user?.type === 'customer' && user.id !== id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const customerObj = customer.toObject()
    if (customerObj._id) {
      customerObj.id = customerObj._id.toString()
      delete customerObj._id
    }

    return NextResponse.json(customerObj)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { user, error } = await requireAuth(request)
    if (error) return error

    await connectDB()
    const body = await request.json()
    const { password, ...updateData } = body

    // Users can only update their own profile unless admin
    if (user?.type === 'customer' && user.id !== id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const customer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customerObj = customer.toObject()
    if (customerObj._id) {
      customerObj.id = customerObj._id.toString()
      delete customerObj._id
    }

    return NextResponse.json(customerObj)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { user, error } = await requireAuth(request)
    if (error) return error

    // Only admins can delete customers
    if (!user || user.type !== 'user' || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()
    const customer = await Customer.findByIdAndDelete(id)

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}

