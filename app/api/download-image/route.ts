import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdminOrTeam, requireSameOriginMutation } from '@/lib/auth-middleware'
import { lookup } from 'node:dns/promises'
import net from 'node:net'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

const DEFAULT_ALLOWED_HOSTS = [
  'images.unsplash.com',
  'cdn.shopify.com',
  'jpm.ma',
  'i.imgur.com',
  'via.placeholder.com',
]

function isPrivateIp(ip: string) {
  if (net.isIP(ip) === 4) {
    const parts = ip.split('.').map(Number)
    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 169 && parts[1] === 254)
    )
  }
  if (net.isIP(ip) === 6) {
    const normalized = ip.toLowerCase()
    return normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80')
  }
  return true
}

export async function POST(request: NextRequest) {
  try {
    const { error: csrfError } = requireSameOriginMutation(request)
    if (csrfError) return csrfError

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
    if (!['https:', 'http:'].includes(url.protocol)) {
      return NextResponse.json({ error: 'Only HTTP(S) URLs are allowed' }, { status: 400 })
    }

    const envAllowedHosts = (process.env.DOWNLOAD_IMAGE_ALLOWED_HOSTS || '')
      .split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean)
    const allowedHosts = envAllowedHosts.length > 0 ? envAllowedHosts : DEFAULT_ALLOWED_HOSTS
    const normalizedHost = url.hostname.toLowerCase()
    const allowed = allowedHosts.some((allowedHost) =>
      normalizedHost === allowedHost || normalizedHost.endsWith(`.${allowedHost}`)
    )
    if (!allowed) {
      return NextResponse.json({ error: 'Host is not allowed' }, { status: 403 })
    }

    // Resolve DNS and block private networks to reduce SSRF risk.
    const resolved = await lookup(normalizedHost, { all: true })
    if (resolved.some((record) => isPrivateIp(record.address))) {
      return NextResponse.json({ error: 'Target host is not allowed' }, { status: 403 })
    }

    // Download the image
    const response = await fetch(imageUrl, {
      redirect: 'error',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
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

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `product-${timestamp}-${randomString}.${extension}`
    const blobPath = `products/${filename}`

    // Convert buffer to Blob for Vercel Blob upload
    const blob = new Blob([buffer], { type: contentType })

    // Upload to Vercel Blob
    const uploadedBlob = await put(blobPath, blob, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: contentType,
    })

    // Return the public URL from Vercel Blob
    return NextResponse.json({ 
      url: uploadedBlob.url, 
      filename,
      message: 'Image downloaded and uploaded to Vercel Blob successfully'
    })
  } catch (error: any) {
    console.error('Error downloading image:', error)
    return NextResponse.json({ 
      error: 'Failed to download image',
      message: process.env.NODE_ENV === 'development' ? error?.message : 'An error occurred while downloading the image'
    }, { status: 500 })
  }
}

