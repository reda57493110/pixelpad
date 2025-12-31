'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAllUsers } from '@/lib/admin'
import { getUserOrders } from '@/lib/orders'
import type { Order } from '@/types'
import {
  ArrowLeftIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'

export default function ViewUserPage() {
  const params = useParams()
  const { t } = useLanguage()
  const [user, setUser] = useState<any | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadUser(params.id as string)
    }
  }, [params.id])

  const loadUser = async (id: string) => {
    try {
      setIsLoading(true)
      const users = await getAllUsers()
      const found = users.find((u: any) => (u.id || u._id) === id)
      if (found) {
        setUser(found)
        if (found.email) {
          const userOrders = await getUserOrders(found.email)
          setOrders(userOrders)
        }
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{t('admin.users.notFound')}</p>
        <Link href="/admin/users" className="mt-4 inline-block text-blue-600 hover:underline">
          {t('admin.users.backToList')}
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
            href="/admin/users"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.name || t('admin.users.unknown')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.users.userDetails')}
            </p>
          </div>
        </div>
        <Link
          href={`/admin/users/${params.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
        >
          <PencilIcon className="w-5 h-5" />
          {t('admin.users.edit')}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('admin.users.userInfo')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.users.name')}
                </label>
                <p className="text-gray-900 dark:text-white">{user.name || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.users.email')}
                </label>
                <p className="text-gray-900 dark:text-white">{user.email || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.users.created')}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('admin.users.orders')} ({orders.length})
            </h3>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {t('admin.orders.order')} #{order.id.substring(0, 8)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {order.total.toFixed(2)} DH
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{t('admin.users.noOrders')}</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('admin.users.stats')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.users.totalOrders')}
                </label>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {orders.length}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.users.totalSpent')}
                </label>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)} DH
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

