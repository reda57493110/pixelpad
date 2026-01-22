'use client'

import Protected from '@/components/Protected'
import AccountLayout from '@/components/AccountLayout'
import RefreshButton from '@/components/RefreshButton'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getUserMessages, getAllMessages, deleteMessage, updateMessage, findMessageOwner, ContactMessage } from '@/lib/messages'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  TrashIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

function formatDate(iso: string) {
  try { 
    const date = new Date(iso)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // Format time
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    
    // Format date based on how recent it is
    if (diffDays === 0) {
      return `Today at ${time}`
    } else if (diffDays === 1) {
      return `Yesterday at ${time}`
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' }) + ` at ${time}`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }) + ` at ${time}`
    }
  } catch { 
    return iso 
  }
}

export default function MessagesClient() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ContactMessage | null>(null)
  const isAdmin = user?.email === 'admin@pixelpad.com'
  
  const getInquiryTypeLabel = (type: string): string => {
    return t(`contact.form.inquiryType${type.charAt(0).toUpperCase() + type.slice(1)}`) || type
  }

  // Ensure client-side only for localStorage access
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const loadMessages = async () => {
      try {
        // Admin sees all messages, regular users see only their messages
        if (isAdmin) {
          const allMessages = await getAllMessages()
          setMessages(allMessages)
        } else {
          const userMessages = await getUserMessages(user?.email)
          setMessages(userMessages)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
        setMessages([])
      }
    }
    loadMessages()
  }, [user?.email, refreshKey, isMounted, isAdmin])

  // Listen for changes in messages
  useEffect(() => {
    if (!isMounted) return
    const handleChange = async () => {
      try {
        if (isAdmin) {
          const allMessages = await getAllMessages()
          setMessages(allMessages)
        } else {
          const userMessages = await getUserMessages(user?.email)
          setMessages(userMessages)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }
    window.addEventListener('pixelpad_messages_changed', handleChange)
    return () => window.removeEventListener('pixelpad_messages_changed', handleChange)
  }, [user?.email, isMounted, isAdmin])

  const beginEdit = async (msg: ContactMessage) => {
    // Only allow users to edit their own messages (not admin editing others')
    if (isAdmin) {
      try {
        const ownerEmail = await findMessageOwner(msg.id)
        if (ownerEmail !== user?.email) {
          return // Admin cannot edit other people's messages
        }
      } catch (error) {
        console.error('Error finding message owner:', error)
        return
      }
    }
    setEditingId(msg.id)
    setDraft(JSON.parse(JSON.stringify(msg)))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft(null)
  }

  const saveEdit = async () => {
    if (!user || !draft) return
    
    try {
      // For admin, find which email bucket the message belongs to
      if (isAdmin) {
        const ownerEmail = await findMessageOwner(draft.id)
        if (ownerEmail) {
          await updateMessage(ownerEmail, draft.id, draft)
        }
      } else {
        await updateMessage(user.email, draft.id, draft)
      }
      
      setEditingId(null)
      setDraft(null)
      setRefreshKey(k => k + 1)
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  const removeMessage = async (id: string) => {
    if (!user) return
    if (typeof window !== 'undefined' && window.confirm(t('messages.deleteConfirm'))) {
      try {
        // For admin, find which email bucket the message belongs to
        if (isAdmin) {
          const ownerEmail = await findMessageOwner(id)
          if (ownerEmail) {
            await deleteMessage(ownerEmail, id)
          }
        } else {
          await deleteMessage(user.email, id)
        }
        setRefreshKey(k => k + 1)
      } catch (error) {
        console.error('Error deleting message:', error)
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
      <AccountLayout title={t('account.messages.title')}>
        <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {isAdmin ? t('messages.titleAll') : t('messages.title')}
              </h2>
              {isAdmin && (
                <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[10px] sm:text-xs font-bold shadow-md flex items-center gap-1.5">
                  <ShieldCheckIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {t('messages.admin')}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {isAdmin ? t('messages.subtitleAll') : t('messages.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2" style={{ direction: 'ltr' }}>
            <RefreshButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              isRefreshing={isRefreshing}
              title={t('orders.refresh')}
            />
            <Link
              href="/contacts"
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-semibold"
            >
              <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('messages.newMessage')}</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-6 sm:p-8 text-center border border-gray-200 dark:border-gray-700">
            <ChatBubbleLeftRightIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-1.5">{t('messages.noMessages')}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
              {isAdmin ? t('messages.noMessagesAll') : t('messages.noMessagesUser')}
            </p>
            {!isAdmin && (
              <Link
                href="/contacts"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-semibold"
              >
                <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {t('messages.goToContact')}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 w-full">
            {messages.map(msg => {
              const isEditing = editingId === msg.id
              // For non-admin users, they can only see their own messages, so isOwner is always true
              // For admin, we'll check ownership when they try to edit (in beginEdit function)
              const isOwner = !isAdmin || msg.email === user?.email
              const displayMsg = isEditing && draft ? draft : msg

              return (
                <div key={msg.id} className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-5 lg:p-6 hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 w-full max-w-full min-w-0 overflow-hidden border border-gray-200 dark:border-gray-600">
                  {isEditing && draft ? (
                    <div className="space-y-4 w-full">
                      {/* Edit Form */}
                      <div className="flex items-center justify-between mb-3 sm:mb-4 w-full">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{t('messages.editMessage')}</h3>
                        <div className="flex gap-1.5">
                          <button
                            onClick={saveEdit}
                            className="p-2 sm:p-2.5 text-primary-600 hover:text-primary-700 dark:hover:text-primary-500 transition-colors rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                            title={t('messages.saveChanges')}
                          >
                            <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 sm:p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            title={t('messages.cancel')}
                          >
                            <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t('messages.inquiryType')} *
                          </label>
                          <select
                            value={draft.inquiryType}
                            onChange={(e) => setDraft({ ...draft, inquiryType: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            <option value="general">{t('contact.form.inquiryTypeGeneral')}</option>
                            <option value="product">{t('contact.form.inquiryTypeProduct')}</option>
                            <option value="support">{t('contact.form.inquiryTypeSupport')}</option>
                            <option value="warranty">{t('contact.form.inquiryTypeWarranty')}</option>
                            <option value="other">{t('contact.form.inquiryTypeOther')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t('messages.subject')} *
                          </label>
                          <input
                            type="text"
                            value={draft.subject}
                            onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder={t('messages.briefSubject')}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t('messages.message')} *
                          </label>
                          <textarea
                            value={draft.message}
                            onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            placeholder={t('messages.tellUsHelp')}
                          />
                        </div>

                        {draft.phone !== undefined && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              {t('messages.phone')}
                            </label>
                            <input
                              type="tel"
                              value={draft.phone || ''}
                              onChange={(e) => setDraft({ ...draft, phone: e.target.value || undefined })}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              placeholder={t('messages.phonePlaceholder')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3 sm:mb-4 w-full min-w-0 gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                            {displayMsg.status === 'new' && (
                              <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary-500 text-white text-xs sm:text-sm font-bold">
                                {t('messages.new')}
                              </span>
                            )}
                            <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary-500 text-white text-xs sm:text-sm font-bold">
                              {getInquiryTypeLabel(displayMsg.inquiryType)}
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 leading-tight">
                            {displayMsg.subject}
                          </h3>
                          <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-4">
                            {displayMsg.message}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                              <span className="font-medium truncate">{displayMsg.email}</span>
                            </div>
                            {displayMsg.phone && (
                              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                <span className="font-medium">{displayMsg.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 sm:gap-2.5 bg-primary-50 dark:bg-gray-700 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-primary-200 dark:border-gray-600">
                              <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                              <span className="text-xs sm:text-sm lg:text-base font-bold text-primary-700 dark:text-primary-300">{formatDate(displayMsg.date)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-1.5 sm:ml-3 flex-shrink-0">
                          {isOwner && (
                            <button
                              onClick={() => beginEdit(msg)}
                              className="p-2 sm:p-2.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                              title={t('messages.edit')}
                            >
                              <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => removeMessage(msg.id)}
                            className="p-2 sm:p-2.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title={t('messages.delete')}
                          >
                            <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
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
