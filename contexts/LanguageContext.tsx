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
    initialLanguage && VALID_LANGUAGES.includes(initialLanguage as Language) ? (initialLanguage as Language) : 'fr'
  )

  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/9b81b5dc-55fb-4298-9644-d969223c4b35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LanguageContext.tsx:initial-render',message:'LanguageProvider render',data:{language,initialLanguage,hasWindow:true},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1',runId:'post-fix'})}).catch(()=>{});
  } else {
    fetch('http://127.0.0.1:7242/ingest/9b81b5dc-55fb-4298-9644-d969223c4b35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LanguageContext.tsx:initial-render',message:'LanguageProvider render',data:{language,initialLanguage,hasWindow:false},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1',runId:'post-fix'})}).catch(()=>{});
  }
  // #endregion

  // Auto-detect browser language preference
  const detectBrowserLanguage = (): Language => {
    // Only run in browser environment
    if (typeof window === 'undefined') return 'fr'
    
    // Check all preferred languages in order of preference
    const browserLanguages = navigator.languages || [navigator.language || 'fr']
    
    // Map browser language to supported languages
    // Priority: Arabic → English → French (default for all other languages like German, Dutch, Chinese, etc.)
    let detectedLanguage: Language = 'fr' // Default to French for any unsupported language
    
    // Check each language in the user's preference list
    for (const browserLang of browserLanguages) {
      const langCode = browserLang.toLowerCase().split('-')[0] // Get base language code (e.g., 'en' from 'en-US', 'de' from 'de-DE')
      
      // Priority 1: Arabic (highest priority)
      if (langCode === 'ar') {
        detectedLanguage = 'ar'
        break // Found Arabic, use it immediately
      }
      // Priority 2: English
      else if (langCode === 'en') {
        detectedLanguage = 'en'
        // Don't break, continue checking in case Arabic comes later in the list
      }
      // Priority 3: French (only if we haven't found Arabic or English yet)
      else if (langCode === 'fr' && detectedLanguage === 'fr') {
        detectedLanguage = 'fr'
        // Don't break, continue checking in case Arabic or English comes later
      }
      // For all other languages (German 'de', Dutch 'nl', Chinese 'zh', Spanish 'es', etc.)
      // Keep default 'fr' (French)
    }
    
    return detectedLanguage
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9b81b5dc-55fb-4298-9644-d969223c4b35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LanguageContext.tsx:useEffect',message:'Setting language from localStorage',data:{savedLanguage},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4',runId:'post-fix'})}).catch(()=>{});
        // #endregion
        setLanguage(savedLanguage)
        setLanguageCookie(savedLanguage)
      }
      return
    }
    if (!initialLanguage) {
      const detectedLanguage = detectBrowserLanguage()
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9b81b5dc-55fb-4298-9644-d969223c4b35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LanguageContext.tsx:useEffect',message:'Setting language from detectBrowserLanguage',data:{detectedLanguage},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4',runId:'post-fix'})}).catch(()=>{});
      // #endregion
      setLanguage(detectedLanguage)
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
