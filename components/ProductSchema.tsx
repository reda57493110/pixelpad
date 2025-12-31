'use client'

import StructuredData from './StructuredData'
import { Product } from '@/types'

interface ProductSchemaProps {
  product: Product
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.id,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: 'PIXEL PAD',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products?product=${product.id}`,
      priceCurrency: 'MAD',
      price: product.price.toString(),
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'PIXEL PAD',
      },
    },
    ...(product.rating && product.reviews ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toString(),
        reviewCount: product.reviews.toString(),
      },
    } : {}),
  }

  return <StructuredData data={productSchema} />
}
























