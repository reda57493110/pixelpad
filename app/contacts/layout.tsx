import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch with PIXEL PAD',
  description: 'Contact PIXEL PAD for inquiries, support, or questions. Reach us via phone, email, or visit our location in Morocco. We\'re here to help!',
  keywords: ['contact', 'support', 'inquiry', 'customer service', 'help', 'Morocco'],
  openGraph: {
    title: 'Contact Us - PIXEL PAD',
    description: 'Contact PIXEL PAD for inquiries, support, or questions. We\'re here to help!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - PIXEL PAD',
    description: 'Contact PIXEL PAD for inquiries, support, or questions.',
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
























