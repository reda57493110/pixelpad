'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {}
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme based on system preference or saved preference to prevent flash
  const getInitialTheme = (): Theme => {
    // Only run in browser environment
    if (typeof window === 'undefined') return 'light'
    
    // Check for saved theme preference first
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme
    }
    
    // Default to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    return 'light'
  }

  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [mounted, setMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Ensure theme is applied immediately on mount
    const initialTheme = getInitialTheme()
    setTheme(initialTheme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Check if user has manually set a preference (check on each change)
      const savedTheme = localStorage.getItem('theme')
      // Only auto-switch if user hasn't manually set a preference
      // (i.e., if we're using system preference)
      if (!savedTheme) {
        const newTheme = e.matches ? 'dark' : 'light'
        setTheme(newTheme)
        // Don't save to localStorage - keep it as system preference
        // so it can continue to update with system changes
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Optimized theme switching with minimal reflows
      const root = document.documentElement
      
      // Use CSS class switching for better performance
      // This is faster than inline styles
      root.classList.remove('light', 'dark')
      root.classList.add(theme)
    }
  }, [theme, mounted])

  const toggleTheme = useCallback(() => {
    // Prevent rapid toggling
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    // Direct state update for immediate response
    // CSS handles the smooth transition
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    
    // Save user's manual preference to localStorage
    // This marks it as a user preference, so system theme changes won't override it
    try {
      localStorage.setItem('theme', newTheme)
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Reset transition lock after animation completes
    setTimeout(() => setIsTransitioning(false), 300)
  }, [theme, isTransitioning])

  const value = useMemo(() => ({
    theme,
    toggleTheme
  }), [theme, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  return context
}






