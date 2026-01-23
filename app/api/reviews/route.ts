import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'
import { authenticateRequest } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'

// GET user's own review
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { user, error } = await authenticateRequest(request)
    
    if (error) {
      return error
    }
    
    if (!user) {
      return NextResponse.json({ review: null }, { status: 200 })
    }
    
    // Get productId from query params if provided
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    // Build query - include productId if provided
    const query: any = {
      userId: user.id,
      email: user.userData?.email || user.email
    }
    
    if (productId) {
      query.productId = productId
    } else {
      // If no productId, only get reviews without productId (general reviews)
      query.productId = { $exists: false }
    }
    
    // Get user's own review
    const review = await Review.findOne(query)
    
    return NextResponse.json({ review: review || null }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

// POST create or update user's own review
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { user, error } = await authenticateRequest(request)
    
    if (error) {
      return error
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { rating, comment, productId } = body
    
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }
    
    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      )
    }
    
    const userEmail = user.userData?.email || (user as any).email
    const userName = user.userData?.name || 'Customer'
    
    // Build query - include productId if provided
    const query: any = {
      userId: user.id,
      email: userEmail
    }
    
    if (productId) {
      query.productId = productId
    } else {
      // If no productId, only get reviews without productId (general reviews)
      query.productId = { $exists: false }
    }
    
    // Find existing review or create new one
    const existingReview = await Review.findOne(query)
    
    let review
    if (existingReview) {
      // Update existing review
      existingReview.rating = rating
      existingReview.comment = comment.trim()
      existingReview.name = userName
      existingReview.isPrivate = true // Always private
      if (productId) {
        existingReview.productId = productId
      }
      review = await existingReview.save()
    } else {
      // Create new review
      const reviewData: any = {
        userId: user.id,
        email: userEmail,
        name: userName,
        rating,
        comment: comment.trim(),
        isPrivate: true, // Always private - only user can see
      }
      if (productId) {
        reviewData.productId = productId
      }
      review = await Review.create(reviewData)
    }
    
    return NextResponse.json({ review }, { status: 200 })
  } catch (error: any) {
    console.error('Error saving review:', error)
    return NextResponse.json(
      { error: 'Failed to save review' },
      { status: 500 }
    )
  }
}

// DELETE user's own review
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    const { user, error } = await authenticateRequest(request)
    
    if (error) {
      return error
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userEmail = user.userData?.email || user.email
    
    // Get productId from query params if provided
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    // Build query - include productId if provided
    const query: any = {
      userId: user.id,
      email: userEmail
    }
    
    if (productId) {
      query.productId = productId
    } else {
      // If no productId, only delete reviews without productId (general reviews)
      query.productId = { $exists: false }
    }
    
    await Review.deleteOne(query)
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}

