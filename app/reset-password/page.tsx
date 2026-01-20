"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

function ResetPasswordForm() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      validateToken(tokenParam)
    } else {
      setIsValidating(false)
      setError(t('resetPassword.noToken'))
    }
  }, [searchParams])

  const validateToken = async (tokenToValidate: string) => {
    try {
      // We'll validate when submitting, but we can check if token exists
      setIsValidating(false)
      setIsValid(true)
    } catch (err) {
      setIsValidating(false)
      setIsValid(false)
      setError(t('resetPassword.invalidToken'))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError(t('resetPassword.passwordMin'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('resetPassword.passwordMismatch'))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t('forgotPassword.error'))
        return
      }

      // Password has been updated in MongoDB, no need to update localStorage
      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError(t('forgotPassword.error'))
      console.error('Reset password error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">{t('resetPassword.validating')}</p>
        </div>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{t('resetPassword.invalidLink')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || t('resetPassword.invalidToken')}</p>
          <a 
            href="/forgot-password" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {t('resetPassword.requestNewLink')}
          </a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircleIcon className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">{t('resetPassword.success')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('resetPassword.successDesc')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t('resetPassword.redirecting')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('resetPassword.title')}</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('resetPassword.newPassword')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            placeholder={t('resetPassword.newPasswordPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('resetPassword.confirmPassword')}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            placeholder={t('resetPassword.confirmPasswordPlaceholder')}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('resetPassword.resetting') : t('resetPassword.resetPassword')}
        </button>

        <div className="text-center">
          <a 
            href="/forgot-password" 
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {t('resetPassword.requestNewLink')}
          </a>
        </div>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  const { t } = useLanguage()
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">{t('resetPassword.loading')}</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

