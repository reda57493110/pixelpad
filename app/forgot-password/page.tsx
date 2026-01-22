"use client"

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetLink, setResetLink] = useState('')
  const router = useRouter()

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    setSent(false)
    setResetLink('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t('forgotPassword.error'))
        return
      }

      setSent(true)
      
      // In development, show the reset link
      if (data.resetLink) {
        setResetLink(data.resetLink)
      }

      // Check browser console for reset link (for development)
      if (process.env.NODE_ENV === 'development') {
        console.log('Reset link generated. Check the server console for the full link.')
      }
    } catch (err) {
      setError(t('forgotPassword.error'))
      console.error('Forgot password error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('forgotPassword.title')}</h1>
      <form onSubmit={handleSend} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('forgotPassword.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
          />
        </div>
        
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        {sent && !resetLink && (
          <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <span className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4" />
              {t('forgotPassword.sent')} <strong>{t('forgotPassword.checkEmail')}</strong>
            </span>
            <br />
            <span className="text-xs mt-2 block text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <InformationCircleIcon className="w-3 h-3" />
              {t('forgotPassword.developmentNote')}
            </span>
          </div>
        )}

        {resetLink && (
          <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              {t('forgotPassword.developmentLink')}
            </p>
            <a 
              href={resetLink}
              className="text-blue-600 dark:text-blue-400 break-all hover:underline"
            >
              {resetLink}
            </a>
            <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">
              {t('forgotPassword.developmentOnly')}
            </p>
          </div>
        )}

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('forgotPassword.sending') : t('forgotPassword.sendResetLink')}
        </button>

        <div className="text-center">
          <Link 
            href="/" 
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {t('forgotPassword.backToHome')}
          </Link>
        </div>
      </form>
    </div>
  )
}




