'use client'

import StructuredData from './StructuredData'

export default function OrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PIXEL PAD',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Morocco\'s trusted computer and tech accessories store. Quality products with expert support and warranty.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MA',
      addressLocality: 'Morocco',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+212-779-318-061',
      contactType: 'Customer Service',
      email: 'pixelpad77@gmail.com',
      availableLanguage: ['en', 'fr', 'ar'],
    },
    sameAs: [
      // Add social media links if available
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '500',
    },
  }

  return <StructuredData data={organizationSchema} />
}
























