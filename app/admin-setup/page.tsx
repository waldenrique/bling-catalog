'use client';

import { useState } from 'react';

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAdminLogin = () => {
    setIsLoading(true);
    setMessage('🔄 Preparando redirecionamento...');
    
    const clientId = process.env.NEXT_PUBLIC_BLING_CLIENT_ID;
    if (!clientId) {
      setMessage('❌ Client ID não configurado');
      setIsLoading(false);
      return;
    }

    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/admin-callback`;
    const encodedRedirectUri = encodeURIComponent(redirectUri);
    const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&state=admin-setup&redirect_uri=${encodedRedirectUri}`;
    
    // Debug info
    console.log('🔧 Setup Admin - Informações de debug:');
    console.log('Client ID:', clientId);
    console.log('Base URL:', baseUrl);
    console.log('Redirect URI:', redirectUri);
    console.log('Encoded Redirect URI:', encodedRedirectUri);
    console.log('Auth URL completa:', authUrl);
    
    setMessage(`🔄 Redirecionando para Bling...`);
    
    // Tentar redirecionar
    try {
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erro no redirecionamento:', error);
      setMessage(`❌ Erro no redirecionamento: ${error}`);
      setIsLoading(false);
    }
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
          
          <div className="bg-blue-50 p-3 rounded text-sm">
            <strong>Debug Info:</strong>
            <br />• Client ID: {process.env.NEXT_PUBLIC_BLING_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado'}
            <br />• URL Base: {typeof window !== 'undefined' ? window.location.origin : 'Carregando...'}
          </div>
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
