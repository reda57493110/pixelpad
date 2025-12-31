'use client'
import { useState, useEffect } from 'react'
import { 
  ComputerDesktopIcon,
  CameraIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { addServiceRequest, migrateGuestServiceRequests } from '@/lib/serviceRequests'
import { ServiceRequest } from '@/types'

export default function ServicesPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    city: '',
    email: '',
    phone: '',
    numberOfComputers: '',
    needCameras: '',
    preferredDate: '',
    additionalDetails: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [captchaCode, setCaptchaCode] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')

  // Generate captcha code on mount
  useEffect(() => {
    generateCaptcha()
  }, [])

  // Pre-fill form when user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email
      }))
    }
  }, [user])

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaCode(code)
    setCaptchaInput('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    // Validate number of computers to be max 25
    if (name === 'numberOfComputers') {
      const numValue = parseInt(value)
      if (value === '' || (numValue >= 1 && numValue <= 25)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate captcha
    if (captchaInput.toUpperCase() !== captchaCode) {
      setSubmitStatus('error')
      setCaptchaInput('')
      generateCaptcha()
      return
    }
    
    // Validate phone number is provided
    if (!formData.phone || formData.phone.trim() === '') {
      setSubmitStatus('error')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Create service request object
      const request: ServiceRequest = {
        id: `sr_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        date: new Date().toISOString(),
        fullName: formData.fullName,
        companyName: formData.companyName || undefined,
        city: formData.city,
        email: formData.email || undefined,
        phone: formData.phone,
        emailOrPhone: formData.phone, // Only store phone number, not email
        numberOfComputers: formData.numberOfComputers,
        needCameras: formData.needCameras,
        preferredDate: formData.preferredDate || undefined,
        additionalDetails: formData.additionalDetails || undefined,
        status: 'new',
        captchaCode: captchaCode // Store captcha for admin verification
      }
      
      // Save service request - use logged in user's email if available, otherwise use email from form
      const userEmail = user?.email || formData.email || null
      await addServiceRequest(userEmail, request)
      
      // If user is logged in, migrate any guest service requests with their email to their account
      if (user?.email) {
        try {
          await migrateGuestServiceRequests(user.email)
        } catch (error) {
          // Non-critical: migration failure doesn't affect form submission
          console.warn('Failed to migrate guest service requests:', error)
        }
      }
      
      // Dispatch event to notify other components (like admin page)
      window.dispatchEvent(new Event('pixelpad_service_requests_changed'))
      
      // Simulate form submission delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubmitting(false)
      setSubmitStatus('success')
      
      // Scroll to success message
      setTimeout(() => {
        const successMessage = document.getElementById('success-message')
        if (successMessage) {
          successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
      
      // Reset form after 5 seconds (longer to see the message)
      setTimeout(() => {
        setFormData({
          fullName: '',
          companyName: '',
          city: '',
          email: '',
          phone: '',
          numberOfComputers: '',
          needCameras: '',
          preferredDate: '',
          additionalDetails: ''
        })
        setCaptchaInput('')
        generateCaptcha()
        setSubmitStatus('idle')
      }, 5000)
    } catch (error) {
      console.error('Error saving service request:', error)
      setIsSubmitting(false)
      setSubmitStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-primary-950 text-white py-8 lg:py-10 pt-24 overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-white/30 to-primary-300/40 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
          <div className="absolute bottom-20 right-20 w-[32rem] h-[32rem] bg-gradient-to-br from-primary-300/30 to-primary-400/40 rounded-full blur-3xl opacity-30 dark:opacity-20" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-br from-primary-300/25 to-primary-400/35 rounded-full blur-3xl opacity-25 dark:opacity-15" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-primary-300/25 to-primary-400/35 rounded-full blur-2xl opacity-25 dark:opacity-15" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {/* Enhanced Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.3) 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center bg-white/20 backdrop-blur-xl text-white px-6 py-2.5 rounded-full text-xs font-bold mb-6 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group border border-white/20">
            <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center mr-2 group-hover:rotate-12 transition-transform duration-300">
              <span className="text-sm">🛠️</span>
            </div>
            <span>{t('services.hero.badge')}</span>
            <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center ml-2 group-hover:-rotate-12 transition-transform duration-300">
              <span className="text-sm">✨</span>
            </div>
          </div>

          {/* Enhanced Headline */}
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-6 animate-in slide-in-from-top duration-1000">
            <span className="bg-gradient-to-r from-white via-primary-100 to-primary-200 bg-clip-text text-transparent drop-shadow-lg">
              {t('services.hero.title')}
            </span>
          </h1>

          {/* Enhanced Description */}
          <p className="text-base lg:text-lg mb-8 opacity-95 max-w-4xl mx-auto animate-in slide-in-from-bottom duration-1000 delay-300 leading-relaxed font-medium">
            {t('services.hero.subtitle')}
          </p>

          {/* Enhanced Service Badges */}
          <div className="flex flex-wrap justify-center gap-3 lg:gap-4 animate-in slide-in-from-bottom duration-1000 delay-500">
            <div className="group flex items-center bg-white/20 backdrop-blur-xl rounded-full px-4 py-2.5 border-2 border-white/30 hover:border-white/50 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mr-2 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-md">
                <ComputerDesktopIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">{t('services.hero.badge.computerInstallation')}</span>
            </div>
            <div className="group flex items-center bg-white/20 backdrop-blur-xl rounded-full px-4 py-2.5 border-2 border-white/30 hover:border-white/50 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mr-2 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-md">
                <CameraIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">{t('services.hero.badge.securityCameras')}</span>
            </div>
            <div className="group flex items-center bg-white/20 backdrop-blur-xl rounded-full px-4 py-2.5 border-2 border-white/30 hover:border-white/50 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mr-2 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-md">
                <WrenchScrewdriverIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">{t('services.hero.badge.professionalSetup')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Description */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('services.description.title')}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('services.description.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <ComputerDesktopIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {t('services.description.computerInstallation.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('services.description.computerInstallation.desc')}
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <CameraIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {t('services.description.securityCameras.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('services.description.securityCameras.desc')}
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <WrenchScrewdriverIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {t('services.description.accessories.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('services.description.accessories.desc')}
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
                {t('services.description.cta')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Request Form */}
      <section className="py-8 bg-gradient-to-br from-white via-primary-50 to-gray-50 dark:from-gray-900 dark:via-primary-900/30 dark:to-gray-800/30 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-3xl opacity-20 dark:opacity-30"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full blur-3xl opacity-20 dark:opacity-30" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full blur-3xl opacity-15 dark:opacity-25" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Enhanced Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(0,0,0,0.08) 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/90 dark:bg-gray-800 dark:bg-opacity-95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 lg:p-8 border-2 border-white/50 dark:border-gray-700/50 transition-all duration-300">
            {/* Enhanced Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-full text-xs font-bold mb-4 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
                <div className="w-6 h-6 bg-white/25 rounded-full flex items-center justify-center mr-2 group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-sm">📝</span>
                </div>
                <span>{t('services.form.badge')}</span>
                <div className="w-6 h-6 bg-white/25 rounded-full flex items-center justify-center ml-2 group-hover:-rotate-12 transition-transform duration-300">
                  <PaperAirplaneIcon className="w-3 h-3" />
                </div>
              </div>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
                <span className="bg-gradient-to-r from-gray-900 via-primary-800 to-primary-900 dark:from-white dark:via-primary-100 dark:to-primary-200 bg-clip-text text-transparent">
                  {t('services.form.title')}
                </span>
              </h3>
              <p className="text-base lg:text-lg text-gray-700 dark:text-gray-300 font-medium">
                {t('services.form.subtitle')}
              </p>
            </div>

            {submitStatus === 'success' && (
              <div id="success-message" className="mb-6 animate-in slide-in-from-bottom duration-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-4 flex items-center shadow-2xl ring-4 ring-green-200 dark:ring-green-800">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3 shadow-xl flex-shrink-0 animate-pulse">
                  <CheckCircleIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-green-800 dark:text-green-200 font-bold text-base block mb-1 flex items-center gap-2">
                    {t('services.form.success.title')} 
                    <CheckCircleIcon className="w-4 h-4" />
                  </span>
                  <span className="text-green-700 dark:text-green-300 text-sm">{t('services.form.success.desc')}</span>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 animate-in slide-in-from-bottom duration-500 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-4 flex items-center shadow-lg">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-red-800 dark:text-red-200 font-bold text-base block">{t('services.form.error.title')}</span>
                  <span className="text-red-700 dark:text-red-300 text-xs">{t('services.form.error.desc')}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label htmlFor="fullName" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                    <UserIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                    {t('services.form.fullName')} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-colors transition-shadow duration-150 shadow-sm hover:shadow-md focus:shadow-lg border-gray-300 dark:border-gray-600"
                      placeholder={t('services.form.fullNamePlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="group">
                  <label htmlFor="companyName" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                    <BuildingOfficeIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                    {t('services.form.companyName')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-colors transition-shadow duration-150 shadow-sm hover:shadow-md focus:shadow-lg"
                      placeholder={t('services.form.companyNamePlaceholder')}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label htmlFor="city" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                    <MapPinIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                    {t('services.form.city')} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-colors transition-shadow duration-150 shadow-sm hover:shadow-md focus:shadow-lg"
                      placeholder={t('services.form.cityPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="group">
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                    <EnvelopeIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                    {t('services.form.email')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-colors transition-shadow duration-150 shadow-sm hover:shadow-md focus:shadow-lg"
                      placeholder={t('services.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                <div className="group">
                  <label htmlFor="phone" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                    <PhoneIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                    {t('services.form.phone')} *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-colors transition-shadow duration-150 shadow-sm hover:shadow-md focus:shadow-lg"
                      placeholder={t('services.form.phonePlaceholder')}
                    />
                  </div>
                </div>
              </div>

              <div className="group">
                <label htmlFor="numberOfComputers" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                  <ComputerDesktopIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                  {t('services.form.numberOfComputers')} * ({t('services.form.max25')})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="numberOfComputers"
                    name="numberOfComputers"
                    value={formData.numberOfComputers}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="25"
                    className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-colors transition-shadow duration-150 shadow-sm hover:shadow-md focus:shadow-lg"
                    placeholder={t('services.form.numberOfComputersPlaceholder')}
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="needCameras" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                  <CameraIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                  {t('services.form.needCameras')} *
                </label>
                <select
                  id="needCameras"
                  name="needCameras"
                  value={formData.needCameras}
                  onChange={handleInputChange}
                  required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-colors transition-shadow duration-150 shadow-sm hover:shadow-md focus:shadow-lg cursor-pointer"
                >
                  <option value="">{t('services.form.selectOption')}</option>
                  <option value="Yes">{t('services.form.yes')}</option>
                  <option value="No">{t('services.form.no')}</option>
                  <option value="Not sure">{t('services.form.notSure')}</option>
                </select>
              </div>

              <div className="group">
                <label htmlFor="preferredDate" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                  {t('services.form.preferredDate')}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-colors transition-shadow duration-150 shadow-sm hover:shadow-md focus:shadow-lg"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="additionalDetails" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                  <PaperAirplaneIcon className="h-3.5 w-3.5 mr-1.5 text-primary-600 dark:text-primary-400" />
                  {t('services.form.additionalDetails')}
                </label>
                <textarea
                  id="additionalDetails"
                  name="additionalDetails"
                  value={formData.additionalDetails}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-colors transition-shadow duration-150 resize-none shadow-sm hover:shadow-md focus:shadow-lg"
                  placeholder={t('services.form.additionalDetailsPlaceholder')}
                />
              </div>

              {/* Captcha */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('services.form.captcha')} *
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                      required
                      maxLength={5}
                      className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:bg-opacity-90 dark:text-white transition-colors transition-shadow duration-150 shadow-sm hover:shadow-md focus:shadow-lg uppercase tracking-widest font-bold text-lg"
                      placeholder={t('services.form.captchaPlaceholder')}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600">
                      <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 tracking-widest select-none" style={{ fontFamily: 'monospace', letterSpacing: '0.2em' }}>
                        {captchaCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="px-3 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                      title={t('services.form.refreshCaptcha')}
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('services.form.captchaHint')}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3.5 px-6 rounded-xl transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl hover:shadow-primary-500/50 overflow-hidden text-sm"
                style={{ willChange: 'transform', transform: 'translateZ(0)' }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-0"></span>
                <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left disabled:scale-x-0" style={{ willChange: 'transform' }}></span>
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>{t('services.form.submitting')}</span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-5 w-5 group-hover:translate-x-1 group-hover:rotate-12 transition-transform duration-200" style={{ willChange: 'transform' }} />
                      <span>{t('services.form.submit')}</span>
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}