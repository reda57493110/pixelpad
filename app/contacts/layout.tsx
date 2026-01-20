import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact PIXEL PAD Morocco | Phone, Email, Support - Get Help Now',
  description: 'Need help? Contact PIXEL PAD Morocco. Call +212-779-318-061, email pixelpad77@gmail.com. Expert support for computers, laptops & tech. We\'re here 24/7!',
  keywords: [
    'contact pixel pad morocco',
    'computer store contact morocco',
    'tech support morocco',
    'customer service morocco',
    'pixel pad phone number',
    'pixel pad email',
    'contact',
    'support',
    'inquiry',
    'customer service',
    'help'
  ],
  openGraph: {
    title: 'Contact PIXEL PAD Morocco | Phone, Email, Support - Get Help Now',
    description: 'Need help? Contact PIXEL PAD. Call +212-779-318-061, email pixelpad77@gmail.com. Expert support. We\'re here 24/7!',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact PIXEL PAD - Computer Store Morocco',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact PIXEL PAD Morocco | Phone, Email, Support',
    description: 'Need help? Contact PIXEL PAD. Call +212-779-318-061. Expert support. We\'re here 24/7!',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/contacts`,
  },
}

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
























