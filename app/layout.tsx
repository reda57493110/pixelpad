import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { Suspense } from 'react'
import { NavigationLoadingProvider } from '@/contexts/NavigationLoadingContext'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'PIXEL PAD - Best Computer Store in Morocco | Laptops, Desktops & Tech Accessories',
    template: '%s | PIXEL PAD',
  },
  description: 'Shop the latest computers, laptops, monitors, and tech accessories at PIXEL PAD Morocco. Free shipping, expert support, warranty included. Best prices on gaming PCs, MacBooks, and more!',
  keywords: [
    'computer store morocco',
    'laptops morocco',
    'gaming pc morocco',
    'macbook morocco',
    'computer accessories morocco',
    'tech store morocco',
    'desktop computers morocco',
    'monitors morocco',
    'keyboards morocco',
    'computer repair morocco',
    'computers',
    'laptops',
    'monitors',
    'tech accessories',
    'gaming',
    'electronics'
  ],
  authors: [{ name: 'Pixel Pad' }],
  openGraph: {
    title: 'PIXEL PAD - Best Computer Store in Morocco | Tech Accessories',
    description: 'Shop the latest computers, laptops, and tech accessories. Free shipping, expert support, warranty included. Best prices in Morocco!',
    type: 'website',
    siteName: 'PIXEL PAD',
    locale: 'en_US',
    alternateLocale: ['fr_FR', 'ar_MA'],
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PIXEL PAD - Computer & Accessories Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PIXEL PAD - Best Computer Store in Morocco',
    description: 'Shop the latest computers, laptops, and tech accessories. Free shipping, expert support!',
    images: ['/og-image.jpg'],
    creator: '@pixelpad',
    site: '@pixelpad',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    languages: {
      'en': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'fr': `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}?lang=fr`,
      'ar': `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}?lang=ar`,
      'x-default': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/images/hero-background-light.jpg" as="image" fetchPriority="high" />
        <link rel="preload" href="/images/hero-background-dark.jpg" as="image" fetchPriority="high" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.remove('light','dark');
                document.documentElement.classList.add(theme);
              } catch (e) {
                document.documentElement.classList.remove('light','dark');
                document.documentElement.classList.add('light');
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <NavigationLoadingProvider>
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                </NavigationLoadingProvider>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
