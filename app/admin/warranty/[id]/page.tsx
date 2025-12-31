'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAllOrders } from '@/lib/admin'
import type { Order } from '@/types'
import {
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

export default function ViewWarrantyPage() {
  const params = useParams()
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
      const found = orders.find(o => o.id === id && o.status === 'completed')
      setOrder(found || null)
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{t('admin.warranty.notFound')}</p>
        <Link href="/admin/warranty" className="mt-4 inline-block text-blue-600 hover:underline">
          {t('admin.warranty.backToList')}
        </Link>
      </div>
    )
  }

  // Calculate warranty end date (assuming 1 year warranty)
  const warrantyEndDate = new Date(order.date)
  warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + 1)
  const isWarrantyValid = warrantyEndDate > new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/warranty"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.warranty.warranty')} - {t('admin.warranty.order')} #{order.id.substring(0, 8)}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.warranty.orderDate')}: {new Date(order.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('admin.warranty.items')}
            </h3>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('admin.warranty.quantity')}: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {(item.quantity * item.price).toFixed(2)} DH
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{t('admin.warranty.noItems')}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('admin.warranty.warrantyInfo')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.warranty.status')}
                </label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  isWarrantyValid
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {isWarrantyValid ? t('admin.warranty.valid') : t('admin.warranty.expired')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.warranty.warrantyEndDate')}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {warrantyEndDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('admin.warranty.customerInfo')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.warranty.name')}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {order.customerName || t('admin.warranty.unknown')}
                </p>
              </div>
              {order.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.warranty.email')}
                  </label>
                  <p className="text-gray-900 dark:text-white">{order.email}</p>
                </div>
              )}
              {order.customerPhone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.warranty.phone')}
                  </label>
                  <p className="text-gray-900 dark:text-white">{order.customerPhone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

