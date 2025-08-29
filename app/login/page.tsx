'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_BLING_CLIENT_ID;

  // Detectar URL base (local ou produção)
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  };

  // Verificar se já está autenticado (simplificado - atualizado)
  useEffect(() => {
    // Se tiver tokens no localStorage, redirecionar
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('bling_access_token');
      if (accessToken) {
        router.push('/');
      }
    }
  }, [router]);
  
  const handleLogin = () => {
    if (!clientId) {
      alert('Erro: Client ID não configurado. Verifique as variáveis de ambiente.');
      return;
    }

    const baseUrl = getBaseUrl();
    const redirectUri = encodeURIComponent(`${baseUrl}/callback`);
    const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&state=xpto&redirect_uri=${redirectUri}`;
    
    console.log('Client ID:', clientId);
    console.log('Base URL:', baseUrl);
    console.log('Redirect URI:', `${baseUrl}/callback`);
    console.log('Auth URL:', authUrl);
    
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Conectar com Bling
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Clique no botão abaixo para autorizar o acesso à sua conta Bling
          </p>
        </div>
        <div>
          <button
            onClick={handleLogin}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Conectar com Bling
          </button>
        </div>
      </div>
    </div>
  );
}
