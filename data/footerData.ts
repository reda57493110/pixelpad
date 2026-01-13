import { CompanyInfo, FooterSection, SocialMediaLink } from '@/types'

export const companyInfo: CompanyInfo = {
  name: 'PIXEL PAD',
  description: 'Your trusted partner for computers, laptops, and tech accessories.',
  socialMedia: [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/profile.php?id=61558615438246',
      icon: 'facebook',
      ariaLabel: 'Follow us on Facebook'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/pixel.pad77?igsh=NWlubzJhMmszOTY4',
      icon: 'instagram',
      ariaLabel: 'Follow us on Instagram'
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@pixel.pad1',
      icon: 'tiktok',
      ariaLabel: 'Follow us on TikTok'
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me/212779318061',
      icon: 'whatsapp',
      ariaLabel: 'Contact us on WhatsApp'
    }
  ],
  contact: {
    phone: '+212779318061',
    email: 'pixelpad77@gmail.com',
    address: 'Morocco',
    workingHours: 'Mon-Fri: 9AM-6PM'
  }
}

export const footerSections: FooterSection[] = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Products', href: '/products' },
      { label: 'About', href: '/more/about' },
      { label: 'Contact', href: '/contacts' }
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Warranty', href: '/more/warranty' },
      { label: 'Return Policy', href: '/more/return' },
      { label: 'FAQ', href: '/more/faq' }
    ]
  }
]
