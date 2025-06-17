/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  // === IMAGES ===
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.senmarket.sn',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // === REDIRECTIONS ===
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
      },
    ]
  },

  // === HEADERS DE SÉCURITÉ ===
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ]
      },
    ]
  },

  // === OPTIMISATIONS ===
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // === WEBPACK CONFIGURATION ===
  webpack: (config) => {
    // Alias pour les imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    }

    return config
  },

  // === VARIABLES D'ENVIRONNEMENT PUBLIQUES ===
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // === TYPESCRIPT ===
  typescript: {
    ignoreBuildErrors: false,
  },

  // === ESLINT ===
  eslint: {
    ignoreDuringBuilds: false,
  },

  // === AUTRES OPTIONS ===
  poweredByHeader: false,
  compress: true,
}

module.exports = nextConfig