"use client"

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { getUserOrders, Order } from '@/lib/orders'
import Link from 'next/link'
import Image from 'next/image'
import {
  MagnifyingGlassIcon,
  ClockIcon,
  CheckBadgeIcon,
  XCircleIcon,
  TruckIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CubeIcon
} from '@heroicons/react/24/outline'

export default function TrackOrderPage() {
  const { t, formatCurrency } = useLanguage()
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill orderId and phone from URL
  useEffect(() => {
    const orderIdParam = searchParams?.get('orderId')
    const phoneParam = searchParams?.get('phone')
    if (orderIdParam) {
      setOrderId(orderIdParam)
    }
    if (phoneParam) {
      setPhone(phoneParam)
    }
  }, [searchParams])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOrder(null)

    if (!orderId.trim() && !phone.trim()) {
      setError('Please enter an Order ID or Phone Number')
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (orderId.trim()) {
        params.append('orderId', orderId.trim())
      }
      if (phone.trim()) {
        params.append('phone', phone.trim())
      }

      const response = await fetch(`/api/orders/track?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to find order. Please check your Order ID and Phone Number.')
        return
      }

      // Convert MongoDB document to Order format
      // Prioritize custom id (PP-XXXXXX) over MongoDB _id
      const foundOrder: Order = {
        id: data.id || data._id?.toString() || '',
        date: data.date || data.createdAt,
        items: data.items || [],
        total: data.total,
        status: data.status || 'processing',
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        city: data.city,
        email: data.email,
        paymentSessionId: data.paymentSessionId,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
      }

      setOrder(foundOrder)
    } catch (err: any) {
      setError(err?.message || 'Failed to find order. Please check your Order ID and Phone Number.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'processing' || statusLower === 'pending') {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        icon: ClockIcon
      }
    }
    if (statusLower === 'completed') {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        icon: CheckBadgeIcon
      }
    }
    if (statusLower === 'cancelled') {
      return {
        bg: 'bg-gray-50 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-700',
        icon: XCircleIcon
      }
    }
    if (statusLower === 'shipped') {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        icon: TruckIcon
      }
    }
    return {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      icon: CubeIcon
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 sm:pt-28 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('checkout.trackOrder') || 'Track Your Order'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('checkout.trackOrderDesc') || 'Enter your Order ID or Phone Number to track your order status'}
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('checkout.orderId') || 'Order ID'}
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="PP-XXXXXX"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">{t('checkout.or') || 'OR'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('checkout.phoneNumber') || 'Phone Number'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0612345678"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('checkout.searching') || 'Searching...'}</span>
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>{t('checkout.search') || 'Search Order'}</span>
                </>
              )}
            </button>
          </form>

          {order && (
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('orders.orderDetails') || 'Order Details'}
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-5 mb-4 border border-blue-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t('orders.orderNumber') || 'Order Number'}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {order.id || 'N/A'}
                    </p>
                  </div>
                  {(() => {
                    const statusBadge = getStatusBadge(order.status)
                    const StatusIcon = statusBadge.icon
                    return (
                      <div className="flex flex-col items-end sm:items-start">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {t('orders.status') || 'Status'}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          <StatusIcon className="w-4 h-4" />
                          {order.status === 'processing'
                            ? t('orders.processingStatus') || 'Processing'
                            : order.status === 'completed'
                            ? t('orders.completedStatus') || 'Completed'
                            : order.status === 'cancelled'
                            ? t('orders.cancelledStatus') || 'Cancelled'
                            : order.status === 'shipped'
                            ? t('orders.shippedStatus') || 'Shipped'
                            : order.status}
                        </span>
                      </div>
                    )
                  })()}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-blue-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t('orders.orderDate') || 'Date'}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t('orders.total') || 'Total'}</p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(order.total)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-base text-gray-900 dark:text-white mb-4">{t('orders.orderItems') || 'Order Items'}</h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base text-gray-900 dark:text-white mb-1">{item.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {t('orders.qty') || 'Qty'} {item.quantity} × {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div className="font-bold text-base text-gray-900 dark:text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/track-order?login=1"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              {t('checkout.signInToViewOrders') || 'Sign in to view all your orders'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

