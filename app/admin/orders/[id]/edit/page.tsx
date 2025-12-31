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

export default function EditOrderPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    status: 'processing',
    customerName: '',
    customerPhone: '',
    city: '',
    email: '',
  })

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
      if (found) {
        setOrder(found)
        setFormData({
          status: found.status,
          customerName: found.customerName || '',
          customerPhone: found.customerPhone || '',
          city: found.city || '',
          email: found.email || '',
        })
      }
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return

    setIsSubmitting(true)
    try {
      await updateOrderStatus(order.id, formData.status as Order['status'])
      // Update other fields if needed via API
      window.dispatchEvent(new Event('pixelpad_orders_changed'))
      router.push(`/admin/orders/${order.id}`)
    } catch (error) {
      console.error('Error updating order:', error)
      alert(t('admin.errorUpdating') || 'Failed to update order')
    } finally {
      setIsSubmitting(false)
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
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/orders/${params.id}`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.orders.editOrder')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.orders.order')} #{order.id.substring(0, 8)}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('admin.orders.orderDetails')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.orders.status')} *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="processing">{t('admin.orders.status.processing')}</option>
                <option value="shipped">{t('admin.orders.status.shipped')}</option>
                <option value="completed">{t('admin.orders.status.completed') || 'Completed'}</option>
                <option value="cancelled">{t('admin.orders.status.cancelled')}</option>
                <option value="returned">{t('admin.orders.status.returned') || 'Returned'}</option>
                <option value="refunded">{t('admin.orders.status.refunded') || 'Refunded'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.orders.customerName')}
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.orders.email')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.orders.phone')}
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.orders.city')}
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/admin/orders/${params.id}`}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('admin.cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('admin.saving') : t('admin.orders.updateOrder')}
          </button>
        </div>
      </form>
    </div>
  )
}

