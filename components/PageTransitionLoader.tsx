'use client'

import { useNavigationLoading } from '@/contexts/NavigationLoadingContext'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export default function PageTransitionLoader() {
  const { isLoading } = useNavigationLoading()

  if (!isLoading) return null

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 999999,
        position: 'fixed',
      }}
    >
      {/* Semi-transparent backdrop for visibility */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"></div>
      
      {/* Top Progress Bar - More visible */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-200/50 dark:bg-blue-900/50 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
          style={{
            width: '0%',
            animation: 'progress 1.2s ease-out forwards',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
          }}
        />
      </div>
      
      {/* Refresh Icon in Center - Perfect Design */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="relative flex flex-col items-center">
          {/* Large Glowing Background Circle */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-full blur-3xl opacity-50 animate-pulse scale-150"></div>
          
          {/* Icon Container - Clean gradient design */}
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"></div>
            
            {/* Animated rotating gradient border */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.8), rgba(99, 102, 241, 0.8), rgba(147, 51, 234, 0.8), transparent)',
                animation: 'spin 2s linear infinite',
                mask: 'radial-gradient(circle, transparent 75%, black 78%)',
                WebkitMask: 'radial-gradient(circle, transparent 75%, black 78%)',
              }}
            ></div>
            
            {/* Shimmer effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"
              style={{ animation: 'shimmer 2s ease-in-out infinite' }}
            />
            
            {/* Refresh Icon - Centered and spinning */}
            <ArrowPathIcon 
              className="w-10 h-10 text-white relative z-10 animate-spin"
              style={{ 
                animationDuration: '0.8s',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            />
          </div>
          
          {/* Loading Text */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-5">
            <p className="text-white dark:text-gray-100 text-base font-bold drop-shadow-2xl animate-pulse whitespace-nowrap">
              Loading...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
