# Icon Style Guide for PixelPad Website

## Current Issues
- Icons use inconsistent colors (gray, purple, red, green mixed)
- Inconsistent sizing across pages
- Some icons have backgrounds, some don't
- No unified hover states
- Mixed icon styles (outline vs solid)

## Recommended Icon Color Scheme

### Primary Icons (Main Actions & Features)
- **Color**: `text-blue-600 dark:text-blue-400`
- **Background**: `bg-blue-600` (when needed)
- **Hover**: `hover:text-blue-700 dark:hover:text-blue-300`
- **Use for**: Navigation, main features, primary actions

### Secondary Icons (Supporting Elements)
- **Color**: `text-gray-600 dark:text-gray-400`
- **Background**: `bg-gray-100 dark:bg-gray-800` (when needed)
- **Hover**: `hover:text-blue-600 dark:hover:text-blue-400`
- **Use for**: Secondary actions, informational icons

### Success/Positive Icons
- **Color**: `text-green-600 dark:text-green-400`
- **Background**: `bg-green-600` (when needed)
- **Use for**: Checkmarks, success states, confirmations

### Error/Warning Icons
- **Color**: `text-red-600 dark:text-red-400`
- **Background**: `bg-red-600` (when needed)
- **Use for**: Delete actions, errors, warnings

### White Icons (On Colored Backgrounds)
- **Color**: `text-white`
- **Use for**: Icons on blue/gradient backgrounds

## Standard Icon Sizes

### Small Icons
- **Size**: `h-4 w-4` or `h-3.5 w-3.5`
- **Use for**: Inline text, form labels, small buttons

### Medium Icons
- **Size**: `h-5 w-5` or `h-6 w-6`
- **Use for**: Navigation, buttons, cards

### Large Icons
- **Size**: `h-8 w-8` or `h-10 w-10`
- **Use for**: Hero sections, feature highlights, empty states

### Extra Large Icons
- **Size**: `h-12 w-12` or `h-16 w-16`
- **Use for**: Landing page features, major CTAs

## Icon Container Styles

### With Background (Recommended for Feature Icons)
```tsx
<div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
  <IconComponent className="w-5 h-5 text-white" />
</div>
```

### Without Background (For Navigation)
```tsx
<IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
```

### Hover Effects
```tsx
// Scale on hover
className="group-hover:scale-110 transition-transform duration-300"

// Rotate on hover
className="group-hover:rotate-12 transition-transform duration-300"

// Color change on hover
className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
```

## Complete List of Icons Found Across Website

### Navigation Icons
- HomeIcon → `text-blue-600`
- ShoppingCartIcon → `text-blue-600`
- UserIcon → `text-blue-600`
- MagnifyingGlassIcon → `text-blue-600`
- Bars3Icon → `text-white` (mobile menu)
- XMarkIcon → `text-gray-600` (close buttons)
- ChevronDownIcon → `text-blue-600` (dropdowns)

### Feature Icons
- ShieldCheckIcon → `text-blue-600` (currently purple/green in some places)
- TruckIcon → `text-blue-600`
- CheckCircleIcon → `text-green-600` (keep green for success)
- ComputerDesktopIcon → `text-blue-600`
- WrenchScrewdriverIcon → `text-blue-600`
- PhoneIcon → `text-blue-600`
- EnvelopeIcon → `text-blue-600`
- MapPinIcon → `text-blue-600`
- ClockIcon → `text-blue-600`
- ChatBubbleLeftRightIcon → `text-blue-600`
- SparklesIcon → `text-blue-600`
- InformationCircleIcon → `text-blue-600`
- BoltIcon → `text-blue-600`
- FireIcon → `text-blue-600`
- GiftIcon → `text-blue-600`
- HeartIcon → `text-blue-600` (wishlist)
- StarIcon → `text-yellow-400` (ratings - keep yellow)
- StarIconSolid → `text-yellow-400` (ratings - keep yellow)

### Action Icons
- ArrowRightIcon → `text-blue-600` (currently gray in many places)
- ArrowLeftIcon → `text-blue-600`
- ArrowDownIcon → `text-blue-600`
- ArrowPathIcon → `text-blue-600` (refresh)
- ArrowRightOnRectangleIcon → `text-red-600` (keep red for logout)
- XMarkIcon → `text-gray-600` (keep gray for close)
- XCircleIcon → `text-red-600` (errors)
- CheckIcon → `text-green-600` (confirmations)
- PencilIcon → `text-blue-600` (edit)
- TrashIcon → `text-red-600` (delete)
- PlusIcon → `text-blue-600`
- MinusIcon → `text-blue-600`
- EyeIcon → `text-blue-600` (view)

### Form Icons
- UserIcon → `text-blue-600`
- LockClosedIcon → `text-blue-600`
- InformationCircleIcon → `text-blue-600`
- ExclamationTriangleIcon → `text-red-600` (warnings/errors)
- PaperAirplaneIcon → `text-blue-600` (send/submit)
- CalendarIcon → `text-blue-600`
- BuildingOfficeIcon → `text-blue-600`
- CameraIcon → `text-blue-600`
- UserPlusIcon → `text-blue-600` (register)

### Theme Icons
- SunIcon → `text-gray-700 dark:text-gray-300` (light mode)
- MoonIcon → `text-gray-700 dark:text-gray-300` (dark mode)

