'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAllMessages, updateMessageStatus } from '@/lib/messages'
import { ContactMessage } from '@/types'
import {
  EyeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export default function MessagesListPage() {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadMessages()
    const handleChange = () => loadMessages()
    window.addEventListener('pixelpad_messages_changed', handleChange)
    return () => window.removeEventListener('pixelpad_messages_changed', handleChange)
  }, [])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const data = await getAllMessages()
      setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (messageId: string, newStatus: 'new' | 'read' | 'replied') => {
    try {
      const email = messages.find(m => m.id === messageId)?.email || ''
      await updateMessageStatus(email, messageId, newStatus)
      await loadMessages()
      window.dispatchEvent(new Event('pixelpad_messages_changed'))
    } catch (error) {
      console.error('Error updating message status:', error)
    }
  }

  const filteredMessages = messages
    .filter(msg => {
      const matchesSearch = !searchQuery || 
        msg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || msg.status === statusFilter
      return matchesSearch && matchesStatus
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'read': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'replied': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.tabs.messages')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('admin.messages.manageMessages')} ({messages.length})
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.messages.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t('admin.messages.allStatuses')}</option>
            <option value="new">{t('admin.messages.status.new')}</option>
            <option value="read">{t('admin.messages.status.read')}</option>
            <option value="replied">{t('admin.messages.status.replied')}</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.messages.name')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.messages.email')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.messages.subject')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.messages.date')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.messages.status')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.messages.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {t('admin.messages.noMessages')}
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {message.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {message.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {message.subject || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(message.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={message.status || 'new'}
                        onChange={(e) => handleStatusChange(message.id, e.target.value as 'new' | 'read' | 'replied')}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(message.status || 'new')}`}
                      >
                        <option value="new">{t('admin.messages.status.new')}</option>
                        <option value="read">{t('admin.messages.status.read')}</option>
                        <option value="replied">{t('admin.messages.status.replied')}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/messages/${message.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        {t('admin.messages.view')}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Messages Cards - mobile */}
      <div className="grid gap-4 md:hidden">
        {filteredMessages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500">
            {t('admin.messages.noMessages')}
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div key={message.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{message.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(message.date).toLocaleDateString()}</div>
                </div>
                <select
                  value={message.status || 'new'}
                  onChange={(e) => handleStatusChange(message.id, e.target.value as 'new' | 'read' | 'replied')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border-0 ${getStatusColor(message.status || 'new')}`}
                >
                  <option value="new">{t('admin.messages.status.new')}</option>
                  <option value="read">{t('admin.messages.status.read')}</option>
                  <option value="replied">{t('admin.messages.status.replied')}</option>
                </select>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('admin.messages.email')}</div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">{message.email}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('admin.messages.subject')}</div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">{message.subject || '-'}</div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <Link
                  href={`/admin/messages/${message.id}`}
                  className="inline-flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm font-medium"
                >
                  <EyeIcon className="w-4 h-4" />
                  {t('admin.messages.view')}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

