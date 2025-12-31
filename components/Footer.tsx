'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { companyInfo, footerSections } from '@/data/footerData'
import { SocialIcons } from '@/components/icons/SocialIcons'

export default function Footer() {
  const { t } = useLanguage()
  
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 dark:from-gray-950 dark:via-gray-950 dark:to-black text-white relative overflow-hidden border-t border-gray-800/50">
      {/* Background Marketing Elements - Removed for cleaner look */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4">
          {/* Company Info */}
          <div className="md:col-span-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-shrink-0">
                <Image 
                  src="/images/pixel-pad-logo-new.png" 
                  alt="Pixel Pad Logo" 
                  width={50} 
                  height={50} 
                  className="relative brightness-110 contrast-125 dark:brightness-100 dark:contrast-100 hover:scale-105 transition-all duration-300 cursor-pointer animate-float-gentle"
                />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {companyInfo.name}
              </h3>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed max-w-md">
              {t('footer.description')}
            </p>
            <div className="pt-1">
              <SocialIcons socialMedia={companyInfo.socialMedia} />
            </div>
          </div>

          {/* Quick Links and Support Side by Side */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 md:col-span-2">
            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={section.title} className={index === 0 ? 'md:pl-2' : ''}>
                <h4 className="text-[10px] font-semibold mb-2 text-white tracking-wider uppercase">
                  {t(`footer.sections.${section.title.toLowerCase().replace(' ', '')}`)}
                </h4>
                <ul className="space-y-1.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-all duration-200 text-xs inline-block hover:translate-x-1 group"
                        >
                          <span className="relative">
                            {t(`footer.links.${link.label.toLowerCase().replace(' ', '')}`)}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
                          </span>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-white transition-all duration-200 text-xs inline-block hover:translate-x-1 group"
                        >
                          <span className="relative">
                            {t(`footer.links.${link.label.toLowerCase().replace(' ', '')}`)}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
                          </span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800/60 pt-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="text-[10px] sm:text-xs text-gray-400 font-medium">
              © {new Date().getFullYear()} {companyInfo.name}. {t('footer.copyright') || 'All rights reserved.'}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-400">
              <Link 
                href="/privacy" 
                className="hover:text-white transition-all duration-200 relative group"
              >
                {t('footer.privacy') || 'Privacy Policy'}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <span className="text-gray-600">|</span>
              <Link 
                href="/terms" 
                className="hover:text-white transition-all duration-200 relative group"
              >
                {t('footer.terms') || 'Terms of Service'}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}