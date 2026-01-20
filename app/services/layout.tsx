import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Computer Repair & Setup Services Morocco | On-Site Tech Support - PIXEL PAD',
  description: 'Expert computer repair, setup & maintenance. On-site support, camera installation, software setup. Fast, reliable service across Morocco. Book your service today!',
  keywords: [
    'computer repair morocco',
    'laptop repair morocco',
    'tech support morocco',
    'on-site computer repair',
    'camera installation morocco',
    'software setup morocco',
    'computer maintenance morocco',
    'IT support morocco',
    'services',
    'computer repair',
    'setup',
    'maintenance',
    'on-site support',
    'camera installation',
    'tech support'
  ],
  openGraph: {
    title: 'Computer Repair & Setup Services Morocco | On-Site Tech Support - PIXEL PAD',
    description: 'Expert computer repair, setup & maintenance. On-site support across Morocco. Fast, reliable service. Book today!',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PIXEL PAD Services - Computer Repair & Tech Support',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Computer Repair & Setup Services Morocco | PIXEL PAD',
    description: 'Expert computer repair, setup & maintenance. On-site support across Morocco. Book today!',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/services`,
  },
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
























