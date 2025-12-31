'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAllServiceRequests, updateServiceRequestStatus } from '@/lib/serviceRequests'
import { ServiceRequest } from '@/types'
import {
  EyeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export default function ServiceRequestsListPage() {
  const { t } = useLanguage()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadRequests()
    const handleChange = () => loadRequests()
    window.addEventListener('pixelpad_service_requests_changed', handleChange)
    return () => window.removeEventListener('pixelpad_service_requests_changed', handleChange)
  }, [])

  const loadRequests = async () => {
    try {
      setIsLoading(true)
      const data = await getAllServiceRequests()
      setRequests(data)
    } catch (error) {
      console.error('Error loading service requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const email = requests.find(r => r.id === requestId)?.email || ''
      await updateServiceRequestStatus(email, requestId, newStatus as any)
      await loadRequests()
      window.dispatchEvent(new Event('pixelpad_service_requests_changed'))
    } catch (error) {
      console.error('Error updating request status:', error)
    }
  }

  const filteredRequests = requests
    .filter(req => {
      const matchesSearch = !searchQuery || 
        req.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.email?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter
      return matchesSearch && matchesStatus
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.tabs.serviceRequests')}
        </h2>
        <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('admin.serviceRequests.manageRequests')} ({requests.length})
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.serviceRequests.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t('admin.serviceRequests.allStatuses')}</option>
            <option value="new">{t('admin.serviceRequests.status.new')}</option>
            <option value="in-progress">{t('admin.serviceRequests.status.inProgress')}</option>
            <option value="completed">{t('admin.serviceRequests.status.completed')}</option>
            <option value="cancelled">{t('admin.serviceRequests.status.cancelled')}</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.serviceRequests.name')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.serviceRequests.company')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.serviceRequests.phone') || 'Phone'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.serviceRequests.date')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.serviceRequests.status')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.serviceRequests.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {t('admin.serviceRequests.noRequests')}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {request.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {request.companyName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {request.phone || request.emailOrPhone || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(request.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={request.status || 'new'}
                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(request.status || 'new')}`}
                      >
                        <option value="new">{t('admin.serviceRequests.status.new')}</option>
                        <option value="in-progress">{t('admin.serviceRequests.status.inProgress')}</option>
                        <option value="completed">{t('admin.serviceRequests.status.completed')}</option>
                        <option value="cancelled">{t('admin.serviceRequests.status.cancelled')}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/service-requests/${request.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        {t('admin.serviceRequests.view')}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Requests Cards - mobile */}
      <div className="grid gap-3 md:hidden">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 text-center text-gray-500 text-xs">
            {t('admin.serviceRequests.noRequests')}
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 space-y-2.5">
              {/* Name and Status Section */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2">{request.fullName}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{new Date(request.date).toLocaleDateString()}</div>
                </div>
                <select
                  value={request.status || 'new'}
                  onChange={(e) => handleStatusChange(request.id, e.target.value)}
                  className={`px-2 py-1 text-[10px] font-semibold rounded-full border-0 flex-shrink-0 ${getStatusColor(request.status || 'new')}`}
                >
                  <option value="new">{t('admin.serviceRequests.status.new')}</option>
                  <option value="in-progress">{t('admin.serviceRequests.status.inProgress')}</option>
                  <option value="completed">{t('admin.serviceRequests.status.completed')}</option>
                  <option value="cancelled">{t('admin.serviceRequests.status.cancelled')}</option>
                </select>
              </div>

              {/* Contact Information Section */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-700 dark:text-gray-300">
                  <div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">{t('admin.serviceRequests.email') || 'Email'}</div>
                    <div className="text-xs break-all">{request.email || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">{t('admin.serviceRequests.company')}</div>
                    <div className="text-xs">{request.companyName || '-'}</div>
                  </div>
                </div>
                {(request.phone || request.emailOrPhone) && (
                  <div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">{t('admin.serviceRequests.phone') || 'Phone'}</div>
                    <div className="text-xs">{request.phone || request.emailOrPhone || '-'}</div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">{t('admin.serviceRequests.city') || 'City'}</div>
                  <div className="text-xs">{request.city || '-'}</div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href={`/admin/service-requests/${request.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-[10px] font-medium"
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                  {t('admin.serviceRequests.view')}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

