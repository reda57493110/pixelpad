import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Coupon from '@/models/Coupon'
import { requireAdminOrTeam } from '@/lib/auth-middleware'
import { sensitiveWriteRateLimit } from '@/lib/rate-limit'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdminOrTeam(request)
    if (error) return error

    await connectDB()
    const coupons = await Coupon.find({}).sort({ createdAt: -1 })
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetched coupons from DB:', coupons.length)
    }
    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

async function handleCreateCoupon(request: NextRequest) {
  try {
    const { error } = await requireAdminOrTeam(request)
    if (error) return error

    await connectDB()
    const body = await request.json()
    const coupon = await Coupon.create(body)
    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return sensitiveWriteRateLimit(request, handleCreateCoupon)
}




