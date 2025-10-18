'use client'

import { useEffect, useState } from 'react'

export default function PerformanceMonitor() {
  const [loadTime, setLoadTime] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return

    const startTime = performance.now()
    
    const handleLoad = () => {
      const endTime = performance.now()
      const loadTimeMs = Math.round(endTime - startTime)
      setLoadTime(loadTimeMs)
      setIsVisible(true)
      
      // Auto-hide after 3 seconds
      setTimeout(() => setIsVisible(false), 3000)
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  if (!isVisible || !loadTime) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-mono z-50">
      Load Time: {loadTime}ms
    </div>
  )
}







