import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Answers About Computers, Services & Support | PIXEL PAD Morocco',
  description: 'Get instant answers: product info, pricing, warranty, delivery, repair services. Expert help for computers, laptops & tech. Find what you need fast!',
  keywords: [
    'pixel pad faq',
    'computer store faq morocco',
    'laptop questions morocco',
    'tech support faq',
    'warranty questions',
    'FAQ',
    'questions',
    'answers',
    'help',
    'support',
    'warranty',
    'computers'
  ],
  openGraph: {
    title: 'FAQ - Answers About Computers, Services & Support | PIXEL PAD Morocco',
    description: 'Get instant answers: product info, pricing, warranty, delivery, repair services. Expert help for computers & tech!',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PIXEL PAD FAQ - Frequently Asked Questions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ - Answers About Computers & Services | PIXEL PAD',
    description: 'Get instant answers: product info, pricing, warranty, delivery. Expert help for computers & tech!',
    images: ['/og-image.jpg'],
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






















