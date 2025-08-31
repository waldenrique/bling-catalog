import { NextResponse } from 'next/server';
import { getValidAdminTokens } from '@/lib/admin-tokens';

export async function GET() {
  try {
    const authState = {
      hasTokens: false,
      tokensExpired: true,
      tokenRefreshed: false,
      error: null
    };
    
    try {
      // Tentar obter tokens válidos
      const tokens = await getValidAdminTokens();
      authState.hasTokens = !!tokens;
      authState.tokensExpired = !tokens?.access_token;
      authState.tokenRefreshed = !!tokens?.refreshed;
    } catch (error: any) {
      authState.error = error.message || 'Erro desconhecido ao obter tokens';
    }
    
    return NextResponse.json({
      authState,
      timestamp: new Date().toISOString(),
      env: {
        isProduction: process.env.NODE_ENV === 'production',
        vercel: !!process.env.VERCEL
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Erro ao verificar estado de autenticação',
      message: error.message
    }, { status: 500 });
  }
}
