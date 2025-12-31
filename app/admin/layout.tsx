'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import AdminProtected from '@/components/AdminProtected'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import {
  ChartBarIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  UsersIcon,
  UserGroupIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  TicketIcon,
  BanknotesIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  TagIcon,
} from '@heroicons/react/24/outline'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const { can } = usePermissions()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(pathname?.startsWith('/admin/settings') || false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileMenuOpen])

  // Update settings menu state when pathname changes
  useEffect(() => {
    setIsSettingsOpen(pathname?.startsWith('/admin/settings') || false)
  }, [pathname])

  // Don't show layout for login page (after hooks)
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Define all navigation items with their required permissions
  const allNavItems = [
    { href: '/admin', label: t('admin.tabs.dashboard'), icon: ChartBarIcon, permission: 'dashboard.view' as const },
    { href: '/admin/products', label: t('admin.tabs.products'), icon: Squares2X2Icon, permission: 'products.view' as const },
    { href: '/admin/stock', label: t('admin.stockManagement'), icon: Squares2X2Icon, permission: 'stock.view' as const },
    { href: '/admin/orders', label: t('admin.tabs.orders'), icon: ShoppingCartIcon, permission: 'orders.view' as const },
    { href: '/admin/coupons', label: t('admin.tabs.coupons'), icon: TicketIcon, permission: 'coupons.view' as const },
    { href: '/admin/users', label: t('admin.tabs.users'), icon: UsersIcon, permission: 'users.view' as const },
    { href: '/admin/customers', label: t('admin.tabs.customers') || 'Customers', icon: UserGroupIcon, permission: 'customers.view' as const },
    { href: '/admin/messages', label: t('admin.tabs.messages'), icon: EnvelopeIcon, permission: 'messages.view' as const },
    { href: '/admin/service-requests', label: t('admin.tabs.serviceRequests'), icon: WrenchScrewdriverIcon, permission: 'service-requests.view' as const },
    { href: '/admin/warranty', label: t('admin.tabs.warranty'), icon: ShieldCheckIcon, permission: 'warranty.view' as const },
    { href: '/admin/sales', label: t('admin.tabs.sales'), icon: BanknotesIcon, permission: 'sales.view' as const },
  ]

  // Filter navigation items based on user permissions
  const navItems = allNavItems.filter(item => can(item.permission))

  const allSettingsItems = [
    { href: '/admin/settings/categories', label: t('admin.settings.categories'), icon: TagIcon, permission: 'settings.view' as const },
  ]

  // Filter settings items based on user permissions
  const settingsItems = allSettingsItems.filter(item => can(item.permission))

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return 'A'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-[73px]">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('admin.title')}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {t('admin.subtitle')}
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname?.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}

              {/* Settings Section - Only show if user has settings permission */}
              {can('settings.view') && settingsItems.length > 0 && (
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`
                      w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors
                      ${pathname?.startsWith('/admin/settings')
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Cog6ToothIcon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{t('admin.tabs.settings') || 'Settings'}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isSettingsOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {settingsItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || 
                          (item.href !== '/admin/settings' && pathname?.startsWith(item.href))
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`
                              flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                              ${isActive
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }
                            `}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:px-6 h-[73px] flex items-center">
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div className="flex-1" />
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="hidden lg:block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {t('admin.backToSite') || 'Back to Site'}
                </Link>
                
                {/* Profile Menu */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span>{getInitials(user?.name)}</span>
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name || 'Admin'}
                      </div>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.name || 'Admin'}
                        </div>
                      </div>
                      <div className="py-1">
                            <Link
                                href="/admin/profile"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <UserCircleIcon className="w-5 h-5" />
                                {t('admin.profile') || 'Profile'}
                              </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5" />
                          {t('admin.logout') || 'Logout'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminProtected>
  )
}

