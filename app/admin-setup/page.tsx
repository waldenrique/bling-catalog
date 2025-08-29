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

    // Construir URL de acordo com OAuth 2.0 spec (RFC 6749)
    const baseUrl = 'https://bling-chi.vercel.app'; // URL de produção
    const redirectUri = `${baseUrl}/admin-callback`;
    const state = 'admin-setup';
    
    // Parâmetros obrigatórios do OAuth 2.0 Authorization Code Grant
    const params = new URLSearchParams({
      response_type: 'code',        // REQUIRED
      client_id: clientId,          // REQUIRED  
      redirect_uri: redirectUri,    // REQUIRED se não registrado
      state: state,                 // RECOMMENDED
      scope: 'read write'           // OPTIONAL - escopo para API Bling
    });
    
    const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?${params.toString()}`;
    
    // Debug info
    console.log('🔧 Setup Admin - Informações OAuth 2.0:');
    console.log('✓ Response Type:', 'code');
    console.log('✓ Client ID:', clientId);
    console.log('✓ Redirect URI:', redirectUri);
    console.log('✓ State:', state);
    console.log('✓ Scope:', 'read write');
    console.log('✓ Auth URL:', authUrl);
    
    setMessage(`🔄 Redirecionando para Bling OAuth...`);
    
    // Redirecionar para autorização
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
