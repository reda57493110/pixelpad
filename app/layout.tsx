import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { NavigationLoadingProvider } from '@/contexts/NavigationLoadingContext'
import PageTransitionLoader from '@/components/PageTransitionLoader'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'PIXEL PAD - Computer & Accessories Store',
    template: '%s | PIXEL PAD',
  },
  description: 'Discover the latest computers, laptops, monitors, and tech accessories at Pixel Pad. Quality products with expert support and warranty.',
  keywords: ['computers', 'laptops', 'monitors', 'tech accessories', 'gaming', 'electronics', 'Morocco'],
  authors: [{ name: 'Pixel Pad' }],
  openGraph: {
    title: 'PIXEL PAD - Computer & Accessories Store',
    description: 'Discover the latest computers, laptops, monitors, and tech accessories at Pixel Pad. Quality products with expert support and warranty.',
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
    title: 'PIXEL PAD - Computer & Accessories Store',
    description: 'Discover the latest computers, laptops, monitors, and tech accessories at Pixel Pad.',
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
        <link rel="preload" href="/images/hero-background.jpg" as="image" fetchPriority="high" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Aggressive caching for hero background */}
        <link rel="prefetch" href="/images/hero-background.jpg" />
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
        <GoogleAnalytics />
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <NavigationLoadingProvider>
                  <PageTransitionLoader />
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
