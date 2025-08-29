'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('🔄 Processando...');

  useEffect(() => {
    async function handleAdminCallback() {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        console.log('🔧 Admin Callback recebido:', { code, state });

        if (!code || state !== 'admin-setup') {
          setStatus('❌ Callback inválido');
          return;
        }

        setStatus('🔄 Salvando tokens permanentes...');

        // Chamar API para salvar tokens permanentemente
        const response = await fetch('/api/admin/setup-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setStatus('✅ Tokens configurados com sucesso!');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setStatus(`❌ Erro: ${result.error}`);
        }

      } catch (error) {
        console.error('Erro no callback admin:', error);
        setStatus(`❌ Erro: ${error}`);
      }
    }

    handleAdminCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          🔧 Configuração Admin
        </h1>
        
        <div className="text-lg mb-6">
          {status}
        </div>

        {status.includes('✅') && (
          <div className="text-green-600 text-sm">
            Redirecionando para o catálogo...
          </div>
        )}

        {status.includes('❌') && (
          <button
            onClick={() => router.push('/admin-setup')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            🔄 Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
}
