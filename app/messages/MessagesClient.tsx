"use client"

export const dynamic = 'force-dynamic'
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

export default function MessagesPage() {
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
        <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold">{isAdmin ? t('messages.titleAll') : t('messages.title')}</h2>
              {isAdmin && (
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold flex items-center gap-1">
                  <ShieldCheckIcon className="h-4 w-4" />
                  {t('messages.admin')}
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isAdmin ? t('messages.subtitleAll') : t('messages.subtitle')}
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
              href="/contacts"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              {t('messages.newMessage')}
            </Link>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center">
            <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">{t('messages.noMessages')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {isAdmin ? t('messages.noMessagesAll') : t('messages.noMessagesUser')}
            </p>
            {!isAdmin && (
              <Link
                href="/contacts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                {t('messages.goToContact')}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => {
              const isEditing = editingId === msg.id
              // For non-admin users, they can only see their own messages, so isOwner is always true
              // For admin, we'll check ownership when they try to edit (in beginEdit function)
              const isOwner = !isAdmin || msg.email === user?.email
              const displayMsg = isEditing && draft ? draft : msg

              return (
                <div key={msg.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  {isEditing && draft ? (
                    <div className="space-y-4">
                      {/* Edit Form */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('messages.editMessage')}</h3>
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

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('messages.inquiryType')} *
                          </label>
                          <select
                            value={draft.inquiryType}
                            onChange={(e) => setDraft({ ...draft, inquiryType: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            <option value="general">{t('contact.form.inquiryTypeGeneral')}</option>
                            <option value="product">{t('contact.form.inquiryTypeProduct')}</option>
                            <option value="support">{t('contact.form.inquiryTypeSupport')}</option>
                            <option value="warranty">{t('contact.form.inquiryTypeWarranty')}</option>
                            <option value="other">{t('contact.form.inquiryTypeOther')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('messages.subject')} *
                          </label>
                          <input
                            type="text"
                            value={draft.subject}
                            onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder={t('messages.briefSubject')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('messages.message')} *
                          </label>
                          <textarea
                            value={draft.message}
                            onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            placeholder={t('messages.tellUsHelp')}
                          />
                        </div>

                        {draft.phone !== undefined && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t('messages.phone')}
                            </label>
                            <input
                              type="tel"
                              value={draft.phone || ''}
                              onChange={(e) => setDraft({ ...draft, phone: e.target.value || undefined })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              placeholder={t('messages.phonePlaceholder')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                              {getInquiryTypeLabel(displayMsg.inquiryType)}
                            </div>
                            {displayMsg.status === 'new' && (
                              <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                                {t('messages.new')}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {displayMsg.subject}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {formatDate(displayMsg.date)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isOwner && (
                            <button
                              onClick={() => beginEdit(msg)}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title={t('messages.edit')}
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => removeMessage(msg.id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title={t('messages.delete')}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('messages.from')}</span>
                            <div className="font-medium text-gray-900 dark:text-white">{displayMsg.name}</div>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('messages.email')}</span>
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                              <EnvelopeIcon className="h-4 w-4" />
                              {displayMsg.email}
                            </div>
                          </div>
                          {displayMsg.phone && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">{t('messages.phoneLabel')}</span>
                              <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                <PhoneIcon className="h-4 w-4" />
                                {displayMsg.phone}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('messages.message')}:</p>
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {displayMsg.message}
                          </p>
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

