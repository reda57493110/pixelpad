'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

function scheduleIdle(cb: () => void) {
  if (typeof window === 'undefined') return
  const w = window as Window & { requestIdleCallback?: (fn: () => void, opts?: { timeout: number }) => number }
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(cb, { timeout: 4000 })
  } else {
    setTimeout(cb, 2000)
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const bootStarted = useRef(false)
  const pagePathRef = useRef('')

  const pagePath =
    pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
  pagePathRef.current = pagePath

  useEffect(() => {
    if (!GA_ID || typeof window === 'undefined') return

    const sendPageView = () => {
      if (typeof window.gtag === 'function') {
        window.gtag('config', GA_ID, { page_path: pagePathRef.current })
      }
    }

    sendPageView()

    if (bootStarted.current) return
    bootStarted.current = true

    scheduleIdle(() => {
      if (typeof window.gtag === 'function') {
        sendPageView()
        return
      }

      const script1 = document.createElement('script')
      script1.async = true
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
      document.head.appendChild(script1)

      const script2 = document.createElement('script')
      script2.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
      `
      document.head.appendChild(script2)

      sendPageView()
    })
  }, [pathname, searchParams])

  return null
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}
