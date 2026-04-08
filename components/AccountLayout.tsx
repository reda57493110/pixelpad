"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'
import { 
  UserIcon,
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  HomeIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface AccountLayoutProps {
  children: React.ReactNode
  title: string
  showNavigation?: boolean
}

export default function AccountLayout({ children, title, showNavigation = true }: AccountLayoutProps) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const accountPages = [
    { href: '/account', titleKey: 'account.dashboard', icon: HomeIcon, exact: true },
    { href: '/account/profile', titleKey: 'account.profile.title', icon: UserIcon },
    { href: '/account/orders', titleKey: 'account.orders.title', icon: ClipboardDocumentListIcon },
    { href: '/account/returns', titleKey: 'account.returns.title', icon: ArrowPathIcon },
    { href: '/account/messages', titleKey: 'account.messages.title', icon: ChatBubbleLeftRightIcon },
    { href: '/account/service-requests', titleKey: 'account.serviceRequests.title', icon: WrenchScrewdriverIcon },
    { href: '/account/addresses', titleKey: 'account.addresses.title', icon: MapPinIcon },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const isDashboard = pathname === '/account'
  const isProfile = pathname === '/account/profile'
  const isOrders = pathname === '/account/orders'
  const isReturns = pathname === '/account/returns'
  const isMessages = pathname === '/account/messages'
  const isServiceRequests = pathname === '/account/service-requests'
  const isAddresses = pathname === '/account/addresses'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 sm:pt-28">
      <div className="flex">
        {/* Sidebar */}
        {showNavigation && (
          <aside
            className={`
              fixed lg:fixed inset-y-0 left-0 z-[120]
              w-64 bg-white dark:bg-gray-800 shadow-xl dark:shadow-black/30 lg:rounded-r-2xl
              transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <div className="flex flex-col h-full lg:h-[calc(100vh-7rem)] lg:pt-28">
              <div className="flex items-center justify-between px-3 pt-10 pb-4 h-[104px]">
                <div>
                  <div className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                    {t('account.dashboard')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {t('account.subtitle')}
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                {accountPages.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href, (item as any).exact)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-xl transition-colors
                        ${active
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-base font-semibold leading-tight">{t(item.titleKey)}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* Overlay for mobile */}
        {showNavigation && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[110] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 min-w-0 pb-10 ${showNavigation ? 'lg:pl-64' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Top Bar */}
            {!isDashboard && (
              <header className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-4 flex items-center gap-3 lg:hidden">
                {showNavigation && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    aria-label="Open menu"
                  >
                    <Bars3Icon className="w-6 h-6" />
                  </button>
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {title}
                  </div>
                  {!isProfile && !isOrders && !isReturns && !isMessages && !isServiceRequests && !isAddresses && (
                    <nav className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      <Link href="/account" className="hover:text-primary-600 dark:hover:text-primary-400">
                        {t('account.dashboard')}
                      </Link>
                      <span className="mx-1">/</span>
                      <span className="text-gray-900 dark:text-white font-medium">{title}</span>
                    </nav>
                  )}
                </div>
              </header>
            )}

            <div className="w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

