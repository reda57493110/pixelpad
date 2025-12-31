/**
 * Migration Script: localStorage to MongoDB
 * 
 * This script migrates data from localStorage to MongoDB.
 * Run this in the browser console or as a Next.js API route.
 * 
 * Usage:
 * 1. Open browser console on your website
 * 2. Copy and paste this script
 * 3. Or create an API route to run it server-side
 */

interface MigrationResult {
  success: boolean
  message: string
  counts: {
    products: number
    orders: number
    messages: number
    serviceRequests: number
    coupons: number
    users: number
  }
}

async function migrateToMongoDB(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    message: '',
    counts: {
      products: 0,
      orders: 0,
      messages: 0,
      serviceRequests: 0,
      coupons: 0,
      users: 0,
    }
  }

  try {
    // Migrate Products
    const productsData = localStorage.getItem('pixelpad_products')
    if (productsData) {
      const products = JSON.parse(productsData)
      for (const product of products) {
        try {
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
          })
          if (response.ok) {
            result.counts.products++
          }
        } catch (error) {
          console.error('Error migrating product:', product.id, error)
        }
      }
    }

    // Migrate Orders
    const ordersData = localStorage.getItem('pixelpad_orders')
    if (ordersData) {
      const ordersByUser = JSON.parse(ordersData)
      for (const [email, orders] of Object.entries(ordersByUser)) {
        if (Array.isArray(orders)) {
          for (const order of orders) {
            try {
              const orderData = {
                ...order,
                userId: email,
                email: email,
              }
              const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
              })
              if (response.ok) {
                result.counts.orders++
              }
            } catch (error) {
              console.error('Error migrating order:', order.id, error)
            }
          }
        }
      }
    }

    // Migrate Messages
    const messagesData = localStorage.getItem('pixelpad_messages')
    if (messagesData) {
      const messagesByUser = JSON.parse(messagesData)
      for (const [email, messages] of Object.entries(messagesByUser)) {
        if (Array.isArray(messages)) {
          for (const message of messages) {
            try {
              const messageData = {
                ...message,
                userId: email === 'guest' ? 'guest' : email,
                email: email === 'guest' ? 'guest' : email,
              }
              const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData),
              })
              if (response.ok) {
                result.counts.messages++
              }
            } catch (error) {
              console.error('Error migrating message:', message.id, error)
            }
          }
        }
      }
    }

    // Migrate Service Requests
    const serviceRequestsData = localStorage.getItem('pixelpad_service_requests')
    if (serviceRequestsData) {
      const requestsByUser = JSON.parse(serviceRequestsData)
      for (const [email, requests] of Object.entries(requestsByUser)) {
        if (Array.isArray(requests)) {
          for (const request of requests) {
            try {
              const requestData = {
                ...request,
                userId: email === 'guest' ? 'guest' : email,
                email: email === 'guest' ? 'guest' : email,
              }
              const response = await fetch('/api/service-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
              })
              if (response.ok) {
                result.counts.serviceRequests++
              }
            } catch (error) {
              console.error('Error migrating service request:', request.id, error)
            }
          }
        }
      }
    }

    // Migrate Coupons
    const couponsData = localStorage.getItem('pixelpad_coupons')
    if (couponsData) {
      const coupons = JSON.parse(couponsData)
      for (const coupon of coupons) {
        try {
          const response = await fetch('/api/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(coupon),
          })
          if (response.ok) {
            result.counts.coupons++
          }
        } catch (error) {
          console.error('Error migrating coupon:', coupon.id, error)
        }
      }
    }

    // Migrate Users (Note: passwords won't be migrated for security)
    const usersData = localStorage.getItem('pixelpad_users')
    if (usersData) {
      const users = JSON.parse(usersData)
      for (const user of users) {
        try {
          // Don't migrate password - users will need to reset
          const { password, ...userData } = user
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          })
          if (response.ok) {
            result.counts.users++
          }
        } catch (error) {
          console.error('Error migrating user:', user.email, error)
        }
      }
    }

    result.message = `Migration completed! Migrated ${result.counts.products} products, ${result.counts.orders} orders, ${result.counts.messages} messages, ${result.counts.serviceRequests} service requests, ${result.counts.coupons} coupons, and ${result.counts.users} users.`
  } catch (error) {
    result.success = false
    result.message = `Migration failed: ${error}`
    console.error('Migration error:', error)
  }

  return result
}

// Export for use in API route or browser console
if (typeof window !== 'undefined') {
  (window as any).migrateToMongoDB = migrateToMongoDB
}

export default migrateToMongoDB





