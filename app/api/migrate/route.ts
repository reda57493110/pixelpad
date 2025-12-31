import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import Order from '@/models/Order'
import Message from '@/models/Message'
import ServiceRequest from '@/models/ServiceRequest'
import Coupon from '@/models/Coupon'
import User from '@/models/User'

/**
 * API Route to migrate data from localStorage format to MongoDB
 * This should be called with POST request containing the data to migrate
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { type, data } = body

    let count = 0

    switch (type) {
      case 'products':
        for (const product of data) {
          try {
            // Check if product already exists
            const existing = await Product.findOne({ name: product.name, price: product.price })
            if (!existing) {
              await Product.create(product)
              count++
            }
          } catch (error) {
            console.error('Error migrating product:', product.id, error)
          }
        }
        break

      case 'orders':
        for (const order of data) {
          try {
            await Order.create(order)
            count++
          } catch (error) {
            console.error('Error migrating order:', order.id, error)
          }
        }
        break

      case 'messages':
        for (const message of data) {
          try {
            await Message.create(message)
            count++
          } catch (error) {
            console.error('Error migrating message:', message.id, error)
          }
        }
        break

      case 'serviceRequests':
        for (const request of data) {
          try {
            await ServiceRequest.create(request)
            count++
          } catch (error) {
            console.error('Error migrating service request:', request.id, error)
          }
        }
        break

      case 'coupons':
        for (const coupon of data) {
          try {
            // Check if coupon code already exists
            const existing = await Coupon.findOne({ code: coupon.code })
            if (!existing) {
              await Coupon.create(coupon)
              count++
            }
          } catch (error) {
            console.error('Error migrating coupon:', coupon.id, error)
          }
        }
        break

      case 'users':
        const bcrypt = require('bcryptjs')
        for (const user of data) {
          try {
            // Check if user already exists
            const existing = await User.findOne({ email: user.email })
            if (!existing) {
              const userData: any = {
                name: user.name,
                email: user.email,
                orders: user.orders || 0,
                avatar: user.avatar,
              }
              
              // Hash password if it exists (for users migrating from localStorage)
              if (user.password) {
                userData.password = await bcrypt.hash(user.password, 10)
              } else {
                // If no password, set a temporary one (user will need to reset)
                userData.password = await bcrypt.hash('temp123', 10)
              }
              
              await User.create(userData)
              count++
            }
          } catch (error) {
            console.error('Error migrating user:', user.email, error)
          }
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid migration type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Migrated ${count} ${type}`,
      count,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}




