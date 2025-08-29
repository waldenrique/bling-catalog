/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      // Configurações do Turbopack para produção
    }
  },
  // Otimizações para produção
  compress: true,
  poweredByHeader: false,
  
  // Configuração para o cache de produtos
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
  },

  // Configuração para variáveis de ambiente
  env: {
    NEXT_PUBLIC_BLING_CLIENT_ID: process.env.NEXT_PUBLIC_BLING_CLIENT_ID,
    BLING_CLIENT_SECRET: process.env.BLING_CLIENT_SECRET,
  }
}

module.exports = nextConfig
