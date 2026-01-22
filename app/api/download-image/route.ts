import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { requireAdminOrTeam } from '@/lib/auth-middleware'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Require authentication - only admin/team users can download images
    const { user, error } = await requireAdminOrTeam(request)
    if (error) return error

    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Validate URL
    let url: URL
    try {
      url = new URL(imageUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Download the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to download image' }, { status: 400 })
    }

    // Check if it's an image
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL does not point to an image' }, { status: 400 })
    }

    // Check file size (max 20MB for high quality images)
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large. Maximum size is 20MB.' }, { status: 400 })
    }

    // Get image data
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Check actual size
    if (buffer.length > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large. Maximum size is 20MB.' }, { status: 400 })
    }

    // Determine file extension from content type or URL
    let extension = 'jpg'
    if (contentType.includes('png')) extension = 'png'
    else if (contentType.includes('gif')) extension = 'gif'
    else if (contentType.includes('webp')) extension = 'webp'
    else {
      // Try to get extension from URL
      const urlPath = url.pathname.toLowerCase()
      if (urlPath.endsWith('.png')) extension = 'png'
      else if (urlPath.endsWith('.gif')) extension = 'gif'
      else if (urlPath.endsWith('.webp')) extension = 'webp'
      else if (urlPath.endsWith('.jpeg')) extension = 'jpg'
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `product-${timestamp}-${randomString}.${extension}`
    const filepath = join(uploadsDir, filename)

    // Save the image
    await writeFile(filepath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/products/${filename}`
    return NextResponse.json({ 
      url: publicUrl, 
      filename,
      message: 'Image downloaded and saved successfully'
    })
  } catch (error: any) {
    console.error('Error downloading image:', error)
    return NextResponse.json({ 
      error: 'Failed to download image',
      message: process.env.NODE_ENV === 'development' ? error?.message : 'An error occurred while downloading the image'
    }, { status: 500 })
  }
}

