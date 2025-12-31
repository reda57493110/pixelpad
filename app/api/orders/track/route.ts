import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { orderTrackingRateLimit } from '@/lib/rate-limit'
import { defaultCors } from '@/lib/cors'

export const dynamic = 'force-dynamic'

async function handleTrackOrder(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const phone = searchParams.get('phone')
    
    if (!orderId && !phone) {
      return NextResponse.json(
        { error: 'Please provide either orderId or phone number' },
        { status: 400 }
      )
    }

    let query: any = {}
    
    // Search by orderId (custom ID like "PP-XXXXXX")
    if (orderId) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(orderId)
      
      if (isValidObjectId) {
        // If it's a valid MongoDB ObjectId, search by both id and _id
        query.$or = [
          { id: orderId },
          { _id: orderId }
        ]
      } else {
        // If it's a custom ID (like "PP-XXXXXX"), only search by the id field
        query.id = orderId
      }
    }
    
    // Search by phone number
    if (phone) {
      // Normalize phone number (remove spaces, dashes, etc.)
      const normalizedPhone = phone.replace(/\s+/g, '').replace(/-/g, '')
      
      // Escape special regex characters to prevent regex injection
      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const escapedPhone = escapeRegex(normalizedPhone)
      
      if (orderId && query.$or) {
        // If searching by both orderId and phone, add phone to the $or array
        query.$or.push({ customerPhone: { $regex: escapedPhone, $options: 'i' } })
      } else if (orderId && query.id) {
        // If we have a simple id query, convert to $or to include phone
        query.$or = [
          { id: query.id },
          { customerPhone: { $regex: escapedPhone, $options: 'i' } }
        ]
        delete query.id
      } else {
        // Phone only search
        query.customerPhone = { $regex: escapedPhone, $options: 'i' }
      }
    }

    // Use lean() and select only needed fields for faster queries
    // Limit sensitive data exposure - don't return email or payment details
    const orders = await Order.find(query)
      .select('id _id date items total status customerName customerPhone city')
      .sort({ date: -1 })
      .limit(10)
      .lean()
    
    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'No order found with the provided information' },
        { status: 404 }
      )
    }

    // If searching by orderId, return the first match
    // If searching by phone, return all matches (or the most recent one)
    const order = orders[0]
    
    // Clean up response - remove sensitive data (email, payment info)
    // Only return basic order information for tracking
    const cleaned: any = {
      id: order.id || order._id?.toString(),
      date: order.date || order.createdAt,
      items: order.items || [],
      total: order.total,
      status: order.status || 'processing',
      customerName: order.customerName,
      city: order.city,
      // Removed: email, paymentSessionId, paymentMethod, paymentStatus
      // These are sensitive and not needed for order tracking
    }
    // Remove undefined/null fields
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined || cleaned[key] === null) {
        delete cleaned[key]
      }
    })
    
    return NextResponse.json(cleaned)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracking order:', error)
    } else {
      console.error('Error tracking order:', error instanceof Error ? error.message : 'An error occurred')
    }
    return NextResponse.json(
      { error: 'Failed to track order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return defaultCors(request, (req) => orderTrackingRateLimit(req, handleTrackOrder))
}

