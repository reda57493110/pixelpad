import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Find answers to common questions about Pixel Pad computers, services, warranty, support, and more. Get help with products, pricing, delivery, and technical assistance.',
  keywords: ['FAQ', 'questions', 'answers', 'help', 'support', 'warranty', 'computers', 'Morocco'],
  openGraph: {
    title: 'FAQ - Frequently Asked Questions | PIXEL PAD',
    description: 'Find answers to common questions about Pixel Pad computers, services, warranty, and support.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ - Frequently Asked Questions | PIXEL PAD',
    description: 'Find answers to common questions about Pixel Pad computers, services, and support.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/more/faq`,
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}






















