// next.config.js - Add/Update this file in your project root
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Allow framing from same origin
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'", // Allow embedding in same origin
          },
        ],
      },
      {
        // Specific headers for uploads
        source: '/uploads/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // Allow framing for uploads
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Allow CORS for development
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ];
  },
  
  // Development server configuration
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      return [
        {
          source: '/uploads/:path*',
          destination: '/api/files/:path*',
        },
      ];
    },
  }),
};

module.exports = nextConfig;