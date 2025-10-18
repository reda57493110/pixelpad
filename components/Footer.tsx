'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { companyInfo, footerSections } from '@/data/footerData'
import { SocialIcons } from '@/components/icons/SocialIcons'

export default function Footer() {
  const { t } = useLanguage()
  
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white relative overflow-hidden">
      {/* Background Marketing Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Marketing Banner */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-lg mb-8 text-center">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-2xl animate-bounce">🎁</span>
            <div>
              <h3 className="text-lg font-bold">JOIN 10,000+ HAPPY CUSTOMERS!</h3>
              <p className="text-sm opacity-90">Get exclusive deals and tech tips delivered to your inbox</p>
            </div>
            <span className="text-2xl animate-bounce">⚡</span>
          </div>
        </div>
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <Image 
                src="/images/pixel-pad-logo-new.png" 
                alt="Pixel Pad Logo" 
                width={120} 
                height={120} 
                className="mr-6 brightness-110 contrast-125 dark:brightness-100 dark:contrast-100"
              />
              <h3 className="text-2xl font-bold text-white">
                {companyInfo.name}
              </h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              {t('footer.description')}
            </p>
            <SocialIcons socialMedia={companyInfo.socialMedia} />
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-lg font-semibold mb-4 text-white">
                {t(`footer.sections.${section.title.toLowerCase().replace(' ', '')}`)}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                      >
                        {t(`footer.links.${link.label.toLowerCase().replace(' ', '')}`)}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                      >
                        {t(`footer.links.${link.label.toLowerCase().replace(' ', '')}`)}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-2xl font-bold text-green-400">10,000+</div>
            <div className="text-sm text-gray-300">Happy Customers</div>
          </div>
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-2xl font-bold text-yellow-400">4.9/5</div>
            <div className="text-sm text-gray-300">Average Rating</div>
          </div>
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-2xl font-bold text-blue-400">24/7</div>
            <div className="text-sm text-gray-300">Support</div>
          </div>
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-2xl font-bold text-purple-400">2 Years</div>
            <div className="text-sm text-gray-300">Warranty</div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
            
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>in Morocco</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


