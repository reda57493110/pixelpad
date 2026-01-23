import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Static pages with language variants
  const staticPages: MetadataRoute.Sitemap = [
    // Homepage - highest priority
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}?lang=fr`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}?lang=ar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Products pages
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products?lang=fr`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products?lang=ar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Services
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services?lang=fr`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services?lang=ar`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Contact
    {
      url: `${baseUrl}/contacts`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacts?lang=fr`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacts?lang=ar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // About
    {
      url: `${baseUrl}/more/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/more/about?lang=fr`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/more/about?lang=ar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Additional important pages
    {
      url: `${baseUrl}/more/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/more/warranty`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/more/return`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Dynamic product pages - use dynamic import to avoid loading MongoDB during build
  let productPages: MetadataRoute.Sitemap = []
  try {
    // Check if MONGODB_URI is available before attempting to import MongoDB modules
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      // Silently skip product pages during build if MONGODB_URI is not set
      // This is expected during Vercel builds before env vars are configured
      return staticPages
    }
    
    // Use dynamic import to only load MongoDB modules when needed
    // This prevents module evaluation during build analysis
    try {
      const { default: connectDB } = await import('@/lib/mongodb')
      const { default: Product } = await import('@/models/Product')
      
      await connectDB()
      const products = await Product.find({
        $or: [
          { showOnProductPage: { $ne: false } },
          { showOnProductPage: { $exists: false } }
        ]
      }).select('_id').lean()
      
      productPages = products.map((product: any) => ({
        url: `${baseUrl}/products/${product._id.toString()}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    } catch (dbError: any) {
      // If database connection fails, return static pages only
      // Suppress build-time MongoDB errors (they're expected)
      if (dbError?.isBuildTimeError || dbError?.message?.includes('MONGODB_URI')) {
        // Silently skip - this is expected during build
        return staticPages
      }
      // Don't log error during build to avoid noise
      if (process.env.NODE_ENV === 'development') {
        console.warn('Could not connect to database for sitemap:', dbError?.message)
      }
    }
  } catch (error: any) {
    // Catch any other errors and return static pages only
    // Suppress all MongoDB-related errors during build (they're expected)
    if (error?.isBuildTimeError || error?.message?.includes('MONGODB_URI') || error?.message?.includes('Please define')) {
      // Silently return static pages - this is expected during build
      return staticPages
    }
    // Only log non-MongoDB errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error generating product sitemap:', error?.message || error)
    }
  }

  return [...staticPages, ...productPages]
}

