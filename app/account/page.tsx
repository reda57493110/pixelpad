"use client"

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Protected from '@/components/Protected'
import AccountLayout from '@/components/AccountLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  UserIcon,
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function AccountPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  
  const cards = [
    { href: '/account/profile', titleKey: 'account.profile.title', descKey: 'account.profile.desc', icon: UserIcon, color: 'from-primary-500 to-primary-600' },
    { href: '/account/orders', titleKey: 'account.orders.title', descKey: 'account.orders.desc', icon: ClipboardDocumentListIcon, color: 'from-primary-600 to-primary-700' },
    { href: '/account/returns', titleKey: 'account.returns.title', descKey: 'account.returns.desc', icon: ArrowPathIcon, color: 'from-primary-500 to-primary-600' },
    { href: '/account/messages', titleKey: 'account.messages.title', descKey: 'account.messages.desc', icon: ChatBubbleLeftRightIcon, color: 'from-primary-600 to-primary-700' },
    { href: '/account/service-requests', titleKey: 'account.serviceRequests.title', descKey: 'account.serviceRequests.desc', icon: WrenchScrewdriverIcon, color: 'from-primary-500 to-primary-600' },
    { href: '/account/addresses', titleKey: 'account.addresses.title', descKey: 'account.addresses.desc', icon: MapPinIcon, color: 'from-primary-600 to-primary-700' },
  ]
  
  return (
    <Protected>
      <AccountLayout title={t('account.dashboard')}>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {cards.map((c) => (
              <Link key={c.href} href={c.href} className="group">
                <div className="rounded-xl p-2.5 sm:p-4 shadow-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 h-full flex flex-col min-h-[112px] sm:min-h-[140px]"> 
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center mb-1.5 sm:mb-3 flex-shrink-0`}>
                    <c.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="font-semibold text-[13px] sm:text-base mb-0.5 sm:mb-1.5 flex-shrink-0 text-gray-900 dark:text-white">{t(c.titleKey)}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-snug sm:leading-tight flex-1">{t(c.descKey)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </AccountLayout>
    </Protected>
  )
}


