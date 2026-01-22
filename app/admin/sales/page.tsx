'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePermissions } from '@/hooks/usePermissions'
import { getAllOrders, getAllUsers, getAdminStats } from '@/lib/admin'
import { getAllProducts } from '@/lib/products'
import type { Order } from '@/types'
import type { Product } from '@/types'
import {
  ChartBarIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

export default function SalesAnalyticsPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { can } = usePermissions()
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!can('sales.view')) {
      router.replace('/admin/orders')
    }
  }, [can, router])

  useEffect(() => {
    loadData()
  }, [])

  if (!can('sales.view')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Access denied. Redirecting...</p>
      </div>
    )
  }

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [statsData, ordersData, productsData] = await Promise.all([
        getAdminStats(),
        getAllOrders(),
        getAllProducts(),
      ])
      setStats(statsData || {
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        totalMessages: 0,
        totalServiceRequests: 0,
        pendingOrders: 0,
        newMessages: 0,
        newServiceRequests: 0,
        totalStockQuantity: 0,
        totalSoldQuantity: 0,
        lowStockProducts: 0,
        totalProfit: 0,
        totalProductsSold: 0
      })
      setOrders(ordersData || [])
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error loading sales data:', error)
      // Set default stats on error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        totalMessages: 0,
        totalServiceRequests: 0,
        pendingOrders: 0,
        newMessages: 0,
        newServiceRequests: 0,
        totalStockQuantity: 0,
        totalSoldQuantity: 0,
        lowStockProducts: 0,
        totalProfit: 0,
        totalProductsSold: 0
      })
      setOrders([])
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate top products
  const topProducts = products
    .map(p => ({
      ...p,
      revenue: (p.price * (p.soldQuantity || 0)),
      sold: p.soldQuantity || 0
    }))
    .filter(p => p.sold > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Calculate revenue by status
  const revenueByStatus = {
    completed: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0),
    processing: orders.filter(o => o.status === 'processing').reduce((sum, o) => sum + o.total, 0),
    shipped: orders.filter(o => o.status === 'shipped').reduce((sum, o) => sum + o.total, 0),
  }

  // Calculate monthly revenue (last 6 months)
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const monthOrders = orders.filter(o => {
      const orderDate = new Date(o.date)
      return orderDate >= monthStart && orderDate <= monthEnd && o.status === 'completed'
    })
    return {
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      revenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
      orders: monthOrders.length
    }
  }).reverse()

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  if (!stats) {
    return <div className="text-center py-12 text-red-600">{t('admin.errorLoading')}</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.tabs.sales')}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('admin.sales.analytics')}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalRevenue.toFixed(2)} DH
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('admin.sales.totalRevenue')}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalProfit.toFixed(2)} DH
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('admin.sales.totalProfit')}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <ShoppingCartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalOrders}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('admin.sales.totalOrders')}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalProductsSold}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('admin.sales.productsSold')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('admin.sales.revenueByStatus')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                {t('admin.sales.completed')}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {revenueByStatus.completed.toFixed(2)} DH
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                {t('admin.sales.processing')}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {revenueByStatus.processing.toFixed(2)} DH
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                {t('admin.sales.shipped')}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {revenueByStatus.shipped.toFixed(2)} DH
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('admin.sales.monthlyRevenue')}
          </h3>
          <div className="space-y-3">
            {monthlyRevenue.map((month, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {month.month}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {month.revenue.toFixed(2)} DH ({month.orders} {t('admin.sales.orders')})
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(month.revenue / Math.max(...monthlyRevenue.map(m => m.revenue), 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {t('admin.sales.topProducts')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.sales.product')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.sales.sold')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.sales.revenue')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    {t('admin.sales.noSales')}
                  </td>
                </tr>
              ) : (
                topProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {product.sold}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                      {product.revenue.toFixed(2)} DH
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

