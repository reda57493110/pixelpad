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
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{t('account.subtitle')}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {cards.map((c) => (
              <Link key={c.href} href={c.href} className="group">
                <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-md sm:shadow-lg bg-gradient-to-br ${c.color} text-white hover:shadow-lg sm:hover:shadow-xl hover:scale-[1.02] sm:hover:scale-105 transition-all duration-300 h-full flex flex-col min-h-[120px] sm:min-h-[140px]`}> 
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 sm:mb-3 flex-shrink-0">
                    <c.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="font-semibold text-sm sm:text-base mb-1 sm:mb-1.5 flex-shrink-0">{t(c.titleKey)}</div>
                  <div className="text-xs sm:text-sm text-white/80 leading-snug sm:leading-tight flex-1">{t(c.descKey)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </AccountLayout>
    </Protected>
  )
}


