import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { requireAdminOrTeam } from '@/lib/auth-middleware'
import { strictRateLimit } from '@/lib/rate-limit'
import { defaultCors } from '@/lib/cors'

async function handleUpload(request: NextRequest) {
  try {
    // Require authentication - only admin/team users can upload files
    const { user, error } = await requireAdminOrTeam(request)
    if (error) return error

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (process.env.NODE_ENV === 'development') {
      console.log('Upload API called, file:', file?.name, 'Type:', file?.type, 'Size:', file?.size)
    }

    if (!file) {
      if (process.env.NODE_ENV === 'development') {
        console.error('No file in request')
      }
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }

    // Validate file size (max 20MB for high quality images)
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 20MB.' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename with proper extension validation
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    
    // Sanitize filename and validate extension
    const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '')
    const parts = sanitized.split('.')
    if (parts.length < 2) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }
    const extension = parts[parts.length - 1].toLowerCase()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 })
    }
    
    const filename = `product-${timestamp}-${randomString}.${extension}`
    const filepath = join(uploadsDir, filename)
    
    // Ensure no path traversal (double check)
    if (!filepath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/products/${filename}`
    if (process.env.NODE_ENV === 'development') {
      console.log('File uploaded successfully:', publicUrl)
    }
    return NextResponse.json({ url: publicUrl, filename })
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error uploading file:', error)
    } else {
      console.error('Error uploading file:', error?.message || 'An error occurred')
    }
    return NextResponse.json({ 
      error: 'Failed to upload file', 
      message: process.env.NODE_ENV === 'development' ? error?.message : 'An error occurred while uploading the file'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return defaultCors(request, (req) => strictRateLimit(req, handleUpload))
}

