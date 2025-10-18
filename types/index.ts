// TypeScript interfaces for the e-commerce application

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'laptop' | 'desktop' | 'monitor' | 'keyboard' | 'mouse' | 'accessory' | 'laptops' | 'desktops' | 'monitors' | 'accessories' | 'gaming';
  image: string;
  inStock: boolean;
  rating?: number;
  reviews?: number;
  features?: string[];
  specifications?: Record<string, string>;
  badge?: string;
}

export interface NavigationLink {
  id: string;
  label: string;
  href: string;
  isDropdown?: boolean;
  children?: NavigationLink[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface SocialMediaLink {
  name: string;
  url: string;
  icon: string;
  ariaLabel: string;
}

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
}

export interface CompanyInfo {
  name: string;
  description: string;
  socialMedia: SocialMediaLink[];
  contact: ContactInfo;
}




