'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ContactInfo } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

interface ContactInfoProps {
  contact: ContactInfo;
}

export default function ContactInfoComponent({ contact }: ContactInfoProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">
        {t('footer.contact.title')}
      </h4>
      
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <Image 
            src="/images/whatsapp-icon.jpg" 
            alt="WhatsApp" 
            width={20} 
            height={20} 
            className="mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-gray-300 text-sm">
              <a 
                href={`https://wa.me/212${contact.phone.replace(/^0/, '')}`}
                className="hover:text-white transition-colors duration-200"
              >
                {contact.phone}
              </a>
            </p>
            <p className="text-gray-400 text-xs">
              {t('footer.contact.phoneLabel')}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-gray-300 text-sm">
              <a 
                href={`mailto:${contact.email}`}
                className="hover:text-white transition-colors duration-200"
              >
                {contact.email}
              </a>
            </p>
            <p className="text-gray-400 text-xs">
              {t('footer.contact.emailLabel')}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            <p className="text-gray-300 text-sm">
              {contact.address}
            </p>
            <p className="text-gray-400 text-xs">
              {t('footer.contact.addressLabel')}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-gray-300 text-sm">
              {contact.workingHours}
            </p>
            <p className="text-gray-400 text-xs">
              {t('footer.contact.hoursLabel')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}




