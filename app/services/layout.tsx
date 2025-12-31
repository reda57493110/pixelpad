import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services - Computer Repair & Setup Services',
  description: 'Professional computer repair, setup, and maintenance services. On-site support, camera installation, and expert technical assistance across Morocco.',
  keywords: ['services', 'computer repair', 'setup', 'maintenance', 'on-site support', 'camera installation', 'tech support', 'Morocco'],
  openGraph: {
    title: 'Services - PIXEL PAD | Computer Repair & Setup',
    description: 'Professional computer repair, setup, and maintenance services. On-site support across Morocco.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Services - PIXEL PAD',
    description: 'Professional computer repair, setup, and maintenance services.',
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
























