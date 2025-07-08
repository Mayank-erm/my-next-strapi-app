// next.config.ts - FIXED VERSION (No Critters dependency)
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance optimizations
  optimizeFonts: true,
  compress: true,
  
  // Image optimization
  images: {
    domains: ['localhost', '127.0.0.1'], // Add your Strapi domain here
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Static file serving configuration
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/files/:path*', // Proxy to API route for file serving
      },
    ];
  },
  
  // Headers for better performance and security
  async headers() {
    return [
      {
        // Cache uploaded files for 1 year
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        // Security headers for all pages
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Environment variables (optional)
  env: {
    UPLOAD_BASE_PATH: process.env.UPLOAD_BASE_PATH || 'C:\\Users\\mayank.kumar\\OneDrive - ERM\\Documents\\Workspace\\cms-strapi-app\\public\\uploads',
  },
  
  // REMOVED: Experimental features that cause issues
  // experimental: {
  //   optimizeCss: true, // This requires critters package
  //   scrollRestoration: true,
  // },
  
  // Webpack optimizations (safe version)
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size in production
    if (!dev && !isServer) {
      // Basic optimization without breaking changes
      if (config.optimization) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        };
      }
    }
    
    return config;
  },
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    output: 'standalone', // Better for deployment
    poweredByHeader: false, // Remove X-Powered-By header
  }),
};

export default nextConfig;