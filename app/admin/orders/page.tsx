'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAllOrders, updateOrderStatus } from '@/lib/admin'
import type { Order } from '@/types'
import {
  EyeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export default function OrdersListPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadOrders()
    const handleChange = () => loadOrders()
    window.addEventListener('pixelpad_orders_changed', handleChange)
    return () => window.removeEventListener('pixelpad_orders_changed', handleChange)
  }, [])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      const data = await getAllOrders()
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      console.log('Changing status:', { orderId, newStatus, currentOrders: orders.length })
      
      // Optimistically update the UI
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
        )
      )
      
      const success = await updateOrderStatus(orderId, newStatus as Order['status'])
      if (!success) {
        // Revert optimistic update on failure
        await loadOrders()
        alert(t('admin.errorUpdating') || 'Failed to update order status')
        return
      }
      
      // Reload orders to ensure we have the latest data from the server
      await loadOrders()
      window.dispatchEvent(new Event('pixelpad_orders_changed'))
    } catch (error) {
      console.error('Error updating order status:', error)
      // Revert optimistic update on error
      await loadOrders()
      alert(t('admin.errorUpdating') || 'Failed to update order status')
    }
  }

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = !searchQuery || 
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'shipped': return 'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'returned': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'refunded': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const statusOptions = ['all', 'processing', 'shipped', 'completed', 'cancelled', 'returned', 'refunded']

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.tabs.orders')}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('admin.orders.manageOrders')} ({orders.length})
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.orders.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? t('admin.orders.allStatuses') : t(`admin.orders.status.${status}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table - desktop */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.orders.orderId')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.orders.customer')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.orders.date')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.orders.total')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.orders.status')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.orders.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {t('admin.orders.noOrders')}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                      #{order.id.substring(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.customerName || t('admin.orders.unknown')}
                        </div>
                        {order.email && (order.email === 'guest' || order.email.startsWith('guest-') || order.email.includes('@pixelpad.local')) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                            Guest
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {order.email || order.customerPhone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                      {order.total.toFixed(2)} DH
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)} dark:[color-scheme:dark]`}
                      >
                        <option value="processing">{t('admin.orders.status.processing')}</option>
                        <option value="shipped">{t('admin.orders.status.shipped')}</option>
                        <option value="completed">{t('admin.orders.status.completed') || 'Completed'}</option>
                        <option value="cancelled">{t('admin.orders.status.cancelled')}</option>
                        <option value="returned">{t('admin.orders.status.returned') || 'Returned'}</option>
                        <option value="refunded">{t('admin.orders.status.refunded') || 'Refunded'}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        {t('admin.orders.view')}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Cards - mobile */}
      <div className="grid gap-3 md:hidden">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 text-center text-gray-500 text-sm">
            {t('admin.orders.noOrders')}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.orders.orderId')}</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">#{order.id.substring(0, 8)}</div>
                </div>
                {order.email && (order.email === 'guest' || order.email.startsWith('guest-') || order.email.includes('@pixelpad.local')) && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                    Guest
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                  {order.customerName || t('admin.orders.unknown')}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  {order.email || order.customerPhone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                <div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.orders.date')}</div>
                  <div className="text-sm">{new Date(order.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.orders.total')}</div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{order.total.toFixed(2)} DH</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className={`px-3 py-2 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)} flex-1 dark:[color-scheme:dark]`}
                >
                  <option value="processing">{t('admin.orders.status.processing')}</option>
                  <option value="shipped">{t('admin.orders.status.shipped')}</option>
                  <option value="completed">{t('admin.orders.status.completed') || 'Completed'}</option>
                  <option value="cancelled">{t('admin.orders.status.cancelled')}</option>
                  <option value="returned">{t('admin.orders.status.returned') || 'Returned'}</option>
                  <option value="refunded">{t('admin.orders.status.refunded') || 'Refunded'}</option>
                </select>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="inline-flex items-center gap-1 px-3 py-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors text-xs font-medium"
                >
                  <EyeIcon className="w-4 h-4" />
                  {t('admin.orders.view')}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {t('admin.orders.showing')} {filteredOrders.length} {t('admin.orders.of')} {orders.length} {t('admin.orders.orders')}
      </div>
    </div>
  )
}

