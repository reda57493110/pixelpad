// TypeScript interfaces for the e-commerce application

export interface Product {
  id: string;
  name: string;
  nameFr?: string;
  description: string;
  descriptionFr?: string;
  price: number;
  originalPrice?: number;
  deliveryPrice?: number; // Delivery/shipping price for this product
  costPrice?: number; // Cost/purchase price (what you paid to buy the product)
  category: string; // Category ID (ObjectId as string) or category name
  image: string;
  images?: string[]; // Multiple images for product gallery
  inStock: boolean;
  stockQuantity?: number; // Total quantity in stock
  soldQuantity?: number; // Total quantity sold
  rating?: number;
  reviews?: number;
  features?: string[];
  specifications?: Record<string, string>;
  badge?: string;
  badgeKey?: string; // Translation key for badge (e.g., 'products.badge.hotDeal')
  discount?: number;
  showOnHomeCarousel?: boolean; // Show on home page carousel
  showInHero?: boolean;
  showInNewArrivals?: boolean;
  showInBestSellers?: boolean;
  showInSpecialOffers?: boolean;
  showInTrending?: boolean;
  showOnProductPage?: boolean; // Show on product page (default: true if not set)
  order?: number; // Display order (lower numbers appear first)
  variants?: Array<{
    ram: string;
    storage: string;
    storageType: string;
    price: number;
    originalPrice?: number;
  }>;
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

export interface ServiceRequest {
  id: string;
  date: string;
  email?: string; // Added for MongoDB compatibility
  fullName: string;
  companyName?: string;
  city: string;
  emailOrPhone: string; // Keep for backward compatibility
  phone: string; // Required phone number
  numberOfComputers: string;
  needCameras: string;
  preferredDate?: string;
  additionalDetails?: string;
  status?: 'new' | 'in-progress' | 'completed' | 'cancelled';
  captchaCode?: string; // Captcha code for verification
}

export interface ContactMessage {
  id: string;
  date: string;
  email: string;
  name: string;
  phone?: string;
  inquiryType: string;
  subject: string;
  message: string;
  status?: 'new' | 'read' | 'replied';
}

export interface Order {
  id: string;
  date: string;
  email?: string; // Customer email - who placed the order
  items: OrderItem[];
  total: number;
  status: 'processing' | 'shipped' | 'completed' | 'cancelled' | 'returned' | 'refunded';
  customerName?: string;
  customerPhone?: string;
  city?: string;
  paymentSessionId?: string;
  paymentMethod?: 'cash' | 'card' | 'mobile';
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'cancelled';
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  type: 'percent' | 'fixed';
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount?: number;
  isActive: boolean;
  description?: string;
}




