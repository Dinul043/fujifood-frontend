import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode for better error catching
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.fujifood.com',
        pathname: '/**',
      },
      // AWS S3
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
    // Responsive image sizes
    deviceSizes: [320, 375, 425, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 64, 96, 128, 256],
  },

  // Compression
  compress: true,

  // Power headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/fonts/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
