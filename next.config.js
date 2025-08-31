/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações para produção
  compress: true,
  poweredByHeader: false,
  
  // Desabilitar verificações durante build (para deploy rápido)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Headers para cache
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
