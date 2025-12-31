'use client'

import StructuredData from './StructuredData'

export default function LocalBusinessSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}#localbusiness`,
    name: 'PIXEL PAD',
    image: `${baseUrl}/logo.png`,
    description: 'Morocco\'s trusted computer and tech accessories store. Quality products with expert support and warranty.',
    url: baseUrl,
    telephone: '+212-779-318-061',
    email: 'pixelpad77@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MA',
      addressLocality: 'Morocco',
    },
    geo: {
      '@type': 'GeoCoordinates',
      // Add actual coordinates if available
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    priceRange: '$$',
    servesCuisine: false,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '500',
      bestRating: '5',
      worstRating: '1',
    },
    sameAs: [
      // Add social media links if available
    ],
  }

  return <StructuredData data={localBusinessSchema} />
}






















