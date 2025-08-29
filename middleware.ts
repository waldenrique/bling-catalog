import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('Middleware executando para:', request.nextUrl.pathname);

  // ✅ SISTEMA AGORA USA TOKENS ADMIN PERMANENTES
  // O middleware apenas permite acesso às rotas públicas e admin
  
  const pathname = request.nextUrl.pathname;

  // Permitir todas as rotas (sistema agora usa tokens admin internamente)
  // Rotas admin para configuração
  if (pathname.startsWith('/admin-')) {
    console.log('✅ Acesso à rota admin permitido');
    return NextResponse.next();
  }

  // API routes (produtos usam tokens admin internamente)
  if (pathname.startsWith('/api/')) {
    console.log('✅ Acesso à API permitido');
    return NextResponse.next();
  }

  // Páginas públicas (catálogo não requer autenticação do usuário)
  console.log('✅ Acesso à página pública permitido');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
