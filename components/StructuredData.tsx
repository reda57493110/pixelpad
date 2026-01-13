'use client'

import { useEffect } from 'react'

interface StructuredDataProps {
  data: object
}

export default function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    // Remove existing structured data if any
    const existing = document.getElementById('structured-data')
    if (existing) {
      existing.remove()
    }
    
    // Add structured data immediately but non-blocking
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    script.id = 'structured-data'
    script.async = true
    document.head.appendChild(script)
    
    return () => {
      const scriptToRemove = document.getElementById('structured-data')
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [data])

  return null
}
























