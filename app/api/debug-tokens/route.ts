import { NextResponse } from 'next/server'
import { hasAdminTokens, getValidAdminTokens, getAdminTokensStatus } from '@/lib/admin-tokens'

export async function GET() {
  try {
    console.log('🔍 DEBUG: Verificando tokens admin...')
    
    const hasTokens = hasAdminTokens()
    console.log('📁 Tokens existem:', hasTokens)
    
    const status = getAdminTokensStatus()
    console.log('📊 Status completo:', status)
    
    if (hasTokens) {
      const validToken = await getValidAdminTokens()
      console.log('🔑 Token válido:', validToken ? 'SIM' : 'NÃO')
    }
    
    return NextResponse.json({
      hasTokens,
      status,
      debug: {
        tokensDir: process.env.VERCEL ? '/tmp' : 'data',
        environment: process.env.VERCEL ? 'vercel' : 'local',
        clientId: process.env.NEXT_PUBLIC_BLING_CLIENT_ID ? 'configurado' : 'não configurado',
        clientSecret: process.env.BLING_CLIENT_SECRET ? 'configurado' : 'não configurado'
      }
    })

  } catch (error) {
    console.error('❌ Erro no debug:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
