'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePermissions } from '@/hooks/usePermissions'
import { getAdminStats, AdminStats } from '@/lib/admin'
import {
  ChartBarIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  UsersIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const router = useRouter()
  const { t } = useLanguage()
  const { can } = usePermissions()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // If user doesn't have dashboard permission, redirect to first available page
    if (!can('dashboard.view')) {
      // Try to redirect to orders (most common permission)
      if (can('orders.view')) {
        router.replace('/admin/orders')
      } else if (can('messages.view')) {
        router.replace('/admin/messages')
      } else if (can('service-requests.view')) {
        router.replace('/admin/service-requests')
      }
    }
  }, [can, router])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getAdminStats()
        setStats(statsData)
      } catch (error) {
        console.error('Error loading admin stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [])

  if (!can('dashboard.view')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Access denied. Redirecting...</p>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  if (!stats) {
    return <div className="text-center py-12 text-red-600">{t('admin.errorLoading')}</div>
  }

  const primaryStats = [
    { label: t('admin.stats.totalRevenue'), value: `${stats.totalRevenue.toFixed(2)} DH`, color: 'from-yellow-500 to-yellow-600', icon: ChartBarIcon, bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
    { label: t('admin.stats.totalOrders'), value: stats.totalOrders, color: 'from-green-500 to-green-600', icon: ShoppingCartIcon, bg: 'bg-green-50 dark:bg-green-900/10' },
    { label: t('admin.stats.totalProducts'), value: stats.totalProducts, color: 'from-blue-500 to-blue-600', icon: Squares2X2Icon, bg: 'bg-blue-50 dark:bg-blue-900/10' },
    { label: t('admin.stats.totalUsers'), value: stats.totalUsers, color: 'from-purple-500 to-purple-600', icon: UsersIcon, bg: 'bg-purple-50 dark:bg-purple-900/10' },
  ]

  const alertStats = [
    { label: t('admin.stats.pendingOrders'), value: stats.pendingOrders, color: 'from-orange-500 to-orange-600', icon: ArrowPathIcon, bg: 'bg-orange-50 dark:bg-orange-900/10' },
    { label: t('admin.stats.newMessages'), value: stats.newMessages, color: 'from-pink-500 to-pink-600', icon: EnvelopeIcon, bg: 'bg-pink-50 dark:bg-pink-900/10' },
    { label: t('admin.stats.newServiceRequests'), value: stats.newServiceRequests, color: 'from-indigo-500 to-indigo-600', icon: WrenchScrewdriverIcon, bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
  ]

  const stockStats = [
    { label: t('admin.stats.totalInStock'), value: stats.totalStockQuantity, color: 'from-emerald-500 to-emerald-600', icon: Squares2X2Icon, bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
    { label: t('admin.stats.totalSold'), value: stats.totalSoldQuantity, color: 'from-blue-500 to-blue-600', icon: ShoppingCartIcon, bg: 'bg-blue-50 dark:bg-blue-900/10' },
    { label: t('admin.stats.lowStockItems'), value: stats.lowStockProducts, color: 'from-orange-500 to-orange-600', icon: ExclamationTriangleIcon, bg: 'bg-orange-50 dark:bg-orange-900/10' },
  ]

  const profitStats = [
    { 
      label: t('admin.stats.totalProfit'), 
      value: `${stats.totalProfit.toFixed(2)} DH`, 
      color: 'from-green-500 to-emerald-600', 
      icon: BanknotesIcon, 
      bg: 'bg-green-50 dark:bg-green-900/10',
      description: t('admin.stats.totalProfitDesc', { count: stats.totalProductsSold })
    },
    { 
      label: t('admin.stats.totalProductsSold'), 
      value: stats.totalProductsSold, 
      color: 'from-teal-500 to-cyan-600', 
      icon: ShoppingCartIcon, 
      bg: 'bg-teal-50 dark:bg-teal-900/10',
      description: t('admin.stats.totalProductsSoldDesc')
    },
  ]

  return (
    <div className="space-y-6">
      {/* Primary Statistics */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('admin.dashboard.keyMetrics')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {primaryStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className={`${stat.bg} rounded-lg shadow-md p-3 sm:p-4 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r ${stat.color} text-white flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg sm:text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Profit Statistics */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <BanknotesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
          {t('admin.dashboard.profitOverview')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {profitStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className={`${stat.bg} rounded-lg shadow-md p-4 sm:p-5 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all`}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className={`w-8 h-8 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-r ${stat.color} text-white flex items-center justify-center shadow-lg`}>
                    <Icon className="w-4 h-4 sm:w-3 sm:h-3" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</div>
                {stat.description && (
                  <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1">{stat.description}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stock Statistics */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('admin.stockManagement.inventoryOverview')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {stockStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className={`${stat.bg} rounded-lg shadow-md p-4 sm:p-5 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all`}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className={`w-8 h-8 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-r ${stat.color} text-white flex items-center justify-center shadow-lg`}>
                    <Icon className="w-4 h-4 sm:w-3 sm:h-3" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Alert Statistics */}
      {(stats.pendingOrders > 0 || stats.newMessages > 0 || stats.newServiceRequests > 0) && (
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            {t('admin.dashboard.requiresAttention')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {alertStats.map((stat, index) => {
              if (stat.value === 0) return null
              const Icon = stat.icon
              return (
                <div key={index} className={`${stat.bg} rounded-lg shadow-md p-4 sm:p-5 border-2 border-orange-300 dark:border-orange-700`}>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className={`w-8 h-8 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-r ${stat.color} text-white flex items-center justify-center shadow-lg`}>
                      <Icon className="w-4 h-4 sm:w-3 sm:h-3" />
                    </div>
                    <span className="px-2 py-1 bg-orange-500 text-white rounded text-[10px] sm:text-xs font-bold">
                      Action Needed
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
