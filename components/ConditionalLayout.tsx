'use client'

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
      <NavBar />
      <main className="flex-grow w-full overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <CartSidebar />
    </div>
  )
}

