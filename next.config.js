/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimize image loading
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Basic webpack optimizations
  webpack: (config, { dev }) => {
    // Optimize for development
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
      
      // Fix for mobile network access
      config.output = {
        ...config.output,
        publicPath: '/_next/',
      }
    }
    
    return config
  },
  
  // Basic performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Fix for mobile network access
  experimental: {
    esmExternals: false,
  },
  
  // Development server configuration
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
}

module.exports = nextConfig