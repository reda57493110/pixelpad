import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About PIXEL PAD Morocco | Trusted Computer Store Since 2020',
  description: 'PIXEL PAD - Morocco\'s #1 trusted computer & tech store. 4.8★ rating, 500+ happy customers. Quality computers, expert support, warranty included. Learn our story!',
  keywords: [
    'about pixel pad morocco',
    'computer store morocco',
    'tech store morocco',
    'trusted computer store',
    'about',
    'company',
    'mission',
    'values',
    'team',
    'technology store'
  ],
  openGraph: {
    title: 'About PIXEL PAD Morocco | Trusted Computer Store Since 2020',
    description: 'PIXEL PAD - Morocco\'s #1 trusted computer & tech store. 4.8★ rating, 500+ customers. Quality computers, expert support!',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'About PIXEL PAD - Computer Store Morocco',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About PIXEL PAD Morocco | Trusted Computer Store',
    description: 'PIXEL PAD - Morocco\'s #1 trusted computer & tech store. 4.8★ rating, 500+ customers!',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/more/about`,
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
























