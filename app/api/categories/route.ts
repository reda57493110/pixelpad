import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { requireAdminOrTeam } from '@/lib/auth-middleware'

// Cache in memory for faster responses
let cachedCategories: any[] | null = null
let cachedActiveCategories: any[] | null = null
let cacheTimestamp = 0
let activeCacheTimestamp = 0
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes - much longer cache for better performance

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    
    // Return cached data if available and fresh
    const now = Date.now()
    if (activeOnly) {
      if (cachedActiveCategories && (now - activeCacheTimestamp) < CACHE_DURATION) {
        return NextResponse.json(cachedActiveCategories, {
          headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200, max-age=600'
          }
        })
      }
    } else {
      if (cachedCategories && (now - cacheTimestamp) < CACHE_DURATION) {
        return NextResponse.json(cachedCategories, {
          headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200, max-age=600'
          }
        })
      }
    }
    
    await connectDB()
    
    // Public endpoint - no auth required for reading categories
    const query = activeOnly ? { isActive: true } : {}
    const categories = await Category.find(query)
      .sort({ order: 1, name: 1 })
      .select('-__v')
          .lean()
          .maxTimeMS(2000) // 2 second timeout for faster queries
    
    const categoriesWithId = categories.map((cat: any) => {
      if (cat._id) {
        cat.id = cat._id.toString()
        delete cat._id
      }
      return cat
    })
    
    // Cache the result
    if (activeOnly) {
      cachedActiveCategories = categoriesWithId
      activeCacheTimestamp = now
    } else {
      cachedCategories = categoriesWithId
      cacheTimestamp = now
    }
    
    return NextResponse.json(categoriesWithId, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200, max-age=600'
      }
    })
  } catch (error: any) {
    // Log error only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching categories:', error?.message || error)
    }
    
    // Return cached data even if stale on error - this allows the app to work offline
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    if (activeOnly && cachedActiveCategories && cachedActiveCategories.length > 0) {
      return NextResponse.json(cachedActiveCategories, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120, max-age=60'
        }
      })
    }
    if (!activeOnly && cachedCategories && cachedCategories.length > 0) {
      return NextResponse.json(cachedCategories, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120, max-age=60'
        }
      })
    }
    
    // If no cache and MongoDB connection failed, return empty array instead of error
    // This prevents the app from crashing
    if (error?.name === 'MongooseServerSelectionError' || error?.message?.includes('whitelist')) {
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120, max-age=60'
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAdminOrTeam(request)
    if (error) return error

    await connectDB()
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug: body.slug })
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      )
    }

    // Set default order if not provided
    if (body.order === undefined) {
      const maxOrder = await Category.findOne().sort({ order: -1 })
      body.order = maxOrder ? (maxOrder.order || 0) + 1 : 0
    }

    const category = await Category.create(body)
    const categoryObj = category.toObject()
    if (categoryObj._id) {
      categoryObj.id = categoryObj._id.toString()
      delete categoryObj._id
    }

    return NextResponse.json(categoryObj, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

