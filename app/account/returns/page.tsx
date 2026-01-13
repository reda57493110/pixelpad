"use client"

export const dynamic = 'force-dynamic'
import Protected from '@/components/Protected'
import AccountLayout from '@/components/AccountLayout'
import RefreshButton from '@/components/RefreshButton'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getUserOrders } from '@/lib/orders'
import { getAllProducts } from '@/lib/products'
import { Product } from '@/types'
import { Order } from '@/lib/orders'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CubeIcon,
  PhotoIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

function formatDate(iso: string) {
  try { 
    return new Date(iso).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
  } catch { 
    return iso 
  }
}

export default function ReturnsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [productCache, setProductCache] = useState<Map<string, Product>>(new Map())
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState<Record<string, boolean>>({})
  const [returnNotes, setReturnNotes] = useState<Record<string, string>>({})
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({})

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

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const loadOrders = useCallback(async () => {
    if (!isMounted) return
    if (typeof window !== 'undefined' && user?.email) {
      try {
        const userOrders = await getUserOrders(user.email)
        // Filter only returned orders and ensure returnNotes are included
        const returnedOrders = userOrders
          .filter(order => order.status === 'returned')
          .map(order => ({
            ...order,
            returnNotes: (order as any).returnNotes || ''
          }))
        setOrders(returnedOrders)
      } catch (error) {
        console.error('Error loading orders:', error)
        setOrders([])
      }
    }
  }, [isMounted, user?.email])

  useEffect(() => {
    loadOrders()
  }, [loadOrders, refreshKey])

  // Listen for order changes
  useEffect(() => {
    if (!isMounted) return
    const handleOrderChange = () => {
      loadOrders()
    }
    window.addEventListener('pixelpad_orders_changed', handleOrderChange)
    return () => {
      window.removeEventListener('pixelpad_orders_changed', handleOrderChange)
    }
  }, [isMounted, loadOrders])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadOrders()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleEditNotes = (orderId: string, currentNotes: string) => {
    setReturnNotes({ ...returnNotes, [orderId]: currentNotes || '' })
    setEditingNotes({ ...editingNotes, [orderId]: true })
  }

  const handleCancelEdit = (orderId: string) => {
    setEditingNotes({ ...editingNotes, [orderId]: false })
    // Don't clear the notes, keep the original value
  }

  const handleSaveReturnNotes = async (orderId: string) => {
    setSavingNotes({ ...savingNotes, [orderId]: true })
    try {
      const notesToSave = returnNotes[orderId] !== undefined ? returnNotes[orderId] : ''
      console.log('Saving return notes:', { orderId, notesToSave })
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          returnNotes: notesToSave
        }),
      })
      
      if (response.ok) {
        const updatedOrder = await response.json()
        console.log('Return notes saved successfully:', updatedOrder)
        
        // Update the order in the local state immediately
        setOrders(prevOrders => {
          const updated = prevOrders.map(order => {
            if (order.id === orderId || (order as any)._id === orderId) {
              return { ...order, returnNotes: notesToSave } as Order
            }
            return order
          })
          console.log('Updated orders state:', updated)
          return updated
        })
        
        setEditingNotes({ ...editingNotes, [orderId]: false })
        // Clear the editing notes from state
        setReturnNotes({ ...returnNotes, [orderId]: notesToSave })
        
        // Also refresh to ensure we have the latest data
        setRefreshKey(k => k + 1)
        await loadOrders()
      } else {
        const errorData = await response.json()
        console.error('Failed to save return notes:', errorData)
        alert(t('account.returns.saveError') || 'Failed to save return notes. Please try again.')
      }
    } catch (error) {
      console.error('Error saving return notes:', error)
      alert(t('account.returns.saveError') || 'Error saving return notes. Please try again.')
    } finally {
      setSavingNotes({ ...savingNotes, [orderId]: false })
    }
  }

  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // Create order number map
  const [orderNumberMap, setOrderNumberMap] = useState<Map<string, number>>(new Map())
  
  useEffect(() => {
    const createOrderNumberMap = async () => {
      if (user?.email) {
        try {
          const allUserOrders = await getUserOrders(user.email)
          const allSorted = [...allUserOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          const map = new Map<string, number>()
          allSorted.forEach((order, index) => {
            map.set(order.id, allSorted.length - index)
          })
          setOrderNumberMap(map)
        } catch (error) {
          console.error('Error creating order number map:', error)
        }
      }
    }
    createOrderNumberMap()
  }, [user?.email])

  const getRefundStatus = (order: Order) => {
    return (order as any).refundStatus || 'notRefunded'
  }

  const getRefundStatusBadge = (status: string) => {
    if (status === 'refunded') {
      return {
        bg: 'bg-green-50 dark:bg-gray-700',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-gray-600',
        icon: CheckCircleIcon,
        label: t('account.returns.refunded')
      }
    }
    if (status === 'pendingRefund') {
      return {
        bg: 'bg-amber-50 dark:bg-gray-700',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-gray-600',
        icon: ClockIcon,
        label: t('account.returns.pendingRefund')
      }
    }
    return {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-700',
      icon: XCircleIcon,
      label: t('account.returns.notRefunded')
    }
  }

  return (
    <Protected>
      <AccountLayout title={t('account.returns.title')}>
        <div className="space-y-3">
          <div className="w-full flex items-center justify-end" style={{ direction: 'ltr' }}>
            <div className="flex items-center gap-2">
              <RefreshButton
                onClick={handleRefresh}
                disabled={isRefreshing}
                isRefreshing={isRefreshing}
                title={t('orders.refresh')}
                size="sm"
              />
              <Link
                href="/account"
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm transition-colors flex items-center justify-center font-medium"
              >
                {t('orders.backToDashboard')}
              </Link>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-14 h-14 mx-auto mb-2.5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <ArrowPathIcon className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">
                  {t('account.returns.noReturns')}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('account.returns.noReturnsDesc')}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
              {sortedOrders.map((order) => {
                const refundStatus = getRefundStatus(order)
                const refundBadge = getRefundStatusBadge(refundStatus)
                const RefundIcon = refundBadge.icon
                const isExpanded = expandedOrderId === order.id
                const orderNumber = orderNumberMap.get(order.id) || 1

                return (
                  <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 w-full">
                    {/* Order Header */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 w-full">
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                              {t('orders.orderNumber').replace('{id}', orderNumber.toString())}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${refundBadge.bg} ${refundBadge.text} ${refundBadge.border}`}>
                              <RefundIcon className="w-3 h-3" />
                              {refundBadge.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                            <CalendarIcon className="w-3 h-3 text-gray-500" />
                            <span className="text-[10px]">{formatDate(order.date)}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                            <CurrencyDollarIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                            <span className="text-[10px] font-bold text-gray-900 dark:text-white">{order.total.toFixed(2)} DH</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                            <CubeIcon className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                            <span className="text-[10px]">{order.items.length}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="w-full px-2 py-1 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors"
                        >
                          {isExpanded ? t('orders.hide') : t('orders.view')}
                        </button>
                      </div>
                    </div>

                    {/* Return Notes */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 dark:bg-opacity-50 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {t('account.returns.returnReason')}:
                        </div>
                        {!editingNotes[order.id] && (
                          <button
                            onClick={() => handleEditNotes(order.id, (order as any).returnNotes || '')}
                            className="text-xs px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors flex items-center gap-1"
                          >
                            <PencilIcon className="w-3 h-3" />
                            {(order as any).returnNotes ? t('account.returns.edit') : t('account.returns.add')}
                          </button>
                        )}
                      </div>
                      
                      {editingNotes[order.id] ? (
                        <div className="space-y-2">
                          <textarea
                            value={returnNotes[order.id] !== undefined ? returnNotes[order.id] : ((order as any).returnNotes || '')}
                            onChange={(e) => setReturnNotes({ ...returnNotes, [order.id]: e.target.value })}
                            placeholder={t('account.returns.returnReasonPlaceholder')}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y min-h-[80px]"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveReturnNotes(order.id)}
                              disabled={savingNotes[order.id]}
                              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              {savingNotes[order.id] ? (
                                <>
                                  <ArrowPathIcon className="w-3 h-3 animate-spin" />
                                  {t('account.returns.saving')}
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon className="w-3 h-3" />
                                  {t('account.returns.save')}
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                handleCancelEdit(order.id)
                                // Reset to original notes
                                setReturnNotes({ ...returnNotes, [order.id]: (order as any).returnNotes || '' })
                              }}
                              disabled={savingNotes[order.id]}
                              className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded text-xs font-medium transition-colors"
                            >
                              {t('account.returns.cancel')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 min-h-[60px]">
                          {(order as any).returnNotes ? (
                            <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {(order as any).returnNotes}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                              {t('account.returns.noReason')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Order Items Preview */}
                    {!isExpanded && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 dark:bg-opacity-50">
                        <div className="space-y-1.5">
                          {order.items.slice(0, 2).map(item => {
                            const product = productCache.get(item.id)
                            return (
                              <div key={item.id} className="flex items-center gap-2 bg-white dark:bg-gray-600 rounded p-1.5 border border-gray-200 dark:border-gray-500">
                                {product?.image ? (
                                  <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex-shrink-0">
                                    <Image
                                      src={product.image}
                                      alt={item.name}
                                      fill
                                      quality={90}
                                      className="object-cover"
                                      sizes="40px"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
                                    <PhotoIcon className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                                  <p className="text-[10px] text-gray-600 dark:text-gray-400">{item.quantity} × {item.price.toFixed(2)} DH</p>
                                </div>
                                <p className="text-xs font-bold text-primary-600 dark:text-primary-400">{(item.price * item.quantity).toFixed(2)} DH</p>
                              </div>
                            )
                          })}
                          {order.items.length > 2 && (
                            <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-1">
                              +{order.items.length - 2} {t('orders.moreItems') || 'more items'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 dark:bg-opacity-50 border-t border-gray-200 dark:border-gray-700 w-full">
                        <div className="space-y-2.5">
                          {/* Order Items */}
                          <div className="bg-white dark:bg-gray-700 rounded-lg p-2.5">
                            <h4 className="font-semibold text-xs text-gray-900 dark:text-white mb-2">{t('orders.orderItems')}</h4>
                            <div className="space-y-1.5">
                              {order.items.map(item => {
                                const product = productCache.get(item.id)
                                return (
                                  <div key={item.id} className="flex items-center gap-2.5 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                                    {product?.image && (
                                      <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600 flex-shrink-0">
                                        <Image
                                          src={product.image}
                                          alt={item.name}
                                          fill
                                          quality={90}
                                          className="object-cover"
                                          sizes="44px"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-xs text-gray-900 dark:text-white truncate">{item.name}</div>
                                      <div className="text-[10px] text-gray-500 dark:text-gray-400">{t('orders.qty')} {item.quantity} × {item.price.toFixed(2)} DH</div>
                                    </div>
                                    <div className="font-semibold text-xs text-gray-900 dark:text-white">{(item.price * item.quantity).toFixed(2)} DH</div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Order Total */}
                          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{t('orders.total')}</div>
                            <div className="text-base font-bold text-primary-600 dark:text-primary-400">{order.total.toFixed(2)} DH</div>
                          </div>
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

