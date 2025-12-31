'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NewsletterSubscription() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError(t('footer.newsletter.emailRequired'))
      return
    }

    if (!validateEmail(email)) {
      setError(t('footer.newsletter.emailInvalid'))
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubscribed(true)
      setEmail('')
    } catch (err) {
      setError(t('footer.newsletter.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <p className="text-sm">
          {t('footer.newsletter.success')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h4 className="text-lg font-semibold text-white">
        {t('footer.newsletter.title')}
      </h4>
      <p className="text-gray-300 text-sm">
        {t('footer.newsletter.subtitle')}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('footer.newsletter.email')}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors duration-200 font-medium whitespace-nowrap"
          >
            {isSubmitting ? t('footer.newsletter.subscribing') : t('footer.newsletter.subscribe')}
          </button>
        </div>
        
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </form>
    </div>
  )
}











