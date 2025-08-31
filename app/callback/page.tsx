'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      console.log('Callback recebido:', { code, state });

      if (!code) {
        console.error('Código não recebido');
        router.push('/login');
        return;
      }

      try {
        console.log('Attempting to exchange code for token...');
        const response = await fetch('/api/auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const responseData = await response.json();
        console.log('Token exchange response status:', response.status);
        
        if (!response.ok) {
          console.error('Token exchange failed:', responseData);
          throw new Error(`Failed to get token: ${JSON.stringify(responseData)}`);
        }

        console.log('Token exchange successful, redirecting to home page...');
        
        // Armazena um flag indicando login bem-sucedido
        sessionStorage.setItem('login_successful', 'true');
        
        // Espera um momento para permitir que os cookies sejam definidos
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Usa window.location em vez de router.push para forçar um refresh completo da página
        window.location.href = '/';
      } catch (error) {
        console.error('Error exchanging code for token:', error);
        router.push('/error');
      }
    }

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
}
