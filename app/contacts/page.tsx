'use client'

import { useState, useEffect } from 'react'

// Static page - no dynamic data
export const dynamic = 'force-static'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { addMessage, migrateGuestMessages, ContactMessage } from '@/lib/messages'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  UserIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  HeartIcon,
  XMarkIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function ContactsPage() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [showFAQ, setShowFAQ] = useState(false)
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Pre-fill form when user is logged in - optimized to only run once
  useEffect(() => {
    if (user && !showForm && user.email) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }))
    }
  }, [user])

  // Form validation
  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!formData.inquiryType) {
      errors.inquiryType = 'Please select an inquiry type'
    }
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required'
    }
    if (!formData.message.trim()) {
      errors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Create message object
      const message: ContactMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        date: new Date().toISOString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        inquiryType: formData.inquiryType,
        subject: formData.subject,
        message: formData.message,
        status: 'new'
      }
      
      // Save message - use logged in user's email if available, otherwise use form email
      const userEmail = user?.email || formData.email || null
      await addMessage(userEmail, message)
      
      // If user is logged in, migrate any guest messages with their email to their account
      if (user?.email) {
        try {
          await migrateGuestMessages(user.email)
        } catch (error) {
          // Non-critical: migration failure doesn't affect form submission
          console.warn('Failed to migrate guest messages:', error)
        }
      }
      
      // Dispatch event to notify other components (like admin page)
      window.dispatchEvent(new Event('pixelpad_messages_changed'))
      
      // Removed artificial delay for faster response
      
      setIsSubmitting(false)
      setSubmitStatus('success')
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          inquiryType: '',
          subject: '',
          message: ''
        })
        setSubmitStatus('idle')
        setFormErrors({})
      }, 3000)
    } catch (error) {
      console.error('Error saving message:', error)
      setIsSubmitting(false)
      setSubmitStatus('error')
    }
  }

  // FAQ data
  const faqData = [
    {
      question: t('contact.faq.question1'),
      answer: t('contact.faq.answer1')
    },
    {
      question: t('contact.faq.question2'),
      answer: t('contact.faq.answer2')
    },
    {
      question: t('contact.faq.question3'),
      answer: t('contact.faq.answer3')
    },
    {
      question: t('contact.faq.question4'),
      answer: t('contact.faq.answer4')
    },
    {
      question: t('contact.faq.question5'),
      answer: t('contact.faq.answer5')
    },
    {
      question: t('contact.faq.question6'),
      answer: t('contact.faq.answer6')
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative pt-20 sm:pt-20 md:pt-24 lg:pt-16">
      {/* Enhanced Professional Hero Section */}
      <section className="relative bg-white dark:bg-gray-900 shadow-lg overflow-hidden z-10 pt-4 sm:pt-4 md:pt-4 lg:pt-4">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary-500 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary-500 rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-2 sm:pt-4 md:py-4 lg:pt-2 lg:pb-5 pb-4 sm:pb-5 md:pb-6 lg:pb-6 relative z-10">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 lg:mb-3 animate-in fade-in duration-1000 delay-300">
              {t('contact.hero.title')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-lg text-gray-700 dark:text-gray-300 mb-4 sm:mb-5 lg:mb-4 animate-in slide-in-from-bottom duration-1000 delay-500 px-2">
              {t('contact.hero.subtitle')}
            </p>
            
            {/* Professional Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-3.5 md:gap-4 lg:gap-5 animate-in slide-in-from-bottom duration-1000 delay-700">
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 sm:px-3 md:px-3 lg:px-4 py-2 sm:py-2.5 md:py-2.5 lg:py-2.5 border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-300 group">
                <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-[10px]">⚡</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">24h Response Time</div>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 sm:px-3 md:px-3 lg:px-4 py-2 sm:py-2.5 md:py-2.5 lg:py-2.5 border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-300 group">
                <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-[10px]">🛠️</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Expert Support</div>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 sm:px-3 md:px-3 lg:px-4 py-2 sm:py-2.5 md:py-2.5 lg:py-2.5 border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-300 group">
                <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                  <PhoneIcon className="w-3 h-3 text-white" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Call Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Form Section */}
      <section className="py-8 bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Optimized Background Elements */}
        <div className="absolute inset-0 overflow-hidden" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400/5 rounded-full blur-2xl opacity-15 dark:opacity-20" style={{ willChange: 'opacity' }}></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-400/5 rounded-full blur-2xl opacity-15 dark:opacity-20" style={{ willChange: 'opacity' }}></div>
        </div>

        {/* Enhanced Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(0,0,0,0.08) 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Enhanced Contact Form */}
            <div id="contact-form-container" className="animate-in slide-in-from-left duration-1000">
              <div className="bg-white/90 dark:bg-gray-800 dark:bg-opacity-95 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:p-8 border-2 border-white/50 dark:border-gray-700/50 hover:shadow-primary-500/20 transition-shadow duration-200" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-primary-600 dark:text-primary-400 mb-3">
                  {t('contact.hero.title')}
                </h2>
                <p className="text-base lg:text-lg text-primary-700 dark:text-primary-300 mb-6 font-medium">
                  {t('contact.form.subtitle24')}
                </p>
                
                {/* Hide Form Button - Only visible when form is shown */}
                {showForm && (
                  <div className="mb-6 flex justify-end">
                    <button
                      onClick={() => {
                        setShowForm(false)
                        // Smooth scroll to top of form container
                        setTimeout(() => {
                          const formElement = document.getElementById('contact-form-container')
                          if (formElement) {
                            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        }, 100)
                      }}
                      className="group inline-flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold text-sm transition-colors transition-shadow duration-200 shadow-md hover:shadow-lg" style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                    >
                      <XMarkIcon className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                      {t('contact.form.hideForm')}
                    </button>
                  </div>
                )}

                {/* Enhanced Show Form Button - Only visible when form is hidden */}
                {!showForm && (
                  <div className="text-center py-12">
                    <div className="mb-6 relative">
                      <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl hover:shadow-primary-500/50 transition-shadow duration-200 group" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                        <PaperAirplaneIcon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      {/* Floating decorative elements */}
                      <div className="absolute top-0 left-1/4 w-4 h-4 bg-primary-400 rounded-full blur-sm opacity-50 animate-bounce" style={{ animationDuration: '2s' }}></div>
                      <div className="absolute top-0 right-1/4 w-3 h-3 bg-primary-400 rounded-full blur-sm opacity-50 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
                    </div>
                    <button
                      onClick={() => {
                        setShowForm(true)
                        // Smooth scroll to form after a short delay
                        setTimeout(() => {
                          const formElement = document.getElementById('contact-form-container')
                          if (formElement) {
                            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        }, 100)
                      }}
                      className="group relative inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold text-base transition-shadow duration-200 shadow-xl hover:shadow-primary-500/50 overflow-hidden" style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                    >
                      <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" style={{ willChange: 'transform' }}></span>
                      <span className="relative z-10 flex items-center gap-2">
                        {t('contact.form.fillOut')}
                        <PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-2 group-hover:rotate-12 transition-transform duration-200" style={{ willChange: 'transform' }} />
                      </span>
                    </button>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-4 font-medium">
                      {t('contact.form.fillOutHelper')}
                    </p>
                  </div>
                )}

                {/* Enhanced Contact Form - Hidden by default, shown with animation */}
                {showForm && (
                  <form 
                    onSubmit={handleSubmit} 
                    className="space-y-4 animate-in slide-in-from-top fade-in duration-500"
                  >
                    {/* Enhanced Name Field */}
                    <div className="group">
                      <label htmlFor="name" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                        <UserIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                        {t('contact.form.name')} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder={t('contact.form.namePlaceholder')}
                        className={`w-full px-4 py-3 text-sm border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-all duration-300 hover:border-primary-400 dark:hover:border-primary-500 shadow-sm hover:shadow-md focus:shadow-lg ${
                          formErrors.name 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {formErrors.name && (
                        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center animate-in slide-in-from-top duration-300">
                          <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1" />
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Enhanced Email Field */}
                    <div className="group">
                      <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                        <EnvelopeIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                        {t('contact.form.email')} *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder={t('contact.form.emailPlaceholder')}
                          className={`w-full px-4 py-3 pl-10 text-sm border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-all duration-300 hover:border-primary-400 dark:hover:border-primary-500 shadow-sm hover:shadow-md focus:shadow-lg ${
                            formErrors.email 
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors duration-300" />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center animate-in slide-in-from-top duration-300">
                          <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Enhanced Phone Field */}
                    <div className="group">
                      <label htmlFor="phone" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                        <PhoneIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                        {t('contact.form.phone')}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder={t('contact.form.phonePlaceholder')}
                          className="w-full px-4 py-3 pl-10 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-all duration-300 hover:border-primary-400 dark:hover:border-primary-500 shadow-sm hover:shadow-md focus:shadow-lg"
                        />
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors duration-300" />
                      </div>
                    </div>

                    {/* Enhanced Inquiry Type */}
                    <div className="group">
                      <label htmlFor="inquiryType" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                        <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                        {t('contact.form.inquiryType')} *
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 text-sm border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-all duration-300 hover:border-primary-400 dark:hover:border-primary-500 shadow-sm hover:shadow-md focus:shadow-lg cursor-pointer ${
                          formErrors.inquiryType 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <option value="">{t('contact.form.inquiryTypePlaceholder')}</option>
                        <option value="general">{t('contact.form.inquiryTypeGeneral')}</option>
                        <option value="product">{t('contact.form.inquiryTypeProduct')}</option>
                        <option value="returns">{t('contact.form.inquiryTypeReturns')}</option>
                        <option value="warranty">{t('contact.form.inquiryTypeWarranty')}</option>
                        <option value="other">{t('contact.form.inquiryTypeOther')}</option>
                      </select>
                      {formErrors.inquiryType && (
                        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center animate-in slide-in-from-top duration-300">
                          <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1" />
                          {formErrors.inquiryType}
                        </p>
                      )}
                    </div>

                    {/* Enhanced Subject */}
                    <div className="group">
                      <label htmlFor="subject" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                        <SparklesIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                        {t('contact.form.subject')} *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder={t('contact.form.subjectPlaceholder')}
                        className={`w-full px-4 py-3 text-sm border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-all duration-300 hover:border-primary-400 dark:hover:border-primary-500 shadow-sm hover:shadow-md focus:shadow-lg ${
                          formErrors.subject 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {formErrors.subject && (
                        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center animate-in slide-in-from-top duration-300">
                          <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1" />
                          {formErrors.subject}
                        </p>
                      )}
                    </div>

                    {/* Enhanced Message */}
                    <div className="group">
                      <label htmlFor="message" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                        <InformationCircleIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                        {t('contact.form.message')} *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        placeholder={t('contact.form.messagePlaceholder')}
                        className={`w-full px-4 py-3 text-sm border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-all duration-300 resize-none hover:border-primary-400 dark:hover:border-primary-500 shadow-sm hover:shadow-md focus:shadow-lg ${
                          formErrors.message 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {formErrors.message && (
                        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center animate-in slide-in-from-top duration-300">
                          <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1" />
                          {formErrors.message}
                        </p>
                      )}
                    </div>

                    {/* Enhanced Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-primary-500/50 overflow-hidden" style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                    >
                      <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left disabled:scale-x-0" style={{ willChange: 'transform' }}></span>
                      <span className="relative z-10 flex items-center gap-2">
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>{t('contact.form.sending')}</span>
                          </>
                        ) : (
                          <>
                            <PaperAirplaneIcon className="h-4 w-4 group-hover:translate-x-1 group-hover:rotate-12 transition-all duration-300" />
                            <span>{t('contact.form.sendMessage')}</span>
                          </>
                        )}
                      </span>
                    </button>

                  {submitStatus === 'success' && (
                    <div className="animate-in slide-in-from-bottom duration-500 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl p-4 flex items-center shadow-md">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                        <CheckCircleIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-green-800 dark:text-green-200 font-bold text-base block">{t('contact.form.success')}</span>
                        <span className="text-green-700 dark:text-green-300 text-xs">{t('contact.form.successDetail')}</span>
                      </div>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="animate-in slide-in-from-bottom duration-500 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-4 flex items-center shadow-md">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                        <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-red-800 dark:text-red-200 font-bold text-base block">{t('contact.form.error')}</span>
                        <span className="text-red-700 dark:text-red-300 text-xs">{t('contact.form.errorDetail')}</span>
                      </div>
                    </div>
                  )}
                </form>
                )}
              </div>
            </div>

            {/* Enhanced Contact Information */}
            <div className="animate-in slide-in-from-right duration-1000">
              <div className="bg-white/90 dark:bg-gray-800 dark:bg-opacity-95 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:p-8 border-2 border-white/50 dark:border-gray-700/50 hover:shadow-green-500/20 transition-shadow duration-200" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                <div className="inline-flex items-center bg-primary-600 text-white px-4 py-2.5 rounded-full text-xs font-bold mb-5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <span>{t('contact.info.title')}</span>
                  <div className="w-5 h-5 bg-white/25 rounded-full flex items-center justify-center ml-2 group-hover:-rotate-12 transition-transform duration-300">
                    <PhoneIcon className="w-3 h-3" />
                  </div>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-primary-600 dark:text-primary-400 mb-3">
                  {t('contact.info.title')}
                </h2>
                <p className="text-base lg:text-lg text-primary-700 dark:text-primary-300 mb-6 font-medium">
                  {t('contact.info.subtitle')}
                </p>

                <div className="space-y-4">
                  <div className="flex items-start group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-colors transition-shadow duration-200 cursor-pointer" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3 group-hover:rotate-6 transition-transform duration-200 shadow-md" style={{ willChange: 'transform' }}>
                      <PhoneIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-primary-600 dark:text-primary-400 mb-1.5 transition-colors duration-300">
                        {t('contact.info.phone')}
                      </h3>
                      <a href="tel:+212779318061" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-semibold text-sm">
                        <span dir="ltr">{t('contact.info.phoneNumber')}</span>
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-md">
                      <EnvelopeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-primary-600 dark:text-primary-400 mb-1.5 transition-colors duration-300">
                        {t('contact.info.email')}
                      </h3>
                      <a href="mailto:pixelpad77@gmail.com" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-semibold text-sm break-all">
                        pixelpad77@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-md">
                      <MapPinIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-primary-600 dark:text-primary-400 mb-1.5 transition-colors duration-300">
                        {t('contact.info.address')}
                      </h3>
                      <a 
                        href="https://maps.google.com/maps?q=Fes+Champs+de+Course" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-semibold text-sm"
                      >
                        {t('contact.info.addressValue')}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-md">
                      <ClockIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-primary-600 dark:text-primary-400 mb-1.5 transition-colors duration-300">
                        {t('contact.info.hours')}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">{t('contact.businessHours.monFri')}: {t('contact.businessHours.mondayHoursShort')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-md">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-primary-600 dark:text-primary-400 mb-1.5 transition-colors duration-300">
                        {t('contact.businessHours.whatsapp')}
                      </h3>
                      <a href="https://wa.me/212779318061" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-semibold text-sm">
                        <span dir="ltr">{t('contact.info.whatsappNumber')}</span>
                      </a>
                    </div>
                  </div>

                  {/* Enhanced Social Media Links */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-3">
                        {t('contact.social.title')}
                      </h3>
                      <div className={`flex justify-center items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <a href="https://www.facebook.com/profile.php?id=61558615438246" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                        <a href="https://www.instagram.com/pixel.pad77?igsh=NWlubzJhMmszOTY4" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                        <a href="https://www.tiktok.com/@pixel.pad1" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                          <Image
                            src="/icons/tiktok.png"
                            alt="TikTok"
                            width={16}
                            height={16}
                            className="h-4 w-4 brightness-0 invert"
                          />
                        </a>
                        <a href="https://wa.me/212779318061" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Support Hours Section */}
      <section className="py-8 bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Optimized Background Elements */}
        <div className="absolute inset-0 overflow-hidden" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400/5 rounded-full blur-2xl opacity-15 dark:opacity-20" style={{ willChange: 'opacity' }}></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-400/5 rounded-full blur-2xl opacity-15 dark:opacity-20" style={{ willChange: 'opacity' }}></div>
        </div>

        {/* Enhanced Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(0,0,0,0.08) 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-6">
            <div className="inline-flex items-center bg-primary-600 text-white px-4 py-2.5 rounded-full text-xs font-bold mb-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
              <div className="w-5 h-5 bg-white/25 rounded-full flex items-center justify-center mr-2 group-hover:rotate-12 transition-transform duration-300">
                <ClockIcon className="w-3 h-3" />
              </div>
              <span>{t('contact.businessHours.badge')}</span>
              <div className="w-5 h-5 bg-white/25 rounded-full flex items-center justify-center ml-2 group-hover:-rotate-12 transition-transform duration-300">
                <span className="text-xs">🕒</span>
              </div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-primary-600 dark:text-primary-400 mb-4">
              {t('contact.businessHours.heading')}
            </h2>
            <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto font-medium">
              {t('contact.businessHours.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Enhanced Phone Support Card */}
            <div className="group relative animate-in slide-in-from-bottom duration-1000">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-xl transition-shadow duration-200 h-full" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform duration-200 shadow-lg" style={{ willChange: 'transform' }}>
                    <PhoneIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-extrabold mb-4 text-primary-600 dark:text-primary-400 transition-colors duration-300">
                    {t('contact.businessHours.phoneSupport')}
                  </h3>
                  <div className="space-y-2.5 mb-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t('contact.businessHours.monday')}</p>
                      <p className="text-base text-primary-600 dark:text-primary-400 font-semibold">{t('contact.businessHours.mondayHours')}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t('contact.businessHours.saturday')}</p>
                      <p className="text-base text-primary-600 dark:text-primary-400 font-semibold">{t('contact.businessHours.saturdayHours')}</p>
                    </div>
                  </div>
                  <a 
                    href="tel:+212779318061"
                    className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <PhoneIcon className="h-4 w-4 mr-1.5" />
                    {t('contact.businessHours.callNow')}
                  </a>
                </div>
              </div>
            </div>
            
            {/* Enhanced Email Support Card */}
            <div className="group relative animate-in slide-in-from-bottom duration-1000 delay-200">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-xl transition-shadow duration-200 h-full" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform duration-200 shadow-lg" style={{ willChange: 'transform' }}>
                    <EnvelopeIcon className="h-8 w-8 text-white" />
                  </div>
                      <h3 className="text-xl lg:text-2xl font-extrabold mb-4 text-primary-600 dark:text-primary-400 transition-colors duration-300">
                        {t('contact.businessHours.emailSupport')}
                      </h3>
                      <div className="space-y-2.5 mb-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t('contact.businessHours.available')}</p>
                          <p className="text-base text-primary-600 dark:text-primary-400 font-semibold">{t('contact.businessHours.available24')}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t('contact.businessHours.responseTime')}</p>
                          <p className="text-base text-primary-600 dark:text-primary-400 font-semibold">{t('contact.businessHours.responseTimeValue')}</p>
                        </div>
                      </div>
                      <a 
                        href="mailto:pixelpad77@gmail.com"
                        className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                    <EnvelopeIcon className="h-4 w-4 mr-1.5" />
                    {t('contact.businessHours.sendEmail')}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Support Methods */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="text-center group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl transition-colors transition-shadow duration-200" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
              <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform duration-200 shadow-lg" style={{ willChange: 'transform' }}>
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                {t('contact.businessHours.whatsapp')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('contact.businessHours.whatsappDesc')}</p>
              <a href="https://wa.me/212779318061" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm transition-colors duration-300">
                {t('contact.businessHours.chatNow')} →
              </a>
            </div>

            <div className="text-center group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                {t('contact.businessHours.businessHours')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('contact.businessHours.monFri')}: {t('contact.businessHours.mondayHoursShort')}</p>
              <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm">{t('contact.businessHours.saturdayShort')}: {t('contact.businessHours.saturdayHoursShort')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section className="py-8 bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Optimized Background Elements */}
        <div className="absolute inset-0 overflow-hidden" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400/5 rounded-full blur-2xl opacity-15 dark:opacity-20" style={{ willChange: 'opacity' }}></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-400/5 rounded-full blur-2xl opacity-15 dark:opacity-20" style={{ willChange: 'opacity' }}></div>
        </div>

        {/* Enhanced Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(0,0,0,0.08) 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-primary-600 text-white px-4 py-2.5 rounded-full text-xs font-bold mb-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
              <div className="w-5 h-5 bg-white/25 rounded-full flex items-center justify-center mr-2 group-hover:rotate-12 transition-transform duration-300">
                <span className="text-xs">❓</span>
              </div>
              <span>FAQ</span>
              <div className="w-5 h-5 bg-white/25 rounded-full flex items-center justify-center ml-2 group-hover:-rotate-12 transition-transform duration-300">
                <InformationCircleIcon className="w-3 h-3" />
              </div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-primary-600 dark:text-primary-400 mb-4">
              {t('contact.faq.title')}
            </h2>
            <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto font-medium">
              {t('contact.faq.subtitle')}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div 
                  key={index} 
                  className={`group bg-white/90 dark:bg-gray-800 dark:bg-opacity-95 backdrop-blur-md rounded-xl border-2 transition-shadow duration-200 ${
                    activeFAQ === index 
                      ? 'border-primary-400 dark:border-primary-500 shadow-xl shadow-primary-500/30' 
                      : 'border-gray-200/50 dark:border-gray-700/30 hover:border-primary-300 dark:hover:border-primary-600 shadow-md hover:shadow-lg hover:shadow-primary-500/20'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <button
                    onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                    className="w-full px-5 py-4 lg:px-6 lg:py-5 text-left flex justify-between items-center gap-3 rounded-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        activeFAQ === index
                          ? 'bg-primary-600 shadow-md'
                          : 'bg-primary-100 dark:bg-primary-900/30 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40'
                      }`}>
                        <span className={`text-sm font-bold transition-colors duration-300 ${
                          activeFAQ === index ? 'text-white' : 'text-primary-600 dark:text-primary-400'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                      <span className={`font-bold text-gray-900 dark:text-white text-base lg:text-lg transition-colors duration-300 flex-1 ${
                        activeFAQ === index 
                          ? 'text-primary-700 dark:text-primary-300' 
                          : ''
                      }`}>
                        {faq.question}
                      </span>
                    </div>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      activeFAQ === index
                        ? 'bg-gradient-to-br from-primary-500 to-primary-700 rotate-180 shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30'
                    }`}>
                      <svg 
                        className={`h-5 w-5 transition-all duration-300 ${
                          activeFAQ === index 
                            ? 'text-white' 
                            : 'text-gray-500'
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {activeFAQ === index && (
                    <div className="px-5 lg:px-6 pb-4 lg:pb-5 animate-in slide-in-from-top fade-in duration-300">
                      <div className="border-t-2 border-primary-200 dark:border-primary-700 pt-4">
                        <div className="flex items-start gap-3">
                          <div className="w-1 h-full bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm lg:text-base font-medium flex-1">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}