'use client'

import { useState } from 'react'
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
  HeartIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'

export default function ContactsPage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    priority: 'normal'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitStatus('success')
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        priority: 'normal'
      })
      setSubmitStatus('idle')
    }, 3000)
  }

  // Custom WhatsApp Icon Component using your image
  const WhatsAppIcon = ({ className }: { className?: string }) => (
    <Image 
      src="/images/whatsapp-icon.jpg" 
      alt="WhatsApp" 
      width={24} 
      height={24} 
      className={className}
    />
  )


  const contactMethods = [
    {
      icon: EnvelopeIcon,
      title: t('contact.methods.email.title'),
      description: t('contact.methods.email.description'),
      contact: 'pixelpad77@gmail.com',
      href: 'mailto:pixelpad77@gmail.com',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      icon: WhatsAppIcon,
      title: t('contact.methods.phone.title'),
      description: t('contact.methods.phone.description'),
      contact: '0779318061',
      href: 'https://wa.me/212779318061',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: t('contact.methods.chat.title'),
      description: t('contact.methods.chat.description'),
      contact: t('contact.methods.chat.available'),
      href: '#',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      icon: MapPinIcon,
      title: t('contact.methods.visit.title'),
      description: t('contact.methods.visit.description'),
      contact: 'Fes Champs de Course',
      href: 'https://maps.google.com/?q=Fes+Champs+de+Course+Morocco',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600'
    }
  ]

  const businessHours = [
    { day: t('contact.businessHours.monday'), hours: t('contact.businessHours.mondayHours') },
    { day: t('contact.businessHours.saturday'), hours: t('contact.businessHours.saturdayHours') },
    { day: t('contact.businessHours.sunday'), hours: t('contact.businessHours.sundayHours') }
  ]

  // Custom Facebook Icon Component
  const FacebookIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )

  // Custom Instagram Icon Component
  const InstagramIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )

  const socialLinks = [
    { 
      name: 'Facebook', 
      href: 'https://www.facebook.com/profile.php?id=61558615438246', 
      icon: 'facebook',
      color: 'hover:bg-blue-600'
    },
    { 
      name: 'Instagram', 
      href: 'https://www.instagram.com/pixel.pad77?igsh=NWlubzJhMmszOTY4', 
      icon: 'instagram',
      color: 'hover:bg-pink-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-2000"></div>
        </div>
        
        {/* Marketing Badge */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg animate-bounce">
            <span className="animate-spin">🔥</span>
            <span className="mx-2">GET EXPERT ADVICE - PROFESSIONAL CONSULTATION!</span>
            <span className="animate-spin">🔥</span>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            {t('contact.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in delay-200">
            {t('contact.hero.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in delay-400">
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <HeartIcon className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">{t('contact.hero.support24')}</span>
            </div>
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">{t('contact.hero.expertTeam')}</span>
            </div>
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <GlobeAltIcon className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">{t('contact.hero.globalReach')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon
              return (
                <div 
                  key={index}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`w-14 h-14 ${method.color} ${method.hoverColor} rounded-xl flex items-center justify-center mb-4 transition-colors duration-300`}>
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {method.description}
                  </p>
                  <a 
                    href={method.href}
                    className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    {method.contact}
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('contact.getInTouch.title')}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {t('contact.getInTouch.description')}
                </p>
              </div>

              {/* Business Hours */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mr-4">
                    <ClockIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('contact.businessHours.title')}
                  </h3>
                </div>
                <div className="space-y-3">
                  {businessHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {schedule.day}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {schedule.hours}
                      </span>
                  </div>
                  ))}
                  </div>
                </div>

              {/* Office Location */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mr-4">
                    <MapPinIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('contact.location.title')}
                  </h3>
                  </div>
                <div className="text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-2">{t('contact.location.headquarters')}</p>
                  <a 
                    href="https://maps.google.com/?q=Fes+Champs+de+Course+Morocco"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Fes Champs de Course<br />
                    Morocco
                    </a>
                  </div>
                </div>

              {/* Social Media */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('contact.social.title')}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className={`flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 ${social.color} rounded-lg px-4 py-2 transition-all duration-300 transform hover:scale-105`}
                    >
                      {social.icon === 'facebook' ? (
                        <FacebookIcon className="h-5 w-5 text-blue-600" />
                      ) : social.icon === 'instagram' ? (
                        <InstagramIcon className="h-5 w-5 text-pink-600" />
                      ) : (
                        <span className="text-lg">{social.icon}</span>
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {social.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mr-4">
                  <PaperAirplaneIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('contact.form.title')}
                </h3>
              </div>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                  <span className="text-green-800 dark:text-green-200 font-medium">
                    {t('contact.form.success')}
                  </span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                  <span className="text-red-800 dark:text-red-200 font-medium">
                    {t('contact.form.error')}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('contact.form.firstName')} *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder={t('contact.form.firstNamePlaceholder')}
                    />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('contact.form.lastName')} *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder={t('contact.form.lastNamePlaceholder')}
                    />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('contact.form.email')} *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    placeholder={t('contact.form.emailPlaceholder')}
                  />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('contact.form.phone')}
                  </label>
                    <div className="relative">
                      <WhatsAppIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    placeholder={t('contact.form.phonePlaceholder')}
                  />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('contact.form.company')}
                    </label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        placeholder={t('contact.form.companyPlaceholder')}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('contact.form.subject')} *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  >
                    <option value="">{t('contact.form.subjectPlaceholder')}</option>
                    <option value="general">{t('contact.form.subjectGeneral')}</option>
                    <option value="support">{t('contact.form.subjectSupport')}</option>
                    <option value="order">{t('contact.form.subjectOrder')}</option>
                    <option value="warranty">{t('contact.form.subjectWarranty')}</option>
                    <option value="return">{t('contact.form.subjectReturn')}</option>
                    <option value="partnership">{t('contact.form.subjectPartnership')}</option>
                    <option value="other">{t('contact.form.subjectOther')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('contact.form.message')} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors resize-none"
                    placeholder={t('contact.form.messagePlaceholder')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('contact.form.sending')}
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                  {t('contact.form.sendMessage')}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('contact.faq.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('contact.faq.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('contact.faq.shipping.question')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('contact.faq.shipping.answer')}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('contact.faq.payment.question')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('contact.faq.payment.answer')}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('contact.faq.support.question')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('contact.faq.support.answer')}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('contact.faq.tracking.question')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('contact.faq.tracking.answer')}
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <a 
              href="/more/faq" 
              className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white text-lg px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              {t('contact.faq.viewAll')}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}