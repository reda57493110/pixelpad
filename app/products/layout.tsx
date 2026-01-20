import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buy Computers & Laptops in Morocco | Gaming PCs, MacBooks, Monitors - PIXEL PAD',
  description: 'Shop top brands: MacBook, Dell, HP, ASUS, Lenovo. Gaming PCs, laptops, monitors, keyboards & more. Free shipping Morocco. Expert support & warranty. Best prices guaranteed!',
  keywords: [
    'buy computers morocco',
    'laptops for sale morocco',
    'gaming pc morocco',
    'macbook morocco',
    'dell laptops morocco',
    'hp computers morocco',
    'asus gaming morocco',
    'monitors morocco',
    'keyboards morocco',
    'computer accessories morocco',
    'tech store morocco',
    'products',
    'computers',
    'laptops',
    'desktops',
    'monitors',
    'keyboards',
    'mice',
    'gaming',
    'tech accessories'
  ],
  openGraph: {
    title: 'Buy Computers & Laptops in Morocco | Gaming PCs, MacBooks - PIXEL PAD',
    description: 'Shop top brands: MacBook, Dell, HP, ASUS. Gaming PCs, laptops, monitors & more. Free shipping Morocco. Expert support & warranty!',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PIXEL PAD Products - Computers & Tech Accessories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy Computers & Laptops in Morocco | PIXEL PAD',
    description: 'Shop top brands: MacBook, Dell, HP, ASUS. Gaming PCs, laptops & more. Free shipping Morocco!',
    images: ['/og-image.jpg'],
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
























