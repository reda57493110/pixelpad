'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { en } from '@/translations/en'
import { fr } from '@/translations/fr'
import { ar } from '@/translations/ar'

type Language = 'en' | 'fr' | 'ar'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isRTL: boolean
  formatCurrency: (amount: number) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation data
const translations = {
  en,
  fr,
  ar
}

// Currency formatting function
const formatCurrency = (amount: number, language: Language): string => {
  switch (language) {
    case 'en':
      return `${amount} DH`
    case 'fr':
      return `${amount} Dirham`
    case 'ar':
      return `${amount} درهم`
    default:
      return `${amount} DH`
  }
}

const VALID_LANGUAGES: Language[] = ['en', 'fr', 'ar']

function setLanguageCookie(lang: Language) {
  if (typeof document === 'undefined') return
  document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`
}

export function LanguageProvider({ children, initialLanguage }: { children: React.ReactNode; initialLanguage?: string }) {
  // Use server-provided cookie so server and client match on first paint (avoids hydration mismatch)
  const [language, setLanguage] = useState<Language>(
    initialLanguage && VALID_LANGUAGES.includes(initialLanguage as Language) ? (initialLanguage as Language) : 'en'
  )

  /** Match device/browser locale list in order: first supported en/fr/ar wins; anything else → en */
  const detectBrowserLanguage = (): Language => {
    if (typeof window === 'undefined') return 'en'

    const list =
      navigator.languages?.length ? navigator.languages : [navigator.language || 'en']

    for (const raw of list) {
      const code = raw.toLowerCase().split('-')[0]
      if (code === 'ar') return 'ar'
      if (code === 'fr') return 'fr'
      if (code === 'en') return 'en'
    }
    return 'en'
  }

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('language', newLanguage)
        setLanguageCookie(newLanguage)
      } catch (e) {
        // Ignore storage errors
      }
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    // When server sent initialLanguage (cookie), state already matches; don't overwrite from localStorage
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && VALID_LANGUAGES.includes(savedLanguage)) {
      if (!initialLanguage) {
        setLanguage(savedLanguage)
        setLanguageCookie(savedLanguage)
      }
      return
    }
    if (!initialLanguage) {
      const detectedLanguage = detectBrowserLanguage()
      setLanguage(detectedLanguage)
      setLanguageCookie(detectedLanguage)
    }
  }, [initialLanguage])

  useEffect(() => {
    // Apply language to document
    if (typeof window === 'undefined') return
    
    document.documentElement.lang = language
    
    // Only save to localStorage if user manually selected (check if it's different from auto-detected)
    // This is handled in handleSetLanguage, so we don't save here
    
    // Set text direction based on language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof typeof translations[typeof language]] || key
    
    // Replace placeholders if params are provided
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(new RegExp(`\\{${param}\\}`, 'g'), String(params[param]))
      })
    }
    
    return translation
  }

  const isRTL = language === 'ar'

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isRTL, formatCurrency: (amount: number) => formatCurrency(amount, language) }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
