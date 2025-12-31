import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { requireAdminOrTeam } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Check if we want only active categories (for public use)
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    
    // Public endpoint - no auth required for reading categories
    const query = activeOnly ? { isActive: true } : {}
    const categories = await Category.find(query)
      .sort({ order: 1, name: 1 })
      .select('-__v')
    
    const categoriesWithId = categories.map((cat: any) => {
      const catObj = cat.toObject ? cat.toObject() : cat
      if (catObj._id) {
        catObj.id = catObj._id.toString()
        delete catObj._id
      }
      return catObj
    })
    
    return NextResponse.json(categoriesWithId, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600, max-age=1800'
      }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
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

