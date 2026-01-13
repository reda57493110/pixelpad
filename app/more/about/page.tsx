'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  BoltIcon,
  HeartIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  UserIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'

export default function AboutPage() {
  const { t, language } = useLanguage()
  const [customerCount, setCustomerCount] = useState(0)
  const [ratingCount, setRatingCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [isLoaded, setIsLoaded] = useState(true) // Start loaded for instant display
  const [activeSection, setActiveSection] = useState('hero')
  
  // Page load animation - removed since we start with isLoaded=true for instant display

  // Scroll effect with section tracking - optimized with throttling
  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          
          // Track active section
          const sections = ['hero', 'mission', 'story', 'values', 'achievements']
          
          for (const section of sections) {
            const element = document.getElementById(section)
            if (element) {
              const rect = element.getBoundingClientRect()
              if (rect.top <= 100 && rect.bottom >= 100) {
                setActiveSection(section)
                break
              }
            }
          }
          
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  // Mouse tracking effect - disabled for better performance (not critical)
  // useEffect(() => {
  //   let ticking = false
  //   const handleMouseMove = (e: MouseEvent) => {
  //     if (!ticking) {
  //       window.requestAnimationFrame(() => {
  //         setMousePosition({ x: e.clientX, y: e.clientY })
  //         ticking = false
  //       })
  //       ticking = true
  //     }
  //   }
  //   window.addEventListener('mousemove', handleMouseMove, { passive: true })
  //   return () => window.removeEventListener('mousemove', handleMouseMove)
  // }, [])

  useEffect(() => {
    // Set initial values immediately to prevent animation on refresh
    setCustomerCount(500)
    setRatingCount(4.7)
    
    // Delay observer setup to improve initial load
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true)
            
            // Simplified faster animation
            if (customerCount === 0) {
              const targetCustomers = 500
              const duration = 800 // Faster animation
              const steps = 40
              const increment = targetCustomers / steps
              const stepTime = duration / steps
              let step = 0
              
              const customerTimer = setInterval(() => {
                step++
                if (step >= steps) {
                  setCustomerCount(targetCustomers)
                  clearInterval(customerTimer)
                } else {
                  setCustomerCount(Math.floor(increment * step))
                }
              }, stepTime)
            }
            
            if (ratingCount === 0) {
              const targetRating = 4.7
              const duration = 800
              const steps = 40
              const increment = targetRating / steps
              const stepTime = duration / steps
              let step = 0
              
              const ratingTimer = setInterval(() => {
                step++
                if (step >= steps) {
                  setRatingCount(targetRating)
                  clearInterval(ratingTimer)
                } else {
                  setRatingCount(Math.round(increment * step * 10) / 10)
                }
              }, stepTime)
            }
          }
        },
        { threshold: 0.1 }
      )
      
      const element = document.getElementById('about-trust-indicators')
      if (element) {
        observer.observe(element)
      }
      
      return () => {
        if (element) {
          observer.unobserve(element)
        }
      }
    }, 200) // Delay observer by 200ms
    
    return () => clearTimeout(timer)
  }, [isVisible, customerCount, ratingCount])
  
  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 relative pt-20 sm:pt-20 md:pt-24 lg:pt-16 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section - Perfect Enhanced About Pixel Pad */}
      <section 
        id="hero" 
        className="relative bg-white dark:bg-gray-900 shadow-lg overflow-hidden z-10 pt-4 sm:pt-4 md:pt-4 lg:pt-4"
      >
        {/* Simplified Background */}
        <div className="absolute inset-0 bg-white dark:bg-gray-900"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-6xl mx-auto relative z-20">
            {/* Enhanced Header Section with Logo */}
            <div className="text-center mb-6 animate-in fade-in duration-1000">
              </div>
                  </div>
                </div>
      </section>
            
      {/* Enhanced Company History / Our Story */}
      <section id="story" className="pt-4 pb-8 lg:pt-6 lg:pb-10 bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Simplified Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute top-20 right-20 w-64 h-64 bg-primary-500 rounded-full blur-2xl"
            style={{ transform: `translateY(${scrollY * 0.08}px)` }}
          ></div>
          <div 
            className="absolute bottom-20 left-20 w-80 h-80 bg-primary-500 rounded-full blur-2xl"
            style={{ transform: `translateY(${-scrollY * 0.08}px)` }}
          ></div>
                    </div>
                    
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, rgba(34, 197, 94, 0.2) 2px, transparent 0)`,
              backgroundSize: '50px 50px',
              transform: `translate(${scrollY * 0.02}px, ${scrollY * 0.02}px)`
            }}
          ></div>
                      </div>
                      
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-primary-100 dark:bg-gray-800 dark:bg-opacity-90 text-primary-600 dark:text-primary-400 px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative group">
              <span className="mr-2 relative z-10 text-lg">📖</span>
              <span className="relative z-10">{t('about.story.badge')}</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
              <span className="text-primary-600 dark:text-primary-400 inline-block animate-in fade-in slide-in-from-bottom duration-1000">
                {t('about.story.title')}
                </span>
            </h2>
              
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
              {t('about.story.subtitle')}
            </p>
          </div>
          
          {/* Main Story Content */}
          <div className="flex justify-center mb-12">
            {/* Centered Story Card */}
            <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom duration-1000">
              <div className="bg-white/60 dark:bg-gray-800 dark:bg-opacity-95 backdrop-blur-md rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {t('about.story.desc1')}
                  </p>
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t('about.story.desc2')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Mission Statement */}
      <section 
        id="mission" 
        className="py-8 lg:py-10 bg-white dark:bg-gray-900 relative overflow-hidden"
        style={{
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Simplified Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute top-20 left-20 w-40 h-40 bg-primary-500 rounded-full blur-2xl"
            style={{ transform: `translateY(${scrollY * 0.08}px)` }}
          ></div>
          <div 
            className="absolute bottom-20 right-20 w-48 h-48 bg-primary-500 rounded-full blur-2xl"
            style={{ transform: `translateY(${-scrollY * 0.08}px)` }}
          ></div>
        </div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.2) 2px, transparent 0)`,
              backgroundSize: '50px 50px',
              transform: `translate(${scrollY * 0.02}px, ${scrollY * 0.02}px)`
            }}
          ></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-primary-100 dark:bg-gray-800 dark:bg-opacity-90 text-primary-600 dark:text-primary-400 px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative group">
              <Image src="/icons/target_17139056.svg" alt="Target icon" width={20} height={20} className="w-5 h-5 mr-2 relative z-10 dark:invert" />
              <span className="relative z-10">{t('about.mission.badge')}</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
              <span className="text-primary-600 dark:text-primary-400 inline-block animate-in fade-in slide-in-from-bottom duration-1000">
                {t('about.mission.title')}
              </span>
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
                {t('about.mission.desc')}
              </p>
              
              {/* Enhanced Mission Statement Card */}
              <div className="mt-8 p-5 md:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform duration-300">
                      <BoltIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-medium italic text-center">
                    "{t('about.mission.statement')}"
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mission Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: ShieldCheckIcon,
                title: t('about.quality.title'),
                description: t('about.quality.desc'),
                delay: 'delay-300'
              },
              {
                icon: UserIcon,
                title: t('about.support.title'),
                description: t('about.support.desc'),
                delay: 'delay-500'
              },
              {
                icon: HeartIcon,
                title: t('about.satisfaction.title'),
                description: t('about.satisfaction.desc'),
                delay: 'delay-700'
              },
              {
                icon: BoltIcon,
                title: t('about.mission.innovation'),
                description: t('about.mission.innovationDesc'),
                delay: 'delay-900'
              }
            ].map((pillar, index) => {
              const IconComponent = pillar.icon
              return (
                <div
                  key={index}
                  className="group bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden animate-in fade-in slide-in-from-bottom duration-1000"
                >
                  {/* Simplified Background */}
                  <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Icon Container */}
                  <div className="relative z-10 mb-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center shadow-md group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                      {pillar.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-xs">
                      {pillar.description}
                    </p>
                  </div>
                  
                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary-500 opacity-5 rounded-bl-full"></div>
                </div>
              )
            })}
          </div>
          
          {/* Why Our Mission Matters - Enhanced */}
          <div className="max-w-5xl mx-auto mb-8 relative">
            {/* Section Background with Parallax */}
            <div className="absolute inset-0 opacity-5">
              <div 
                className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"
                style={{ transform: `translateY(${scrollY * 0.1}px)` }}
              ></div>
              <div 
                className="absolute top-1/2 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"
                style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
              ></div>
            </div>
            
            <div className="relative z-10">
              {/* Enhanced Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center mb-4">
                  <div className="h-px w-12 bg-primary-500"></div>
                  <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400 mx-3" />
                  <div className="h-px w-12 bg-primary-500"></div>
                </div>
                
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                  <span className="text-primary-600 dark:text-primary-400 inline-block">
                    {t('about.mission.whyMatters')}
                  </span>
                </h3>
                
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  {t('about.mission.whyMattersDesc')}
                </p>
              </div>
              
              {/* Main Cards Grid - Expanded to 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {[
                  {
                    icon: BoltIcon,
                    title: t('about.mission.driving'),
                    description: t('about.mission.drivingDesc'),
                    gradient: 'from-green-500 to-green-600',
                    bgGradient: 'from-white to-white',
                    darkBgGradient: 'from-gray-800 to-gray-800',
                    points: [
                      t('about.mission.drivingPoint1'),
                      t('about.mission.drivingPoint2'),
                      t('about.mission.drivingPoint3')
                    ],
                    delay: 'delay-300'
                  },
                  {
                    icon: HeartIcon,
                    title: t('about.mission.building'),
                    description: t('about.mission.buildingDesc'),
                    gradient: 'from-primary-500 to-primary-600',
                    bgGradient: 'from-white to-white',
                    darkBgGradient: 'from-gray-800 to-gray-800',
                    points: [
                      t('about.mission.buildingPoint1'),
                      t('about.mission.buildingPoint2'),
                      t('about.mission.buildingPoint3')
                    ],
                    delay: 'delay-500'
                  }
                ].map((card, index) => {
                  const IconComponent = card.icon
                  return (
                    <div
                      key={index}
                      className={`group bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200 relative overflow-hidden animate-in fade-in slide-in-from-bottom duration-1000 ${card.delay} hover:scale-[1.02]`}
                      style={{ 
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      {/* Animated Background Elements */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
                      
                      {/* Decorative Corner */}
                      <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br ${card.gradient} opacity-5 rounded-bl-full`}></div>
                      
                      <div className="relative z-10">
                        {/* Icon Container */}
                        <div className="mb-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-6 group-hover:scale-105 transition-transform duration-200 relative`}>
                            <IconComponent className="w-6 h-6 text-white relative z-10" />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                          {card.title}
                        </h4>
                        
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 text-xs">
                          {card.description}
                        </p>
                        
                        {/* Key Points */}
                        <div className="space-y-1.5">
                          {card.points.map((point, pointIndex) => (
                            <div 
                              key={pointIndex}
                              className="flex items-start gap-2 group-hover:translate-x-2 transition-transform duration-300"
                              style={{ transitionDelay: `${pointIndex * 100}ms` }}
                            >
                              <div className={`w-1 h-1 rounded-full bg-gradient-to-br ${card.gradient} mt-1.5 flex-shrink-0 group-hover:scale-150 transition-transform duration-300`}></div>
                              <span className="text-[10px] text-gray-600 dark:text-gray-300 font-medium">
                                {point}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          {/* Mission Promise */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200 group overflow-hidden">
              {/* Subtle Background Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Decorative Background Elements */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
              </div>
              
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-lg mb-3 shadow-md">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {t('about.mission.promise')}
                </h3>
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl mx-auto mb-4">
                  {t('about.mission.promiseDesc')}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  {[
                    { text: t('about.mission.promise.quality'), icon: CheckCircleIcon },
                    { text: t('about.mission.promise.expert'), icon: '/icons/lightning_8650967.svg' },
                    { text: t('about.mission.promise.satisfaction'), icon: HeartIcon }
                  ].map((promise, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 hover:scale-105 transition-all duration-300 shadow-md group/promise">
                      <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover/promise:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                      <div className="relative z-10">
                        <div className="mb-1.5 flex items-center justify-center">
                          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-md">
                            {typeof promise.icon === 'string' ? (
                              <Image src={promise.icon} alt={promise.text} width={16} height={16} className="w-4 h-4 brightness-0 invert" />
                            ) : (
                              <promise.icon className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="font-semibold text-xs text-gray-900 dark:text-white">{promise.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="mt-20 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/products"
                className="group inline-flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                <span className="relative z-10 flex items-center gap-2">
                  {t('about.mission.cta.exploreProducts')}
                  <ArrowRightIcon className={`w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </span>
              </Link>
              
              <Link
                href="/contacts"
                prefetch={true}
                className={`group inline-flex items-center justify-center gap-3 border-2 border-primary-600 hover:bg-primary-600 text-primary-600 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm bg-white/50 dark:bg-gray-800 dark:bg-opacity-90 relative z-20 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                style={{ position: 'relative', zIndex: 20 }}
              >
                <span>{t('about.mission.cta.getInTouch')}</span>
                <CheckCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Company Values Section */}
      <section id="values" className="py-8 lg:py-10 bg-white dark:bg-gray-900 relative">
        <div className="hidden"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-700 shadow-sm">
              {t('about.values.title')}
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-4 text-primary-600 dark:text-primary-400">
              {t('about.values.title')}
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t('about.values.subtitle')}
            </p>
          </div>
          
          {/* Enhanced Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {[
              {
                icon: '🎯',
                title: t('about.values.excellence.title'),
                description: t('about.values.excellence.desc'),
                gradient: 'from-primary-500 to-primary-600',
                bgGradient: 'from-white to-white',
                darkBgGradient: 'from-gray-800 to-gray-800',
                principles: [
                  t('about.values.principles.excellence1'),
                  t('about.values.principles.excellence2'),
                  t('about.values.principles.excellence3')
                ],
                delay: 'delay-300'
              },
              {
                icon: '🤝',
                title: t('about.values.integrity.title'),
                description: t('about.values.integrity.desc'),
                gradient: 'from-green-500 to-green-600',
                bgGradient: 'from-white to-white',
                darkBgGradient: 'from-gray-800 to-gray-800',
                principles: [
                  t('about.values.principles.integrity1'),
                  t('about.values.principles.integrity2'),
                  t('about.values.principles.integrity3')
                ],
                delay: 'delay-500'
              },
              {
                icon: '🚀',
                title: t('about.values.innovation.title'),
                description: t('about.values.innovation.desc'),
                gradient: 'from-primary-500 to-primary-600',
                bgGradient: 'from-white to-white',
                darkBgGradient: 'from-gray-800 to-gray-800',
                principles: [
                  t('about.values.principles.innovation1'),
                  t('about.values.principles.innovation2'),
                  t('about.values.principles.innovation3')
                ],
                delay: 'delay-700'
              },
              {
                icon: '👥',
                title: t('about.values.collaboration.title'),
                description: t('about.values.collaboration.desc'),
                gradient: 'from-green-500 to-green-600',
                bgGradient: 'from-white to-white',
                darkBgGradient: 'from-gray-800 to-gray-800',
                principles: [
                  t('about.values.principles.collaboration1'),
                  t('about.values.principles.collaboration2'),
                  t('about.values.principles.collaboration3')
                ],
                delay: 'delay-900'
              }
            ].map((value, index) => (
              <div
                key={index}
                className={`group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 transition-shadow duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] relative overflow-hidden animate-in fade-in slide-in-from-bottom duration-1000 ${value.delay}`}
                style={{ 
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden'
                }}
              >
                {/* Animated Background Elements */}
                <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
                
                {/* Decorative Corner */}
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${value.gradient} opacity-5 rounded-bl-full`}></div>
                
                <div className="relative z-10 text-center">
                  {/* Enhanced Icon Container */}
                  <div className="mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:rotate-6 group-hover:scale-105 transition-transform duration-200 relative`}>
                      <span className="text-3xl relative z-10">{value.icon}</span>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white transition-colors duration-300">
                    {value.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-xs">
                    {value.description}
                  </p>
                  
                  {/* Key Principles */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <div className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                      {t('about.values.principles')}
                    </div>
                    <div className="space-y-1.5">
                      {value.principles.map((principle, pIndex) => (
                        <div 
                          key={pIndex}
                          className="flex items-center justify-center gap-1.5 group-hover:translate-x-1 transition-transform duration-300"
                          style={{ transitionDelay: `${pIndex * 100}ms` }}
                        >
                          <div className={`w-1 h-1 rounded-full bg-gradient-to-br ${value.gradient} flex-shrink-0 group-hover:scale-150 transition-transform duration-300`}></div>
                          <span className="text-[10px] text-gray-600 dark:text-gray-300 font-medium">
                            {principle}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </section>
    </div>
  )
}


