"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  UserIcon,
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  HomeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface AccountLayoutProps {
  children: React.ReactNode
  title: string
  showNavigation?: boolean
}

export default function AccountLayout({ children, title, showNavigation = true }: AccountLayoutProps) {
  const { t } = useLanguage()
  const pathname = usePathname()

  const accountPages = [
    { href: '/account', titleKey: 'account.dashboard', icon: HomeIcon, exact: true },
    { href: '/account/profile', titleKey: 'account.profile.title', icon: UserIcon },
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pt-24 sm:pt-28">
      {/* Breadcrumb - Only show if not on dashboard or main account pages */}
      {!isDashboard && !isProfile && !isOrders && !isReturns && !isMessages && !isServiceRequests && !isAddresses && (
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/account" className="hover:text-primary-600 dark:hover:text-primary-400">
              {t('account.dashboard')}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">{title}</span>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className={`${isDashboard ? '' : 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6'}`}>
        {!isDashboard && <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{title}</h1>}
        {children}
      </div>
    </div>
  )
}

