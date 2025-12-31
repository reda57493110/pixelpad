'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAllOrders, updateOrderStatus } from '@/lib/admin'
import type { Order } from '@/types'
import {
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

export default function ViewOrderPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadOrder(params.id as string)
    }
  }, [params.id])

  const loadOrder = async (id: string) => {
    try {
      setIsLoading(true)
      const orders = await getAllOrders()
      const found = orders.find(o => o.id === id)
      setOrder(found || null)
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return
    try {
      await updateOrderStatus(order.id, newStatus as Order['status'])
      await loadOrder(order.id)
      window.dispatchEvent(new Event('pixelpad_orders_changed'))
    } catch (error) {
      console.error('Error updating order status:', error)
      alert(t('admin.errorUpdating') || 'Failed to update order status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'shipped': return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'returned': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'refunded': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{t('admin.orders.notFound')}</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-primary-600 hover:underline">
          {t('admin.orders.backToList')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('admin.orders.order')} #{order.id.substring(0, 8)}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {new Date(order.date).toLocaleString()}
            </p>
          </div>
        </div>
        <div>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg border-0 ${getStatusColor(order.status)}`}
          >
            <option value="processing">{t('admin.orders.status.processing')}</option>
            <option value="shipped">{t('admin.orders.status.shipped')}</option>
            <option value="completed">{t('admin.orders.status.completed') || 'Completed'}</option>
            <option value="cancelled">{t('admin.orders.status.cancelled')}</option>
            <option value="returned">{t('admin.orders.status.returned') || 'Returned'}</option>
            <option value="refunded">{t('admin.orders.status.refunded') || 'Refunded'}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('admin.orders.items')}
            </h3>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('admin.orders.quantity')}: {item.quantity} × {item.price.toFixed(2)} DH
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {(item.quantity * item.price).toFixed(2)} DH
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">{t('admin.orders.noItems')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('admin.orders.customerInfo')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.orders.name')}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {order.customerName || t('admin.orders.unknown')}
                </p>
              </div>
              {order.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.orders.email')}
                  </label>
                  <p className="text-gray-900 dark:text-white">{order.email}</p>
                </div>
              )}
              {order.customerPhone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.orders.phone')}
                  </label>
                  <p className="text-gray-900 dark:text-white">{order.customerPhone}</p>
                </div>
              )}
              {order.city && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.orders.city')}
                  </label>
                  <p className="text-gray-900 dark:text-white">{order.city}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('admin.orders.summary')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('admin.orders.subtotal')}
                </span>
                <span className="text-gray-900 dark:text-white">
                  {order.total.toFixed(2)} DH
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('admin.orders.total')}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {order.total.toFixed(2)} DH
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

