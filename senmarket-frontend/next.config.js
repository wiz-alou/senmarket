/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      'api.senmarket.sn',
      'senmarket.sn',
    ],
  },

  rewrites: async () => {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:8080/api/v1/:path*'
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:8080/uploads/:path*'
      }
    ]
  },
}

module.exports = nextConfig
