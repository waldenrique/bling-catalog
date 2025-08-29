import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function refreshAccessToken(currentRefreshToken: string) {
  try {
    const clientId = process.env.BLING_CLIENT_ID;
    const clientSecret = process.env.BLING_CLIENT_SECRET;
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    console.log('Tentando renovar o token');

    const response = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: currentRefreshToken
      }).toString()
    });

    if (!response.ok) {
      console.error('Falha ao renovar token:', response.status);
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    console.log('Token renovado com sucesso');
    return data;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    throw error;
  }
}

export async function middleware(request: NextRequest) {
  console.log('Middleware executando para:', request.nextUrl.pathname);

  const tokens = {
    accessToken: request.cookies.get('access_token'),
    refreshToken: request.cookies.get('refresh_token')
  };

  console.log('Status da autenticação:', {
    hasAccessToken: !!tokens.accessToken,
    hasRefreshToken: !!tokens.refreshToken
  });

  // Ignorar rotas públicas
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/callback') || 
      request.nextUrl.pathname.startsWith('/error') ||
      request.nextUrl.pathname.startsWith('/api/auth') ||
      request.nextUrl.pathname.startsWith('/_next')) {
    console.log('Rota pública, pulando verificação');
    return NextResponse.next();
  }

  // Redirecionar para a página principal se tentar acessar login já estando autenticado
  if (request.nextUrl.pathname.startsWith('/login') && tokens.accessToken) {
    console.log('Usuário já autenticado tentando acessar login, redirecionando para home');
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!tokens.refreshToken) {
    console.log('Sem refresh token, redirecionando para login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se não tiver access_token ou ele estiver expirado, tentar renovar
  if (!tokens.accessToken) {
    console.log('Sem access token, tentando renovar');
    try {
      const newTokens = await refreshAccessToken(tokens.refreshToken.value);
      const response = NextResponse.next();

      response.cookies.set('access_token', newTokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: newTokens.expires_in
      });

      if (newTokens.refresh_token) {
        response.cookies.set('refresh_token', newTokens.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60 // 30 dias
        });
      }

      console.log('Tokens renovados com sucesso');
      return response;
    } catch (error) {
      console.error('Falha ao renovar tokens, redirecionando para login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|favicon.ico).*)',
};
