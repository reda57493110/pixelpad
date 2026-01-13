'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface NavigationLoadingContextType {
  isLoading: boolean
  startLoading: () => void
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType>({
  isLoading: false,
  startLoading: () => {},
})

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const prevPathnameRef = useRef(pathname)
  const isInitialMount = useRef(true)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle pathname changes
  useEffect(() => {
    // Skip loading on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevPathnameRef.current = pathname
      return
    }

    // Only hide loading if pathname changed (navigation completed)
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      // Hide loading immediately - navigation is instant with prefetching
      setIsLoading(false)
    }
  }, [pathname])

  // Function to manually start loading (for link clicks)
  // Show very briefly for user feedback only
  const startLoading = () => {
    setIsLoading(true)
    // Hide almost immediately - Next.js prefetching makes navigation instant
    setTimeout(() => setIsLoading(false), 30)
  }

  // Removed click handler - rely only on pathname changes for loading state
  // This prevents any interference with Next.js Link navigation

  return (
    <NavigationLoadingContext.Provider value={{ isLoading, startLoading }}>
      {children}
    </NavigationLoadingContext.Provider>
  )
}

export function useNavigationLoading() {
  return useContext(NavigationLoadingContext)
}

