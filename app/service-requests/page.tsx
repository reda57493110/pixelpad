'use client'

export const dynamic = 'force-dynamic'
import Protected from '@/components/Protected'
import AccountLayout from '@/components/AccountLayout'
import RefreshButton from '@/components/RefreshButton'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getUserServiceRequests, getAllServiceRequests, deleteServiceRequest, updateServiceRequest, findServiceRequestOwner } from '@/lib/serviceRequests'
import { ServiceRequest } from '@/types'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ComputerDesktopIcon,
  CameraIcon,
  TrashIcon,
  ClockIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline'

function formatDate(iso: string) {
  try {
    const date = new Date(iso)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return iso
  }
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'new': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'in-progress': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'completed': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    'cancelled': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }
  return colors[status] || colors['new']
}

export default function ServiceRequestsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ServiceRequest | null>(null)
  const isAdmin = user?.email === 'admin@pixelpad.com'
  
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'new': 'serviceRequests.status.new',
      'in-progress': 'serviceRequests.status.inProgress',
      'completed': 'serviceRequests.status.completed',
      'cancelled': 'serviceRequests.status.cancelled'
    }
    return t(statusMap[status] || status) || status
  }

  // Ensure client-side only for localStorage access
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const loadRequests = async () => {
      try {
        // Admin sees all requests, regular users see only their requests
        if (isAdmin) {
          const allRequests = await getAllServiceRequests()
          setRequests(allRequests)
        } else {
          const userRequests = await getUserServiceRequests(user?.email)
          setRequests(userRequests)
        }
      } catch (error) {
        console.error('Error loading service requests:', error)
        setRequests([])
      }
    }
    loadRequests()
  }, [user?.email, refreshKey, isMounted, isAdmin])

  // Listen for changes in service requests
  useEffect(() => {
    if (!isMounted) return
    const handleChange = async () => {
      try {
        if (isAdmin) {
          const allRequests = await getAllServiceRequests()
          setRequests(allRequests)
        } else {
          const userRequests = await getUserServiceRequests(user?.email)
          setRequests(userRequests)
        }
      } catch (error) {
        console.error('Error loading service requests:', error)
      }
    }
    window.addEventListener('pixelpad_service_requests_changed', handleChange)
    return () => window.removeEventListener('pixelpad_service_requests_changed', handleChange)
  }, [user?.email, isMounted, isAdmin])

  const beginEdit = async (req: ServiceRequest) => {
    // Only allow users to edit their own requests (not admin editing others')
    if (isAdmin) {
      try {
        const ownerEmail = await findServiceRequestOwner(req.id)
        if (ownerEmail !== user?.email) {
          return // Admin cannot edit other people's requests
        }
      } catch (error) {
        console.error('Error finding service request owner:', error)
        return
      }
    }
    setEditingId(req.id)
    setDraft(JSON.parse(JSON.stringify(req)))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft(null)
  }

  const saveEdit = async () => {
    if (!user || !draft) return

    try {
      // For admin, find which email bucket the request belongs to
      if (isAdmin) {
        const ownerEmail = await findServiceRequestOwner(draft.id)
        if (ownerEmail) {
          await updateServiceRequest(ownerEmail, draft.id, draft)
        }
      } else {
        await updateServiceRequest(user.email, draft.id, draft)
      }

      setEditingId(null)
      setDraft(null)
      setRefreshKey(k => k + 1)
    } catch (error) {
      console.error('Error saving service request:', error)
    }
  }

  const removeRequest = async (id: string) => {
    if (!user) return
    if (typeof window !== 'undefined' && window.confirm(t('serviceRequests.deleteConfirm'))) {
      try {
        // For admin, find which email bucket the request belongs to
        if (isAdmin) {
          const ownerEmail = await findServiceRequestOwner(id)
          if (ownerEmail) {
            await deleteServiceRequest(ownerEmail, id)
          }
        } else {
          await deleteServiceRequest(user.email, id)
        }
        setRefreshKey(k => k + 1)
      } catch (error) {
        console.error('Error deleting service request:', error)
      }
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setRefreshKey(k => k + 1)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <Protected>
      <AccountLayout title={t('account.serviceRequests.title')}>
        <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold">{isAdmin ? t('serviceRequests.titleAll') : t('serviceRequests.title')}</h2>
              {isAdmin && (
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold flex items-center gap-1">
                  <ShieldCheckIcon className="h-4 w-4" />
                  {t('messages.admin')}
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isAdmin ? t('serviceRequests.subtitleAll') : t('serviceRequests.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3" style={{ direction: 'ltr' }}>
            <RefreshButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              isRefreshing={isRefreshing}
              title={t('orders.refresh')}
            />
            <Link
              href="/services"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <ComputerDesktopIcon className="h-5 w-5" />
              {t('serviceRequests.newRequest')}
            </Link>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center">
            <ComputerDesktopIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">{t('serviceRequests.noRequests')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {isAdmin ? t('serviceRequests.noRequestsAll') : t('serviceRequests.noRequestsUser')}
            </p>
            {!isAdmin && (
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <ComputerDesktopIcon className="h-5 w-5" />
                {t('serviceRequests.goToServices')}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => {
              const isEditing = editingId === req.id
              // For non-admin users, they can only see their own requests, so isOwner is always true
              // For admin, we'll check ownership when they try to edit (in beginEdit function)
              const isOwner = !isAdmin || req.email === user?.email
              const displayReq = isEditing && draft ? draft : req

              return (
                <div key={req.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  {isEditing && draft ? (
                    <div className="space-y-4">
                      {/* Edit Form */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('serviceRequests.editRequest')}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="p-2 text-green-600 hover:text-green-700 dark:hover:text-green-500 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                            title={t('messages.saveChanges')}
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            title={t('messages.cancel')}
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('serviceRequests.fullName')} *
                          </label>
                          <input
                            type="text"
                            value={draft.fullName}
                            onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('serviceRequests.companyName')}
                          </label>
                          <input
                            type="text"
                            value={draft.companyName || ''}
                            onChange={(e) => setDraft({ ...draft, companyName: e.target.value || undefined })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('serviceRequests.city')} *
                          </label>
                          <input
                            type="text"
                            value={draft.city}
                            onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('serviceRequests.emailOrPhone')} *
                          </label>
                          <input
                            type="text"
                            value={draft.emailOrPhone}
                            onChange={(e) => setDraft({ ...draft, emailOrPhone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('serviceRequests.numberOfComputers')} *
                          </label>
                          <input
                            type="number"
                            value={draft.numberOfComputers}
                            onChange={(e) => setDraft({ ...draft, numberOfComputers: e.target.value })}
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('serviceRequests.needCameras')} *
                          </label>
                          <select
                            value={draft.needCameras}
                            onChange={(e) => setDraft({ ...draft, needCameras: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            <option value="Yes">{t('serviceRequests.yes')}</option>
                            <option value="No">{t('serviceRequests.no')}</option>
                            <option value="Not sure">{t('serviceRequests.notSure')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('serviceRequests.preferredDate')}
                          </label>
                          <input
                            type="date"
                            value={draft.preferredDate || ''}
                            onChange={(e) => setDraft({ ...draft, preferredDate: e.target.value || undefined })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('serviceRequests.additionalDetails')}
                          </label>
                          <textarea
                            value={draft.additionalDetails || ''}
                            onChange={(e) => setDraft({ ...draft, additionalDetails: e.target.value || undefined })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(displayReq.status || 'new')}`}>
                              {getStatusLabel(displayReq.status || 'new')}
                            </div>
                            {displayReq.status === 'new' && (
                              <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                                {t('serviceRequests.status.new')}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {t('serviceRequests.serviceRequest')} - {displayReq.fullName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {formatDate(displayReq.date)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isOwner && (
                            <button
                              onClick={() => beginEdit(req)}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title={t('serviceRequests.edit')}
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => removeRequest(req.id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title={t('serviceRequests.delete')}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('serviceRequests.fullName')}:</span>
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              {displayReq.fullName}
                            </div>
                          </div>
                          {displayReq.companyName && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">{t('serviceRequests.company')}</span>
                              <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                <BuildingOfficeIcon className="h-4 w-4" />
                                {displayReq.companyName}
                              </div>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('serviceRequests.city')}:</span>
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                              <MapPinIcon className="h-4 w-4" />
                              {displayReq.city}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('serviceRequests.contact')}</span>
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                              {displayReq.emailOrPhone.includes('@') ? (
                                <EnvelopeIcon className="h-4 w-4" />
                              ) : (
                                <PhoneIcon className="h-4 w-4" />
                              )}
                              {displayReq.emailOrPhone}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('serviceRequests.numberOfComputersLabel')}</span>
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                              <ComputerDesktopIcon className="h-4 w-4" />
                              {displayReq.numberOfComputers}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('serviceRequests.needCamerasLabel')}</span>
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                              <CameraIcon className="h-4 w-4" />
                              {displayReq.needCameras}
                            </div>
                          </div>
                          {displayReq.preferredDate && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">{t('serviceRequests.preferredDateLabel')}</span>
                              <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                {new Date(displayReq.preferredDate).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>

                        {displayReq.additionalDetails && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('serviceRequests.additionalDetailsLabel')}</p>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                              {displayReq.additionalDetails}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
        </div>
      </AccountLayout>
    </Protected>
  )
}







