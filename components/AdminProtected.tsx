'use client'

import { ReactNode, useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AdminProtected({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, token } = useAuth()
  const { t } = useLanguage()
  const [isVerifying, setIsVerifying] = useState(false)
  const hasVerifiedRef = useRef(false)
  const verificationInProgressRef = useRef(false)
  const lastTokenRef = useRef<string | null>(null)

  // Check if we have a valid admin or team user immediately (synchronous check)
  const isAdminOrTeam = user?.type === 'user' && (user?.role === 'admin' || user?.role === 'team')
  const shouldVerify = !isLoading && !isAdminOrTeam && !hasVerifiedRef.current

  useEffect(() => {
    // Wait for auth context to finish loading
    if (isLoading) {
      return
    }

    // If we already have a valid admin or team user in context, skip verification
    if (isAdminOrTeam) {
      setIsVerifying(false)
      hasVerifiedRef.current = true
      return
    }

    // Get token from localStorage if context token isn't available yet
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('pixelpad_token') : null)
    
    if (!authToken) {
      setIsVerifying(false)
      hasVerifiedRef.current = true
      return
    }

    // Check if token changed - if so, reset verification
    if (lastTokenRef.current !== authToken) {
      hasVerifiedRef.current = false
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('admin_verified_token')
      }
      lastTokenRef.current = authToken
    }

    // Check if we have a cached verification for this token
    const cachedToken = typeof window !== 'undefined' ? sessionStorage.getItem('admin_verified_token') : null
    if (cachedToken === authToken && hasVerifiedRef.current) {
      setIsVerifying(false)
      return
    }

    // Skip if verification already in progress
    if (verificationInProgressRef.current) {
      return
    }

    // Only verify if we haven't verified yet
    if (!hasVerifiedRef.current && shouldVerify) {
      verificationInProgressRef.current = true
      setIsVerifying(true)

      const verifyAdmin = async () => {
        try {
          // Verify token and check admin status on server
          const response = await fetch('/api/auth/verify-admin', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          })

          if (!response.ok) {
            // Token invalid or not admin
            setIsVerifying(false)
            hasVerifiedRef.current = true
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('admin_verified_token')
            }
            return
          }

          // Verification successful - cache it
          setIsVerifying(false)
          hasVerifiedRef.current = true
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('admin_verified_token', authToken)
          }
        } catch (error) {
          console.error('Admin verification error:', error)
          setIsVerifying(false)
          hasVerifiedRef.current = true
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('admin_verified_token')
          }
        } finally {
          verificationInProgressRef.current = false
        }
      }

      verifyAdmin()
    }
  }, [token, isLoading, user, isAdminOrTeam, shouldVerify])

  // Redirect to admin login if not authenticated (only after we've checked)
  useEffect(() => {
    if (!isLoading && !isVerifying && hasVerifiedRef.current) {
      if (!user || !isAdminOrTeam) {
        // Prevent redirect loop - only redirect if we're not already on login page
        if (pathname !== '/admin/login') {
          // Store the intended destination for redirect after login
          const returnUrl = pathname || '/admin'
          // Only add return parameter if it's different from default
          if (returnUrl === '/admin') {
            router.replace('/admin/login')
          } else {
            router.replace(`/admin/login?return=${encodeURIComponent(returnUrl)}`)
          }
        }
      }
    }
  }, [isLoading, isVerifying, user, isAdminOrTeam, router, pathname])

  // Skip protection for login route
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (isLoading || isVerifying) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="animate-pulse h-40 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    )
  }

  // If not admin or team, show loading while redirecting
  if (!user || !isAdminOrTeam) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4 mx-auto" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to login...</p>
      </div>
    )
  }

  return <>{children}</>
}

