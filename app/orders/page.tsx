"use client"

export const dynamic = 'force-dynamic'
import Protected from '@/components/Protected'
import RefreshButton from '@/components/RefreshButton'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getUserOrders, updateOrder, cancelOrder, Order } from '@/lib/orders'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

export default function OrdersPage() {
  const { user, updateProfile } = useAuth()
  const { t, isRTL } = useLanguage()
  const router = useRouter()
  const search = useSearchParams()
  const success = search.get('success') === '1'

  const [orders, setOrders] = useState<Order[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Ensure client-side only for localStorage access
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const loadOrders = useCallback(async () => {
    if (!isMounted) return
    if (typeof window !== 'undefined' && user?.email) {
      try {
        const userOrders = await getUserOrders(user.email)
        setOrders(userOrders)
        // Sync user.orders count with actual orders count
        if (user && userOrders.length !== (user.orders || 0)) {
          try {
            await updateProfile({ orders: userOrders.length })
          } catch (error) {
            console.error('Failed to update user orders count:', error)
          }
        }
      } catch (error) {
        console.error('Error loading orders:', error)
        setOrders([])
      }
    }
  }, [isMounted, user?.email, user, updateProfile])

  useEffect(() => {
    loadOrders()
  }, [loadOrders, refreshKey])

  // Listen for order changes from other pages
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Order | null>(null)
  const moroccoCities = [
    'Casablanca','Rabat','Fès','Marrakech','Tanger','Agadir','Meknès','Oujda','Kenitra','Tétouan','Safi','Mohammedia','El Jadida','Béni Mellal','Nador','Taza','Khouribga','Skhirat-Temara','Settat','Ksar El Kebir','Larache','Khemisset','Guelmim','Laâyoune','Dakhla'
  ]

  const beginEdit = (o: Order) => {
    setEditingId(o.id)
    setDraft(JSON.parse(JSON.stringify(o)))
  }

  const changeQty = (index: number, delta: number) => {
    if (!draft) return
    const items = [...draft.items]
    const nextQty = Math.max(1, Math.min(20, items[index].quantity + delta))
    items[index] = { ...items[index], quantity: nextQty }
    const total = items.reduce((s,i)=> s + i.price * i.quantity, 0)
    setDraft({ ...draft, items, total })
  }

  const saveEdit = async () => {
    if (!user || !draft) return
    try {
      await updateOrder(user.email, draft.id, draft)
      setEditingId(null)
      setDraft(null)
      setRefreshKey(k => k + 1)
      // Event is dispatched by updateOrder in lib/orders.ts
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const cancelEdit = () => { setEditingId(null); setDraft(null) }

  const handleCancelOrder = async (id: string) => {
    if (!user) return
    try {
      await cancelOrder(user.email, id)
      setRefreshKey(k => k + 1)
      // Event is dispatched by cancelOrder in lib/orders.ts
    } catch (error) {
      console.error('Error cancelling order:', error)
    }
  }

  return (
    <Protected>
      <div className="max-w-4xl mx-auto p-2 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold">{t('orders.title')}</h1>
          <div className="flex items-center gap-1.5" style={{ direction: 'ltr' }}>
            <RefreshButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              isRefreshing={isRefreshing}
              title={t('orders.refresh')}
            />
            <Link
              href="/profile"
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-[10px] transition-colors"
            >
              {t('orders.backToProfile')}
            </Link>
          </div>
        </div>

        {success && (
          <div className="rounded border border-green-300 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-2 text-xs">
            {t('orders.orderPlacedSuccess')}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-300">{t('orders.noOrders')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map(o => (
              <div key={o.id} className="bg-white dark:bg-gray-800 rounded shadow p-2">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-[10px] text-gray-500">{formatDate(o.date)}</div>
                  <span className="text-[9px] px-1 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 capitalize">{o.status}</span>
                </div>
                {editingId === o.id && draft ? (
                  <div className="space-y-1.5">
                    {/* Contact info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      <div>
                        <label className="block text-[9px] text-gray-500 mb-0.5">{t('orders.fullName')}</label>
                        <input value={draft.customerName || ''} onChange={(e)=>setDraft({ ...draft, customerName: e.target.value })} className="w-full px-1.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-500 mb-0.5">{t('orders.phone')}</label>
                        <input value={draft.customerPhone || ''} onChange={(e)=>setDraft({ ...draft, customerPhone: e.target.value })} className="w-full px-1.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-500 mb-0.5">{t('orders.city')}</label>
                        <input list="cities" value={draft.city || ''} onChange={(e)=>setDraft({ ...draft, city: e.target.value })} className="w-full px-1.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                        <datalist id="cities">
                          {moroccoCities.map(c => (<option key={c} value={c} />))}
                        </datalist>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {draft.items.map((it, idx) => (
                        <div key={it.id} className="py-1 flex items-center justify-between">
                          <div className="truncate pr-2">
                            <div className="font-medium text-xs truncate max-w-[16rem]">{it.name}</div>
                            <div className="text-[9px] text-gray-500">{t('orders.unit')} {(it.price).toFixed(2)} DH</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={()=>changeQty(idx,-1)} className="w-5 h-5 text-[10px] rounded border border-gray-300 dark:border-gray-600">-</button>
                            <span className="w-4 text-center text-[10px]">{it.quantity}</span>
                            <button onClick={()=>changeQty(idx,1)} className="w-5 h-5 text-[10px] rounded border border-gray-300 dark:border-gray-600">+</button>
                            <div className="font-semibold text-xs whitespace-nowrap w-16 text-right">{(it.price * it.quantity).toFixed(2)} DH</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                      <div className="text-[10px] text-gray-500">{t('orders.total')}</div>
                      <div className="text-sm font-bold">{draft.total.toFixed(2)} DH</div>
                    </div>
                    <div className="flex gap-1 justify-end">
                      <button onClick={cancelEdit} className="px-2 py-1 text-[10px] rounded border">{t('orders.cancel')}</button>
                      <button onClick={saveEdit} className="px-2 py-1 text-[10px] rounded bg-blue-600 text-white">{t('orders.save')}</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {o.items.map(it => (
                        <div key={it.id} className="py-1 flex items-center justify-between">
                          <div className="truncate pr-2">
                            <div className="font-medium text-xs truncate max-w-[16rem]">{it.name}</div>
                            <div className="text-[9px] text-gray-500">{t('orders.qty')} {it.quantity}</div>
                          </div>
                          <div className="font-semibold text-xs whitespace-nowrap">{(it.price * it.quantity).toFixed(2)} DH</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                      <div className="text-[10px] text-gray-500">{t('orders.total')}</div>
                      <div className="text-sm font-bold">{o.total.toFixed(2)} DH</div>
                    </div>
                    <div className="flex gap-1 justify-end mt-1">
                      <button onClick={()=>beginEdit(o)} className="px-2 py-1 text-[10px] rounded border">{t('orders.edit')}</button>
                      {o.status !== 'cancelled' && (
                        <button onClick={()=>handleCancelOrder(o.id)} className="px-2 py-1 text-[10px] rounded bg-orange-600 text-white">{t('orders.cancel')}</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Protected>
  )
}


