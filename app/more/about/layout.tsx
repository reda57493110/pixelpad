import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - Learn More About PIXEL PAD',
  description: 'Learn about PIXEL PAD - Morocco\'s trusted technology store. Our mission, values, and commitment to providing quality computers and expert support.',
  keywords: ['about', 'company', 'mission', 'values', 'team', 'Morocco', 'technology store'],
  openGraph: {
    title: 'About Us - PIXEL PAD',
    description: 'Learn about PIXEL PAD - Morocco\'s trusted technology store. Our mission and values.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - PIXEL PAD',
    description: 'Learn about PIXEL PAD - Morocco\'s trusted technology store.',
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
























