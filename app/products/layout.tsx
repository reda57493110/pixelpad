import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products - Computers, Laptops & Tech Accessories',
  description: 'Browse our complete catalog of computers, laptops, monitors, keyboards, mice, and tech accessories. Quality products with warranty and expert support. Free shipping across Morocco.',
  keywords: ['products', 'computers', 'laptops', 'desktops', 'monitors', 'keyboards', 'mice', 'gaming', 'tech accessories', 'Morocco'],
  openGraph: {
    title: 'Products - PIXEL PAD | Computers & Tech Accessories',
    description: 'Browse our complete catalog of computers, laptops, monitors, and tech accessories. Quality products with warranty.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products - PIXEL PAD',
    description: 'Browse our complete catalog of computers, laptops, and tech accessories.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products`,
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
























