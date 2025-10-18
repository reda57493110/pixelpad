import { Product } from '@/types'
import ProductCard from '@/components/ProductCard'

// Sample products data
const products: Product[] = [
  {
    id: '1',
    name: 'MacBook Pro 16" M3 Max',
    description: 'Powerful laptop with M3 Max chip, perfect for professionals and creators.',
    price: 2499,
    originalPrice: 2799,
    category: 'laptop',
    image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=MacBook+Pro',
    inStock: true,
    rating: 4.8,
    reviews: 124,
    features: ['M3 Max Chip', '32GB RAM', '1TB SSD', '16-inch Retina Display']
  },
  {
    id: '2',
    name: 'Dell XPS 13',
    description: 'Ultra-portable laptop with stunning 13.4-inch display and all-day battery life.',
    price: 1299,
    category: 'laptop',
    image: 'https://via.placeholder.com/300x200/059669/FFFFFF?text=Dell+XPS',
    inStock: true,
    rating: 4.6,
    reviews: 89,
    features: ['Intel i7', '16GB RAM', '512GB SSD', '13.4-inch 4K Display']
  },
  {
    id: '3',
    name: 'ASUS ROG Gaming Monitor',
    description: '27-inch 4K gaming monitor with 144Hz refresh rate and HDR support.',
    price: 599,
    category: 'monitor',
    image: 'https://via.placeholder.com/300x200/DC2626/FFFFFF?text=ASUS+Monitor',
    inStock: true,
    rating: 4.7,
    reviews: 156,
    features: ['27-inch 4K', '144Hz', 'HDR', 'G-Sync Compatible']
  },
  {
    id: '4',
    name: 'Logitech MX Master 3S',
    description: 'Premium wireless mouse with precision tracking and ergonomic design.',
    price: 99,
    category: 'mouse',
    image: 'https://via.placeholder.com/300x200/7C3AED/FFFFFF?text=Logitech+Mouse',
    inStock: true,
    rating: 4.9,
    reviews: 203,
    features: ['Wireless', 'Precision Tracking', 'Ergonomic', 'Multi-device']
  },
  {
    id: '5',
    name: 'Keychron K8 Pro',
    description: 'Mechanical keyboard with hot-swappable switches and RGB backlighting.',
    price: 149,
    category: 'keyboard',
    image: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Keychron+K8',
    inStock: true,
    rating: 4.5,
    reviews: 78,
    features: ['Mechanical', 'Hot-swappable', 'RGB', 'Wireless']
  },
  {
    id: '6',
    name: 'HP Pavilion Desktop',
    description: 'Powerful desktop computer perfect for home office and gaming.',
    price: 899,
    category: 'desktop',
    image: 'https://via.placeholder.com/300x200/EF4444/FFFFFF?text=HP+Desktop',
    inStock: false,
    rating: 4.3,
    reviews: 45,
    features: ['Intel i5', '16GB RAM', '512GB SSD', 'Windows 11']
  }
]

const categories = [
  { id: 'all', name: 'All Products', count: products.length },
  { id: 'laptop', name: 'Laptops', count: products.filter(p => p.category === 'laptop').length },
  { id: 'desktop', name: 'Desktops', count: products.filter(p => p.category === 'desktop').length },
  { id: 'monitor', name: 'Monitors', count: products.filter(p => p.category === 'monitor').length },
  { id: 'keyboard', name: 'Keyboards', count: products.filter(p => p.category === 'keyboard').length },
  { id: 'mouse', name: 'Mice', count: products.filter(p => p.category === 'mouse').length },
]

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shop</h1>
          <p className="text-lg text-gray-600">Discover our complete range of computers and accessories</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex justify-between items-center"
                  >
                    <span className="text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Price Range</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-700">Under $500</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-700">$500 - $1000</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-700">$1000 - $2000</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-700">Over $2000</span>
                  </label>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Availability</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-gray-700">In Stock</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-700">Out of Stock</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Sort and View Options */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Sort by:</span>
                <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                  <option>Newest</option>
                </select>
              </div>
              <div className="text-gray-600">
                Showing {products.length} products
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <nav className="flex space-x-2">
                <button className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-2 bg-primary-600 text-white border border-primary-600 rounded-lg">
                  1
                </button>
                <button className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  3
                </button>
                <button className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



