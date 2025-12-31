'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAllMessages, updateMessageStatus } from '@/lib/messages'
import { ContactMessage } from '@/types'
import {
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

export default function ViewMessagePage() {
  const params = useParams()
  const { t } = useLanguage()
  const [message, setMessage] = useState<ContactMessage | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadMessage(params.id as string)
    }
  }, [params.id])

  const loadMessage = async (id: string) => {
    try {
      setIsLoading(true)
      const messages = await getAllMessages()
      const found = messages.find(m => m.id === id)
      if (found) {
        setMessage(found)
        // Mark as read if new
        if (found.status === 'new') {
          await updateMessageStatus(found.email || '', id, 'read')
        }
      }
    } catch (error) {
      console.error('Error loading message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  if (!message) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{t('admin.messages.notFound')}</p>
        <Link href="/admin/messages" className="mt-4 inline-block text-blue-600 hover:underline">
          {t('admin.messages.backToList')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 md:gap-4">
        <Link
          href="/admin/messages"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
            {message.subject || t('admin.messages.message')}
          </h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {new Date(message.date).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow space-y-4 md:space-y-6">
        <div>
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-900 dark:text-white">
            {t('admin.messages.senderInfo')}
          </h3>
          <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
            <div className="md:border-0 border-t border-gray-200 dark:border-gray-700 pt-3 md:pt-0">
              <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('admin.messages.name')}
              </label>
              <p className="text-sm md:text-base text-gray-900 dark:text-white">{message.name}</p>
            </div>
            <div className="md:border-0 border-t border-gray-200 dark:border-gray-700 pt-3 md:pt-0">
              <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('admin.messages.email')}
              </label>
              <p className="text-sm md:text-base text-gray-900 dark:text-white break-words">{message.email}</p>
            </div>
            {message.phone && (
              <div className="md:border-0 border-t border-gray-200 dark:border-gray-700 pt-3 md:pt-0">
                <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.messages.phone')}
                </label>
                <p className="text-sm md:text-base text-gray-900 dark:text-white">{message.phone}</p>
              </div>
            )}
            {message.inquiryType && (
              <div className="md:border-0 border-t border-gray-200 dark:border-gray-700 pt-3 md:pt-0">
                <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.messages.inquiryType')}
                </label>
                <p className="text-sm md:text-base text-gray-900 dark:text-white">{message.inquiryType}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-900 dark:text-white">
            {t('admin.messages.message')}
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm md:text-base text-gray-900 dark:text-white whitespace-pre-wrap">
              {message.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

