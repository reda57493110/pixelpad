'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePermissions } from '@/hooks/usePermissions'
import { getAllCustomers } from '@/lib/admin'
import {
  UserIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

export default function CustomersListPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { can } = usePermissions()

  useEffect(() => {
    if (!can('customers.view')) {
      router.replace('/admin/orders')
    }
  }, [can, router])

  if (!can('customers.view')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Access denied. Redirecting...</p>
      </div>
    )
  }
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'guest'>('all')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      const data = await getAllCustomers()
      setCustomers(data)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncOrderCounts = async (email?: string) => {
    try {
      setIsSyncing(true)
      setSyncMessage(null)
      
      const response = await fetch('/api/admin/sync-order-counts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSyncMessage(
          email 
            ? `Order count synced for ${email}. ${result.syncedCount} customer(s) updated.`
            : `Order counts synced for all customers. ${result.syncedCount} customer(s) updated.`
        )
        // Reload customers to show updated counts
        await loadCustomers()
        // Clear message after 5 seconds
        setTimeout(() => setSyncMessage(null), 5000)
      } else {
        setSyncMessage(result.error || 'Failed to sync order counts')
        setTimeout(() => setSyncMessage(null), 5000)
      }
    } catch (error) {
      console.error('Error syncing order counts:', error)
      setSyncMessage('Failed to sync order counts')
      setTimeout(() => setSyncMessage(null), 5000)
    } finally {
      setIsSyncing(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const name = customer.name || ''
    const email = customer.email || ''
    const phone = customer.phone || ''
    const search = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      name.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search) ||
      phone.toLowerCase().includes(search)
    
    const matchesType = filterType === 'all' || 
      (filterType === 'customer' && !customer.isGuest) ||
      (filterType === 'guest' && customer.isGuest)
    
    return matchesSearch && matchesType
  })

  const regularCustomers = customers.filter(c => !c.isGuest).length
  const guestCustomers = customers.filter(c => c.isGuest).length

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading') || 'Loading...'}</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.customers.title') || 'Customers'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {t('admin.customers.description') || 'Manage all customers and guest customers'}
          </p>
        </div>
        <button
          onClick={() => syncOrderCounts()}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Order Counts'}
        </button>
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div className={`p-3 rounded-lg ${
          syncMessage.includes('Failed') 
            ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400' 
            : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'
        }`}>
          {syncMessage}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900/30 rounded-lg p-3">
              <UserGroupIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.customers.total') || 'Total Customers'}
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                {customers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
              <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.customers.regular') || 'Regular Customers'}
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                {regularCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3">
              <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.customers.guests') || 'Guest Customers'}
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                {guestCustomers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.customers.searchPlaceholder') || 'Search by name, email, or phone...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                filterType === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('admin.customers.all') || 'All'}
            </button>
            <button
              onClick={() => setFilterType('customer')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                filterType === 'customer'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('admin.customers.regular') || 'Regular'}
            </button>
            <button
              onClick={() => setFilterType('guest')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                filterType === 'guest'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('admin.customers.guests') || 'Guests'}
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table - desktop */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.customers.name') || 'Name'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.customers.email') || 'Email'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.customers.type') || 'Type'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.customers.phone') || 'Phone'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.customers.orders') || 'Orders'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.customers.city') || 'City'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.customers.joined') || 'Joined'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('admin.customers.noCustomers') || 'No customers found'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id || customer._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {customer.name || t('admin.customers.unknown') || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {customer.email || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {customer.isGuest ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                          {t('admin.customers.guest') || 'Guest'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {t('admin.customers.regular') || 'Customer'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {customer.phone || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {customer.orders || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {customer.city || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => syncOrderCounts(customer.email)}
                        disabled={isSyncing}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Sync order count for this customer"
                      >
                        <ArrowPathIcon className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sync
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customers Cards - mobile */}
      <div className="grid gap-3 md:hidden">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
            {t('admin.customers.noCustomers') || 'No customers found'}
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id || customer._id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {customer.name || t('admin.customers.unknown') || 'Unknown'}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {customer.email || '-'}
                  </div>
                </div>
                {customer.isGuest ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                    {t('admin.customers.guest') || 'Guest'}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {t('admin.customers.regular') || 'Customer'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                <div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.customers.phone') || 'Phone'}</div>
                  <div className="text-sm">{customer.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.customers.orders') || 'Orders'}</div>
                  <div className="text-sm">{customer.orders || 0}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.customers.city') || 'City'}</div>
                  <div className="text-sm">{customer.city || '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.customers.joined') || 'Joined'}</div>
                  <div className="text-sm">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '-'}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => syncOrderCounts(customer.email)}
                  disabled={isSyncing}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  <ArrowPathIcon className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync Order Count
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

