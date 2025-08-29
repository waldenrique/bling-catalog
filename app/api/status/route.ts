import { NextResponse } from 'next/server'
import { getAdminTokensStatus } from '@/lib/admin-tokens'
import { getCacheInfo } from '@/lib/cache'

export async function GET() {
  try {
    const tokensStatus = getAdminTokensStatus()
    const cacheInfo = getCacheInfo()

    return NextResponse.json({
      tokens: tokensStatus,
      cache: cacheInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro ao obter status:', error)
    return NextResponse.json({ 
      error: 'Erro ao obter status do sistema',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
