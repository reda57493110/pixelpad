'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    // Admin routes: no NavBar or Footer
    return <>{children}</>
  }

  // Public routes: include NavBar and Footer
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full relative">
      <Suspense fallback={
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-transparent">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </nav>
      }>
        <NavBar />
      </Suspense>
      <main className="flex-grow w-full overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <CartSidebar />
    </div>
  )
}

