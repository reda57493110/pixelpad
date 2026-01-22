'use client'

import Protected from '@/components/Protected'
import AccountLayout from '@/components/AccountLayout'
import RefreshButton from '@/components/RefreshButton'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getUserOrders, cancelOrder, Order } from '@/lib/orders'
import { getAllProducts } from '@/lib/products'
import { Product } from '@/types'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ShoppingBagIcon,
  ClockIcon,
  CheckBadgeIcon,
  XCircleIcon,
  TruckIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CubeIcon,
  PencilIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function OrdersClient() {
  const { user } = useAuth()
  const { t, formatCurrency } = useLanguage()
  const search = useSearchParams()
  const success = search.get('success') === '1'
  const orderId = search.get('orderId')

  const [orders, setOrders] = useState<Order[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [productCache, setProductCache] = useState<Map<string, Product>>(new Map())

  // Preload all products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await getAllProducts()
        const cache = new Map<string, Product>()
        allProducts.forEach(p => cache.set(p.id, p))
        setProductCache(cache)
      } catch (error) {
        console.error('Error loading products:', error)
      }
    }
    loadProducts()
  }, [])

  // Ensure client-side only
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const loadOrders = useCallback(async () => {
    if (!isMounted || !user?.email) return
    
    try {
      const userOrders = await getUserOrders(user.email)
      setOrders(userOrders)
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
    }
  }, [isMounted, user?.email])

  // Load orders when mounted and user is available
  useEffect(() => {
    if (isMounted && user?.email) {
      loadOrders()
    }
  }, [isMounted, user?.email, loadOrders])

  // Auto-expand the new order if redirected from checkout
  useEffect(() => {
    if (success && orderId && orders.length > 0) {
      const order = orders.find(o => o.id === orderId)
      if (order) {
        setExpandedOrderId(order.id)
        // Scroll to the order after a brief delay
        setTimeout(() => {
          const element = document.getElementById(`order-${order.id}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 300)
      }
    }
  }, [success, orderId, orders])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadOrders()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleCancelOrder = async (id: string, orderStatus: string) => {
    if (!user) return
    
    if (orderStatus === 'completed' || orderStatus === 'cancelled') {
      return
    }
    
    const message = t('orders.confirmCancel') || 'Are you sure you want to cancel this order?'
    if (typeof window !== 'undefined' && window.confirm(message)) {
      try {
        await cancelOrder(user.email, id)
        await loadOrders()
      } catch (error) {
        console.error('Error cancelling order:', error)
        alert(t('orders.cancelError') || 'Failed to cancel order. Please try again.')
      }
    }
  }

  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // Filter orders by status
  const filteredOrders = sortedOrders.filter(order => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'completed') {
      return order.status === 'completed'
    }
    return order.status === statusFilter
  })

  // Calculate statistics
  const activeOrders = orders.filter(o => o.status !== 'cancelled')
  const stats = {
    total: activeOrders.length,
    processing: activeOrders.filter(o => o.status === 'processing').length,
    completed: activeOrders.filter(o => o.status === 'completed').length,
    totalSpent: activeOrders.reduce((sum, o) => sum + o.total, 0)
  }

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'processing' || statusLower === 'pending') {
      return {
        bg: 'bg-primary-50 dark:bg-gray-700',
        text: 'text-primary-700 dark:text-primary-400',
        border: 'border-primary-200 dark:border-gray-600',
        icon: ClockIcon
      }
    }
    if (statusLower === 'completed') {
      return {
        bg: 'bg-primary-50 dark:bg-gray-700',
        text: 'text-primary-700 dark:text-primary-400',
        border: 'border-primary-200 dark:border-gray-600',
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
        bg: 'bg-primary-50 dark:bg-gray-700',
        text: 'text-primary-700 dark:text-primary-400',
        border: 'border-primary-200 dark:border-gray-600',
        icon: TruckIcon
      }
    }
    if (statusLower === 'returned') {
      return {
        bg: 'bg-orange-50 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        icon: ArrowPathIcon
      }
    }
    if (statusLower === 'refunded') {
      return {
        bg: 'bg-purple-50 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        icon: CurrencyDollarIcon
      }
    }
    return {
      bg: 'bg-primary-50 dark:bg-gray-700',
      text: 'text-primary-700 dark:text-primary-400',
      border: 'border-primary-200 dark:border-gray-600',
      icon: CubeIcon
    }
  }

  return (
    <Protected>
      <AccountLayout title={t('account.orders.title') || 'Order History'}>
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {t('orders.orderHistory') || 'Order History'}
            </h2>
            <div className="flex items-center gap-2">
              <RefreshButton
                onClick={handleRefresh}
                disabled={isRefreshing}
                isRefreshing={isRefreshing}
                title={t('orders.refresh') || 'Refresh'}
                size="sm"
              />
              <Link
                href="/account"
                className="flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-700 text-xs sm:text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 text-center"
              >
                {t('orders.backToDashboard') || 'Back to Dashboard'}
              </Link>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="rounded-lg border border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 p-3 shadow-md">
              {t('orders.orderPlacedSuccess') || 'Your order has been sent, wait for confirmation with you.'}
            </div>
          )}

          {/* Status Filter */}
          {orders.length > 0 && (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {['all', 'processing', 'shipped', 'completed', 'cancelled', 'returned', 'refunded'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  {status === 'all' 
                    ? t('orders.all') || 'All'
                    : status === 'processing'
                    ? t('orders.processingStatus') || 'Processing'
                    : status === 'shipped'
                    ? t('orders.shippedStatus') || 'Shipped'
                    : status === 'completed'
                    ? t('orders.completedStatus') || 'Completed'
                    : status === 'completed'
                    ? t('orders.completedStatus') || 'Completed'
                    : status === 'cancelled'
                    ? t('orders.cancelledStatus') || 'Cancelled'
                    : status === 'returned'
                    ? t('orders.returnedStatus') || 'Returned'
                    : t('orders.refundedStatus') || 'Refunded'}
                </button>
              ))}
            </div>
          )}

          {/* Statistics Cards */}
          {orders.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-4 shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1 truncate">{t('orders.totalOrders') || 'Total Orders'}</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  </div>
                  <div className="hidden sm:flex w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 items-center justify-center flex-shrink-0">
                    <CubeIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-4 shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1 truncate">{t('orders.processingStatus') || 'Processing'}</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{stats.processing}</p>
                  </div>
                  <div className="hidden sm:flex w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-4 shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1 truncate">{t('orders.completedStatus') || 'Completed'}</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                  </div>
                  <div className="hidden sm:flex w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 items-center justify-center flex-shrink-0">
                    <CheckBadgeIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-4 shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1 truncate">{t('orders.totalSpent') || 'Total Spent'}</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">{formatCurrency(stats.totalSpent)}</p>
                  </div>
                  <div className="hidden sm:flex w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 items-center justify-center flex-shrink-0">
                    <CurrencyDollarIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 sm:p-8 text-center">
              <ShoppingBagIcon className="w-10 h-10 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                {statusFilter === 'all' 
                  ? t('orders.noOrders') || 'No orders yet'
                  : t('orders.noStatusOrders') || `No ${statusFilter} orders`}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {statusFilter === 'all' 
                  ? t('orders.startShopping') || 'Start shopping to see your orders here'
                  : t('orders.noStatusOrdersYet') || `You don't have any ${statusFilter} orders yet`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusBadge = getStatusBadge(order.status)
                const StatusIcon = statusBadge.icon
                const isExpanded = expandedOrderId === order.id
                
                return (
                  <div
                    key={order.id}
                    id={`order-${order.id}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2.5 sm:mb-3 gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white break-words sm:truncate min-w-0 flex-1">
                            {t('orders.orderNumber')?.replace('{id}', order.id) || `Order ${order.id}`}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold border flex-shrink-0 self-start sm:self-auto ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                            <StatusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {order.status === 'processing'
                              ? t('orders.processingStatus') || 'Processing'
                              : order.status === 'shipped'
                              ? t('orders.shippedStatus') || 'Shipped'
                              : order.status === 'completed'
                              ? t('orders.completedStatus') || 'Completed'
                              : order.status === 'cancelled'
                              ? t('orders.cancelledStatus') || 'Cancelled'
                              : order.status === 'returned'
                              ? t('orders.returnedStatus') || 'Returned'
                              : order.status === 'refunded'
                              ? t('orders.refundedStatus') || 'Refunded'
                              : order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{new Date(order.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400" />
                            <span className="font-bold text-primary-600 dark:text-primary-400 text-xs sm:text-sm">{formatCurrency(order.total)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-700 dark:hover:to-primary-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                        >
                          {isExpanded ? t('orders.hide') || 'Hide' : t('orders.view') || 'View'}
                        </button>
                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                          <button
                            onClick={() => handleCancelOrder(order.id, order.status)}
                            className="px-3 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-semibold transition-colors"
                          >
                            {t('orders.cancel') || 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    {!isExpanded && (
                      <div className="p-3 sm:p-4 bg-primary-50/50 dark:bg-gray-800 dark:bg-opacity-50">
                        <div className="space-y-2">
                          {order.items.slice(0, 2).map(item => {
                            const product = productCache.get(item.id)
                            return (
                              <div key={item.id} className="flex items-center gap-2.5 sm:gap-3 bg-white dark:bg-gray-600 rounded p-2 border border-gray-200 dark:border-gray-500">
                                {product?.image ? (
                                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-600 flex-shrink-0">
                                    <Image
                                      src={product.image}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-gray-100 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                    <CubeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                                  <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">{item.quantity} × {formatCurrency(item.price)}</p>
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400">{formatCurrency(item.price * item.quantity)}</p>
                              </div>
                            )
                          })}
                          {order.items.length > 2 && (
                            <div className="text-center text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 py-1">
                              +{order.items.length - 2} {t('orders.moreItems') || 'more items'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <div className="p-3 sm:p-4 bg-primary-50/50 dark:bg-gray-800 dark:bg-opacity-50 border-t border-primary-200 dark:border-gray-700">
                        {/* Customer Info */}
                        {(order.customerName || order.customerPhone || order.city) && (
                          <div className="bg-white dark:bg-gray-700 rounded-lg p-2.5 sm:p-3 mb-3">
                            <h4 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white mb-1.5 sm:mb-2">{t('orders.contactInformation') || 'Contact Information'}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs sm:text-sm">
                              {order.customerName && (
                                <div>
                                  <span className="text-gray-500">{t('orders.fullName') || 'Full Name'}:</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
                                </div>
                              )}
                              {order.customerPhone && (
                                <div>
                                  <span className="text-gray-500">{t('orders.phone') || 'Phone'}:</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{order.customerPhone}</p>
                                </div>
                              )}
                              {order.city && (
                                <div>
                                  <span className="text-gray-500">{t('orders.city') || 'City'}:</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{order.city}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Order Items */}
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-2.5 sm:p-3 mb-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white mb-1.5 sm:mb-2">{t('orders.orderItems') || 'Order Items'}</h4>
                          <div className="space-y-2">
                            {order.items.map(item => {
                              const product = productCache.get(item.id)
                              return (
                                <div key={item.id} className="flex items-center gap-2.5 sm:gap-3 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                                  {product?.image && (
                                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600 flex-shrink-0">
                                      <Image
                                        src={product.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate">{item.name}</div>
                                    <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">{t('orders.qty') || 'Qty'} {item.quantity} × {formatCurrency(item.price)}</div>
                                  </div>
                                  <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        
                        {/* Order Total */}
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-2.5 sm:pt-3">
                          <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{t('orders.total') || 'Total'}</div>
                          <div className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 bg-clip-text text-transparent">{formatCurrency(order.total)}</div>
                        </div>
                      </div>
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
