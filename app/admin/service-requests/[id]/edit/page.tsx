'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAllServiceRequests, updateServiceRequestStatus } from '@/lib/serviceRequests'
import { ServiceRequest } from '@/types'
import {
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

export default function EditServiceRequestPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [request, setRequest] = useState<ServiceRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState('new')

  useEffect(() => {
    if (params.id) {
      loadRequest(params.id as string)
    }
  }, [params.id])

  const loadRequest = async (id: string) => {
    try {
      setIsLoading(true)
      const requests = await getAllServiceRequests()
      const found = requests.find(r => r.id === id)
      if (found) {
        setRequest(found)
        setStatus(found.status || 'new')
      }
    } catch (error) {
      console.error('Error loading service request:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!request) return

    setIsSubmitting(true)
    try {
      await updateServiceRequestStatus(request.email || '', request.id, status as any)
      window.dispatchEvent(new Event('pixelpad_service_requests_changed'))
      router.push(`/admin/service-requests/${request.id}`)
    } catch (error) {
      console.error('Error updating request:', error)
      if (typeof window !== 'undefined') {
        window.alert(t('admin.errorUpdating') || 'Failed to update request')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{t('admin.serviceRequests.notFound')}</p>
        <Link href="/admin/service-requests" className="mt-4 inline-block text-blue-600 hover:underline">
          {t('admin.serviceRequests.backToList')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/service-requests/${params.id}`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.serviceRequests.editRequest')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.serviceRequests.request')} #{request.id.substring(0, 8)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('admin.serviceRequests.status')}
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.serviceRequests.status')} *
            </label>
            <select
              required
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="new">{t('admin.serviceRequests.status.new')}</option>
              <option value="in-progress">{t('admin.serviceRequests.status.inProgress')}</option>
              <option value="completed">{t('admin.serviceRequests.status.completed')}</option>
              <option value="cancelled">{t('admin.serviceRequests.status.cancelled')}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/admin/service-requests/${params.id}`}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('admin.cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('admin.saving') : t('admin.serviceRequests.updateRequest')}
          </button>
        </div>
      </form>
    </div>
  )
}

