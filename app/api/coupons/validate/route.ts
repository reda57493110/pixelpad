import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Coupon from '@/models/Coupon'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { code, total } = await request.json()
    
    const normalized = code.trim().toUpperCase().replace(/\s+/g, '')
    const coupon = await Coupon.findOne({ code: normalized, isActive: true })
    
    if (!coupon) {
      return NextResponse.json({
        valid: false,
        coupon: null,
        discount: 0,
        message: 'Invalid coupon code'
      })
    }
    
    // Check validity dates
    const now = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validUntil = new Date(coupon.validUntil)
    
    if (now < validFrom) {
      return NextResponse.json({
        valid: false,
        coupon,
        discount: 0,
        message: 'Coupon is not yet valid'
      })
    }
    
    if (now > validUntil) {
      return NextResponse.json({
        valid: false,
        coupon,
        discount: 0,
        message: 'Coupon has expired'
      })
    }
    
    // Check minimum purchase
    if (coupon.minPurchase && total < coupon.minPurchase) {
      return NextResponse.json({
        valid: false,
        coupon,
        discount: 0,
        message: `Minimum purchase of ${coupon.minPurchase} DH required`
      })
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({
        valid: false,
        coupon,
        discount: 0,
        message: 'Coupon usage limit reached'
      })
    }
    
    // Calculate discount
    let discount = 0
    if (coupon.type === 'percent') {
      discount = (total * coupon.discountPercent) / 100
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount)
      }
    } else if (coupon.type === 'fixed' && coupon.discountAmount) {
      discount = coupon.discountAmount
    }
    
    return NextResponse.json({
      valid: true,
      coupon,
      discount
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}





