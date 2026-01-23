import { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { Product as ProductType } from '@/types'

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

  // Dynamic product pages - access database directly during build
  let productPages: MetadataRoute.Sitemap = []
  try {
    // Check if MONGODB_URI is available before attempting connection
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      console.warn('MONGODB_URI not set during build, skipping product pages in sitemap')
    } else {
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
    }
  } catch (error: any) {
    // Log error but don't fail the build - sitemap will work without product pages
    console.error('Error generating product sitemap:', error?.message || error)
  }

  return [...staticPages, ...productPages]
}

