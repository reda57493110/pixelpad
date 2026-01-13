import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
  lastError: string | null
  errorCount: number
}

declare global {
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null, lastError: null, errorCount: 0 }

if (!global.mongoose) {
  global.mongoose = cached
}

// Track error messages to avoid spam
let lastLoggedError: string | null = null
let errorLogCount = 0
const ERROR_LOG_THROTTLE = 5 // Only log every 5th repeated error

async function connectDB(): Promise<typeof mongoose> {
  // Check if connection is already established and healthy
  if (cached.conn) {
    const state = cached.conn.connection.readyState
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (state === 1) {
      // Connection is healthy, reset error count
      cached.errorCount = 0
      return cached.conn
    }
    // If connection is connecting, wait for it (but with timeout)
    if (state === 2) {
      // Wait max 2 seconds for connection to complete
      try {
        await Promise.race([
          cached.promise || Promise.resolve(cached.conn),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 2000))
        ])
        return cached.conn
      } catch {
        // Timeout - reset and try again
        cached.conn = null
        cached.promise = null
      }
    }
    // Only reset if fully disconnected
    if (state === 0) {
      cached.conn = null
      cached.promise = null
    }
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Reduced to 5s for faster failure
      socketTimeoutMS: 20000, // 20s socket timeout - faster
      connectTimeoutMS: 5000, // 5s initial connection timeout - faster
      maxPoolSize: 5, // Reduced pool size
      minPoolSize: 1, // Keep at least 1 connection alive
      maxIdleTimeMS: 60000, // Close idle connections after 60s (increased)
      retryWrites: true,
      retryReads: true,
      heartbeatFrequencyMS: 30000, // Check connection health every 30s (less frequent)
      // Explicit TLS configuration for MongoDB Atlas
      // For mongodb+srv:// connections, TLS is required
      // These options help resolve SSL/TLS handshake issues
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      // Reset error tracking on successful connection
      cached.errorCount = 0
      cached.lastError = null
      lastLoggedError = null
      errorLogCount = 0

      // Set up connection event listeners (only once)
      if (!mongoose.connection.listeners('error').length) {
        mongoose.connection.on('error', (err) => {
          const errorMsg = err.message || err.name || 'Unknown error'
          cached.lastError = errorMsg
          cached.errorCount++
          
          // Throttle error logging
          if (errorMsg !== lastLoggedError) {
            lastLoggedError = errorMsg
            errorLogCount = 0
          }
          errorLogCount++

          // Only log errors in development or first occurrence
          if (process.env.NODE_ENV === 'development' && errorLogCount <= ERROR_LOG_THROTTLE) {
            if (errorLogCount === 1) {
              console.error('MongoDB connection error:', errorMsg)
            } else if (errorLogCount === ERROR_LOG_THROTTLE) {
              console.error(`MongoDB connection error (repeated ${errorLogCount} times, suppressing further logs):`, errorMsg)
            }
          }
          
          // Don't reset cache on transient errors - let mongoose handle reconnection
          // Only reset on critical errors
          if (err.name === 'MongoServerSelectionError' && cached.errorCount > 10) {
            cached.conn = null
            cached.promise = null
          }
        })
      }

      if (!mongoose.connection.listeners('disconnected').length) {
        mongoose.connection.on('disconnected', () => {
          // Don't log every disconnect - mongoose will auto-reconnect
          // Only reset if we've had many disconnects
          if (cached.errorCount > 20) {
            cached.conn = null
            cached.promise = null
            cached.errorCount = 0
          }
        })
      }

      if (!mongoose.connection.listeners('reconnected').length) {
        mongoose.connection.on('reconnected', () => {
          // Reset error count on successful reconnection
          cached.errorCount = 0
          cached.lastError = null
          if (process.env.NODE_ENV === 'development') {
            console.log('MongoDB reconnected successfully')
          }
        })
      }

      if (!mongoose.connection.listeners('connected').length) {
        mongoose.connection.on('connected', () => {
          cached.errorCount = 0
          cached.lastError = null
          // Only log first connection
          if (!cached.conn) {
            if (process.env.NODE_ENV === 'development') {
              console.log('MongoDB connected successfully')
            }
          }
        })
      }

      return mongoose
    }).catch((error) => {
      cached.promise = null
      cached.conn = null
      cached.errorCount++
      
      const errorMsg = error.message || error.name || 'Unknown error'
      cached.lastError = errorMsg
      
      // Only log unique errors or first few occurrences
      if (errorMsg !== lastLoggedError || errorLogCount < 3) {
        lastLoggedError = errorMsg
        errorLogCount++
        
        // Provide helpful error messages (only once per error type)
        if (error.message?.includes('IP whitelist') || error.message?.includes('whitelist')) {
          console.error('MongoDB Error: IP address not whitelisted. Please add your IP (41.92.118.219) to MongoDB Atlas Network Access.')
        } else if (error.message?.includes('authentication')) {
          console.error('MongoDB Error: Authentication failed. Check your MONGODB_URI credentials.')
        } else if (error.message?.includes('tlsv1 alert internal error') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
          if (errorLogCount === 1) {
            console.error('MongoDB SSL/TLS Error: Network or firewall issue detected.')
            console.error('Possible solutions:')
            console.error('  1. Check if your firewall/antivirus is blocking the connection')
            console.error('  2. Verify your IP is whitelisted in MongoDB Atlas Network Access')
            console.error('  3. Try disabling VPN or proxy if active')
            console.error('  4. Check your network connection stability')
          }
        } else if (error.name === 'MongoServerSelectionError') {
          if (errorLogCount === 1) {
            console.error('MongoDB Error: Could not connect to MongoDB Atlas.')
            console.error('Please verify:')
            console.error('  1. Your IP (41.92.118.219) is whitelisted in MongoDB Atlas Network Access')
            console.error('  2. Your network connection is stable')
            console.error('  3. MongoDB Atlas cluster is running')
          }
        } else {
          if (process.env.NODE_ENV === 'development' && errorLogCount <= 2) {
            console.error('MongoDB connection error:', error.message)
          }
        }
      }
      
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
    // Verify connection is still active
    if (cached.conn && cached.conn.connection.readyState !== 1) {
      // Connection is not ready, but don't immediately retry
      // Let mongoose handle reconnection automatically
      if (cached.conn.connection.readyState === 0) {
        cached.conn = null
        cached.promise = null
      }
    }
  } catch (e) {
    cached.promise = null
    cached.conn = null
    throw e
  }

  if (!cached.conn) {
    throw new Error('Failed to establish MongoDB connection')
  }

  return cached.conn
}

export default connectDB





