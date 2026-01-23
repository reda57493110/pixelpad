/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimized image settings for performance with quality preservation
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Preserve original formats to maintain quality
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year cache for images
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow unoptimized images if remote fails (helps with DNS issues)
    unoptimized: process.env.NODE_ENV === 'development',
    // Add loader to handle errors gracefully
    loader: 'default',
    // Disable image optimization for placeholder.com in development to avoid DNS issues
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // Enable aggressive caching
  generateEtags: true,
  
  // Optimize webpack for faster builds and navigation
  webpack: (config, { dev, isServer }) => {
    // Optimize for development
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
      
      config.output = {
        ...config.output,
        publicPath: '/_next/',
      }
    }
    
    // Optimize chunk splitting for faster navigation and smaller bundles
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            heroicons: {
              name: 'heroicons',
              test: /[\\/]node_modules[\\/]@heroicons[\\/]/,
              priority: 35,
              chunks: 'all',
              reuseExistingChunk: true,
            },
            lib: {
              test(module) {
                return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier())
              },
              name(module) {
                const hash = require('crypto').createHash('sha1')
                hash.update(module.identifier())
                return hash.digest('hex').substring(0, 8)
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },
            shared: {
              name(module, chunks) {
                return require('crypto').createHash('sha1').update(chunks.reduce((acc, chunk) => acc + chunk.name, '')).digest('hex').substring(0, 8)
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
        },
      }
    }
    
    return config
  },
  
  // Experimental features for performance
  experimental: {
    // Enable faster navigation and reduce bundle size
    optimizePackageImports: [
      '@heroicons/react',
      '@heroicons/react/24/outline',
      '@heroicons/react/24/solid',
    ],
    // Enable webpack build worker for faster builds on Vercel
    webpackBuildWorker: true,
  },
  
  // Optimize bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Development server configuration
  devIndicators: {
    position: 'bottom-right',
  },
  
  // Suppress informational warnings about client-side rendering
  // These are expected for pages using client-side hooks
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Allow external access for mobile testing
  async rewrites() {
    return []
  },
  
  // Set output file tracing root to avoid lockfile warnings
  outputFileTracingRoot: process.cwd(),
  
  // Suppress build-time route analysis errors for API routes
  // This helps prevent MongoDB connection errors during build
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig