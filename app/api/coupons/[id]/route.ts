import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Coupon from '@/models/Coupon'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const coupon = await Coupon.findById(params.id)
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }
    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const body = await request.json()
    const coupon = await Coupon.findByIdAndUpdate(params.id, body, { new: true })
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }
    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const coupon = await Coupon.findByIdAndDelete(params.id)
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Coupon deleted successfully' })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
}