### Status Icons
- CheckBadgeIcon → `text-green-600` (verified/completed)
- ClipboardDocumentListIcon → `text-blue-600` (orders)
- CreditCardIcon → `text-blue-600` (payment)
- ShoppingBagIcon → `text-blue-600`
- TagIcon → `text-blue-600` (discounts/coupons)
- CurrencyDollarIcon → `text-blue-600` (pricing)
- QuestionMarkCircleIcon → `text-blue-600` (help/FAQ)

### SVG Image Icons (from /icons directory)
- `/icons/laptop_1615930.svg` - Laptops category
- `/icons/tv_17071795.svg` - Desktops category
- `/icons/monitor_14926519.svg` - Monitors category
- `/icons/keyboard_12496164.svg` - Accessories category
- `/icons/controller_3012068.svg` - Gaming category
- `/icons/shopping-bags_2377391.svg` - Products
- `/icons/star-gold-orange.svg` - Ratings/trust
- `/icons/users_176680.svg` - Customers/users
- `/icons/truck_3232882.svg` - Delivery
- `/icons/shield_15492815.svg` - Warranty/security
- `/icons/rocket_619175.svg` - Growth/launch
- `/icons/trophy_1576749.svg` - Achievement
- `/icons/package_610378.svg` - Products/packages
- `/icons/lightning_8650967.svg` - Speed/energy
- `/icons/fire_785116.svg` - Hot deals
- `/icons/target_17139056.svg` - Goals/targets
- `/icons/maintenance_2778802.svg` - Services
- `/icons/reshot-icon-phone-XVG9DMYSLJ.svg` - Phone service

### Inline SVG Icons (Custom)
- CheckCircle SVG (in warranty/return pages) → `text-blue-600`
- Document SVG (in return page) → `text-blue-600`
- Monitor SVG (in return page) → `text-blue-600`
- Code SVG (in return page) → `text-blue-600`
- Building SVG (in return page) → `text-blue-600`
- Tools SVG (in return page) → `text-blue-600`

### Social Media Icons
- Facebook (inline SVG) → `text-gray-400 hover:text-white`
- Instagram (inline SVG) → `text-gray-400 hover:text-white`
- WhatsApp (inline SVG) → `text-gray-400 hover:text-white`
- Twitter/LinkedIn (if used) → `text-gray-400 hover:text-white`

## Implementation Priority

1. **High Priority** (Most Visible):
   - Navigation bar icons
   - Home page feature icons
   - Landing page icons
   - Product page icons

2. **Medium Priority**:
   - Contact page icons
   - Services page icons
   - About page icons

3. **Low Priority**:
   - Account page icons
   - Admin page icons
   - Form icons

## Example Updated Icon Pattern

### Before:
```tsx
<ShieldCheckIcon className="h-5 w-5 text-purple-600" />
```

### After:
```tsx
<div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
  <ShieldCheckIcon className="w-5 h-5 text-white" />
</div>
```

## Files to Update (Complete List)

### High Priority (Most Visible)
1. `components/NavBar.tsx` - Navigation icons (30+ icons)
2. `app/page.tsx` - Home page icons (20+ icons)
3. `app/landing/page.tsx` - Landing page icons (15+ icons)
4. `app/products/page.tsx` - Product page icons (20+ icons)
5. `app/contacts/page.tsx` - Contact page icons (25+ icons)

### Medium Priority
6. `app/services/page.tsx` - Services page icons (15+ icons)
7. `app/about/page.tsx` - About page icons (20+ icons)
8. `app/shop/[id]/page.tsx` - Product detail page icons (10+ icons)
9. `components/ProductCard.tsx` - Product card icons (5+ icons)
10. `app/more/warranty/page.tsx` - Warranty page icons (10+ inline SVGs)
11. `app/more/return/page.tsx` - Return page icons (15+ inline SVGs)
12. `app/more/faq/page.tsx` - FAQ page icons (minimal)

### Account Pages
13. `app/account/page.tsx` - Account dashboard icons
14. `app/account/orders/page.tsx` - Orders page icons (20+ icons)
15. `app/account/messages/page.tsx` - Messages page icons (10+ icons)
16. `app/account/service-requests/page.tsx` - Service requests icons (15+ icons)
17. `app/account/addresses/page.tsx` - Addresses page icons
18. `app/account/profile/page.tsx` - Profile page icons
19. `components/AccountLayout.tsx` - Account layout navigation icons

### Components
20. `components/LoginForm.tsx` - Login form icons
21. `components/RegisterForm.tsx` - Register form icons
22. `components/RefreshButton.tsx` - Refresh button icon
23. `components/QuickOrderModal.tsx` - Quick order modal icons
24. `components/Footer.tsx` - Footer icons
25. `components/icons/SocialIcons.tsx` - Social media icons

### Other Pages
26. `app/admin/page.tsx` - Admin page icons
27. `app/reset-password/page.tsx` - Reset password icons
28. `app/forgot-password/page.tsx` - Forgot password icons
29. `app/cart/page.tsx` - Cart page icons (if any)

## Total Icon Count
- **Heroicons**: ~150+ instances across all files
- **SVG Image Icons**: ~20+ different icon files
- **Inline SVG Icons**: ~30+ instances
- **Total**: ~200+ icon instances to update

