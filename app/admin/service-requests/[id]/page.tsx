'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAllServiceRequests } from '@/lib/serviceRequests'
import { ServiceRequest } from '@/types'
import {
  ArrowLeftIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'

export default function ViewServiceRequestPage() {
  const params = useParams()
  const { t } = useLanguage()
  const [request, setRequest] = useState<ServiceRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      setRequest(found || null)
    } catch (error) {
      console.error('Error loading service request:', error)
    } finally {
      setIsLoading(false)
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/service-requests"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('admin.serviceRequests.request')} #{request.id.substring(0, 8)}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {new Date(request.date).toLocaleString()}
            </p>
          </div>
        </div>
        <Link
          href={`/admin/service-requests/${params.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
        >
          <PencilIcon className="w-5 h-5" />
          {t('admin.serviceRequests.edit')}
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            {t('admin.serviceRequests.contactInfo')}
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('admin.serviceRequests.fullName')}
              </label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{request.fullName}</p>
            </div>
            
            {/* Contact Information - Grouped together */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2.5">
              {request.companyName && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.serviceRequests.companyName')}
                  </label>
                  <p className="text-xs sm:text-base text-gray-900 dark:text-white">{request.companyName}</p>
                </div>
              )}
              {request.email && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.serviceRequests.email')}
                  </label>
                  <p className="text-xs sm:text-base text-gray-900 dark:text-white break-all">{request.email}</p>
                </div>
              )}
              {(request.phone || request.emailOrPhone) && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.serviceRequests.phone') || t('admin.serviceRequests.contact') || 'Phone'}
                  </label>
                  <p className="text-xs sm:text-base text-gray-900 dark:text-white">{request.phone || request.emailOrPhone}</p>
                </div>
              )}
              {request.city && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.serviceRequests.city')}
                  </label>
                  <p className="text-xs sm:text-base text-gray-900 dark:text-white">{request.city}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('admin.serviceRequests.serviceDetails')}
          </h3>
          <div className="space-y-4">
            {request.numberOfComputers && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.serviceRequests.numberOfComputers')}
                </label>
                <p className="text-gray-900 dark:text-white">{request.numberOfComputers}</p>
              </div>
            )}
            {request.needCameras !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.serviceRequests.needCameras')}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {request.needCameras ? t('admin.yes') : t('admin.no')}
                </p>
              </div>
            )}
            {request.preferredDate && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.serviceRequests.preferredDate')}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(request.preferredDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {request.additionalDetails && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.serviceRequests.additionalDetails')}
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {request.additionalDetails}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

