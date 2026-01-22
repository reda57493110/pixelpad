import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { requireAdminOrTeam, requireAdmin } from '@/lib/auth-middleware'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await connectDB()
    const category = await Category.findById(id).select('-__v')
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const categoryObj = category.toObject()
    if (categoryObj._id) {
      categoryObj.id = categoryObj._id.toString()
      delete categoryObj._id
    }

    return NextResponse.json(categoryObj)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { user, error } = await requireAdminOrTeam(request)
    if (error) return error

    await connectDB()
    const body = await request.json()

    // If slug is being updated, check for conflicts
    if (body.slug) {
      const existingCategory = await Category.findOne({
        slug: body.slug,
        _id: { $ne: id }
      })
      if (existingCategory) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).select('-__v')

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const categoryObj = category.toObject()
    if (categoryObj._id) {
      categoryObj.id = categoryObj._id.toString()
      delete categoryObj._id
    }

    return NextResponse.json(categoryObj)
  } catch (error: any) {
    console.error('Error updating category:', error)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { user, error } = await requireAdmin(request)
    if (error) return error

    await connectDB()
    
    // Check if category is used by any products
    const Product = (await import('@/models/Product')).default
    const productsUsingCategory = await Product.countDocuments({ category: id })
    
    if (productsUsingCategory > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It is used by ${productsUsingCategory} product(s). Please reassign products to another category first.` },
        { status: 400 }
      )
    }

    const category = await Category.findByIdAndDelete(id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}

