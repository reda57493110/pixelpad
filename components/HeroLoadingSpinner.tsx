'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface HeroLoadingSpinnerProps {
  isLoading: boolean
}

export default function HeroLoadingSpinner({ isLoading }: HeroLoadingSpinnerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      // Start fade out animation
      setIsVisible(false)
      // Remove from DOM after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 500) // Match transition duration
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
      setShouldRender(true)
    }
  }, [isLoading])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 pointer-events-none ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      {/* Stronger backdrop so page content does not show through */}
      <div className="absolute inset-0 bg-white/96 dark:bg-gray-900/94 transition-colors duration-300" />
      
      {/* Blur page content under the loader */}
      <div className="absolute inset-0 backdrop-blur-xl dark:backdrop-blur-lg" />
      
      {/* Main content - centered in viewport */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6" style={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}>
        {/* Glowing background circle */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-primary-400 via-blue-400 to-primary-500 rounded-full blur-2xl opacity-18 dark:opacity-20 animate-pulse" />
        
        {/* Logo container with animation */}
        <div className="relative">
          {/* Logo with pulse animation */}
          <div className="relative animate-pulse" style={{ animationDuration: '2s' }}>
            <Image
              src="/images/pixel-pad-logo-new.png"
              alt="Pixel Pad Logo"
              width={180}
              height={80}
              className="w-40 h-auto sm:w-48 md:w-52 lg:w-56 drop-shadow-[0_6px_18px_rgba(37,99,235,0.18)] dark:drop-shadow-2xl"
              priority
            />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mt-2">
            Loading...
          </p>
        </div>
      </div>
    </div>
  )
}
