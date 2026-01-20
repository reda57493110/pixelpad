import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth-middleware'
import Product from '@/models/Product'
import Order from '@/models/Order'
import User from '@/models/User'
import Customer from '@/models/Customer'
import GuestCustomer from '@/models/GuestCustomer'
import Message from '@/models/Message'
import ServiceRequest from '@/models/ServiceRequest'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin(request)
    if (error) return error

    await connectDB()

    // Use MongoDB aggregation to calculate stats efficiently
    const [
      productStats,
      orderStats,
      orderProfitStats,
      userCount,
      customerCount,
      guestCustomerCount,
      messageStats,
      serviceRequestStats
    ] = await Promise.all([
      // Product statistics using aggregation
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStockQuantity: { $sum: { $ifNull: ['$stockQuantity', 0] } },
            totalSoldQuantity: { $sum: { $ifNull: ['$soldQuantity', 0] } },
            lowStockProducts: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: [{ $ifNull: ['$stockQuantity', 0] }, 0] },
                      { $lte: [{ $ifNull: ['$stockQuantity', 0] }, 5] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            totalProfit: {
              $sum: {
                $multiply: [
                  { $ifNull: ['$soldQuantity', 0] },
                  {
                    $subtract: [
                      { $ifNull: ['$price', 0] },
                      {
                        $add: [
                          { $ifNull: ['$costPrice', 0] },
                          { $ifNull: ['$deliveryPrice', 0] }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      ]),
      // Order statistics using aggregation
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: { $ifNull: ['$total', 0] } },
            pendingOrders: {
              $sum: {
                $cond: [{ $eq: ['$status', 'processing'] }, 1, 0]
              }
            }
          }
        }
      ]),
      // Profit calculated from COMPLETED orders (more reliable than Product.soldQuantity)
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $unwind: { path: '$items', preserveNullAndEmptyArrays: false } },
        {
          $addFields: {
            _productObjectId: {
              $convert: {
                input: '$items.id',
                to: 'objectId',
                onError: null,
                onNull: null
              }
            },
            _qty: { $ifNull: ['$items.quantity', 0] },
            _salePrice: { $ifNull: ['$items.price', 0] }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_productObjectId',
            foreignField: '_id',
            as: '_product'
          }
        },
        { $unwind: { path: '$_product', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            _cost: { $ifNull: ['$_product.costPrice', 0] },
            _delivery: { $ifNull: ['$_product.deliveryPrice', 0] }
          }
        },
        {
          $group: {
            _id: null,
            totalProductsSold: { $sum: '$_qty' },
            totalProfit: {
              $sum: {
                $multiply: [
                  '$_qty',
                  { $subtract: ['$_salePrice', { $add: ['$_cost', '$_delivery'] }] }
                ]
              }
            }
          }
        }
      ]),
      // User count
      User.countDocuments({ isActive: true }),
      // Customer counts (registered + guests)
      Customer.countDocuments(),
      GuestCustomer.countDocuments(),
      // Message statistics
      Message.aggregate([
        {
          $group: {
            _id: null,
            totalMessages: { $sum: 1 },
            newMessages: {
              $sum: {
                $cond: [
                  { $or: [{ $eq: ['$status', 'new'] }, { $eq: ['$status', null] }] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      // Service request statistics
      ServiceRequest.aggregate([
        {
          $group: {
            _id: null,
            totalServiceRequests: { $sum: 1 },
            newServiceRequests: {
              $sum: {
                $cond: [
                  { $or: [{ $eq: ['$status', 'new'] }, { $eq: ['$status', null] }] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ])

    // Extract values from aggregation results
    const productData = productStats[0] || {
      totalProducts: 0,
      totalStockQuantity: 0,
      totalSoldQuantity: 0,
      lowStockProducts: 0,
      totalProfit: 0
    }

    const orderData = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0
    }

    const orderProfitData = orderProfitStats[0] || {
      totalProductsSold: 0,
      totalProfit: 0
    }

    const messageData = messageStats[0] || {
      totalMessages: 0,
      newMessages: 0
    }

    const serviceRequestData = serviceRequestStats[0] || {
      totalServiceRequests: 0,
      newServiceRequests: 0
    }

    return NextResponse.json({
      totalProducts: productData.totalProducts,
      totalOrders: orderData.totalOrders,
      totalUsers: userCount,
      totalCustomers: customerCount + guestCustomerCount,
      totalRevenue: orderData.totalRevenue || 0,
      totalMessages: messageData.totalMessages,
      totalServiceRequests: serviceRequestData.totalServiceRequests,
      pendingOrders: orderData.pendingOrders || 0,
      newMessages: messageData.newMessages || 0,
      newServiceRequests: serviceRequestData.newServiceRequests || 0,
      totalStockQuantity: productData.totalStockQuantity || 0,
      totalSoldQuantity: productData.totalSoldQuantity || 0,
      lowStockProducts: productData.lowStockProducts || 0,
      // Prefer orders-based profit; fallback to product-based if no completed orders yet
      totalProfit: (orderProfitData.totalProductsSold > 0 ? orderProfitData.totalProfit : (productData.totalProfit || 0)),
      totalProductsSold: (orderProfitData.totalProductsSold > 0 ? orderProfitData.totalProductsSold : (productData.totalSoldQuantity || 0))
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch admin statistics',
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        totalMessages: 0,
        totalServiceRequests: 0,
        pendingOrders: 0,
        newMessages: 0,
        newServiceRequests: 0,
        totalStockQuantity: 0,
        totalSoldQuantity: 0,
        lowStockProducts: 0,
        totalProfit: 0,
        totalProductsSold: 0
      },
      { status: 500 }
    )
  }
}

