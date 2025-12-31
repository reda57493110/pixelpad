'use client'

import { ArrowPathIcon } from '@heroicons/react/24/outline'

interface RefreshButtonProps {
  onClick: () => void
  disabled?: boolean
  isRefreshing?: boolean
  title?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function RefreshButton({ 
  onClick, 
  disabled = false, 
  isRefreshing = false,
  title,
  className = '',
  size = 'md'
}: RefreshButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || isRefreshing}
      title={title}
      className={`
        ${sizeClasses[size]}
        relative
        bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500
        hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600
        active:from-blue-700 active:via-indigo-700 active:to-purple-700
        dark:from-blue-600 dark:via-indigo-600 dark:to-purple-600
        dark:hover:from-blue-500 dark:hover:via-indigo-500 dark:hover:to-purple-500
        text-white
        rounded-xl
        shadow-lg
        hover:shadow-xl
        hover:shadow-blue-500/50
        dark:hover:shadow-blue-500/30
        transition-all
        duration-300
        flex
        items-center
        justify-center
        group
        overflow-hidden
        ${disabled || isRefreshing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{ direction: 'ltr' }}
    >
      {/* Animated background gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 via-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundSize: '200% 100%', animation: isRefreshing ? 'gradientShift 2s ease infinite' : 'none' }}
      />
      
      {/* Shimmer effect */}
      {isRefreshing && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
        />
      )}

      {/* Icon */}
      <ArrowPathIcon 
        className={`
          ${iconSizes[size]}
          relative z-10
          transition-transform duration-300
          ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}
        `}
        style={{ direction: 'ltr' }}
      />

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-indigo-400/20 to-purple-400/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  )
}















