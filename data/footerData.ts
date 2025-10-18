import { CompanyInfo, FooterSection, SocialMediaLink } from '@/types'

export const companyInfo: CompanyInfo = {
  name: 'PIXEL PAD',
  description: 'Your trusted partner for premium computers, laptops, and tech accessories.',
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
    }
  ],
  contact: {
    phone: '+212 779 318 061',
    email: 'pixelpad77@gmail.com',
    address: 'Morocco',
    workingHours: 'Mon-Fri: 9AM-6PM'
  }
}

export const footerSections: FooterSection[] = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Shop', href: '/shop' },
      { label: 'About', href: '/about' },
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
