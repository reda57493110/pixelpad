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

    // Only show loading if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      setIsLoading(true)
      prevPathnameRef.current = pathname
      
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

      // Optimized approach: hide as soon as page is ready
      const hideAfterRender = () => {
        // Wait for React to render the new page
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Check if page is actually loaded - hide immediately for instant feel
            if (typeof window !== 'undefined' && document.readyState === 'complete') {
              // Page is ready, hide immediately (no delay for instant navigation)
              setIsLoading(false)
            } else {
              // Minimal delay if page isn't ready yet
              loadingTimeoutRef.current = setTimeout(() => {
                setIsLoading(false)
                loadingTimeoutRef.current = null
              }, 50)
            }
          })
        })
      }

      // Start hiding process immediately (Next.js handles the navigation)
      hideAfterRender()

      // Fallback: hide after max 300ms (ultra-fast navigation)
      const fallbackTimer = setTimeout(() => {
        setIsLoading(false)
      }, 300)

      return () => {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
        }
        clearTimeout(fallbackTimer)
      }
    }
  }, [pathname])

  // Function to manually start loading (for link clicks)
  const startLoading = () => {
    setIsLoading(true)
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

