'use client';

import { useState } from 'react';

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAdminLogin = () => {
    setIsLoading(true);
    
    const clientId = process.env.NEXT_PUBLIC_BLING_CLIENT_ID;
    if (!clientId) {
      setMessage('❌ Client ID não configurado');
      setIsLoading(false);
      return;
    }

    const baseUrl = window.location.origin;
    const redirectUri = encodeURIComponent(`${baseUrl}/admin-callback`);
    const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&state=admin-setup&redirect_uri=${redirectUri}`;
    
    console.log('🔧 Setup Admin - Redirecionando para Bling');
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          🔧 Setup Administrativo
        </h1>
        
        <div className="space-y-4 text-gray-600 mb-6">
          <p>✅ Esta página é para configuração inicial do administrador</p>
          <p>🔐 Faça login UMA VEZ para configurar os tokens permanentes</p>
          <p>👥 Depois disso, usuários comuns acessarão direto o catálogo</p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {message}
          </div>
        )}

        <button
          onClick={handleAdminLogin}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? '🔄 Configurando...' : '🔐 Configurar Tokens Admin'}
        </button>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>⚠️ Apenas administradores devem acessar esta página</p>
        </div>
      </div>
    </div>
  );
}
