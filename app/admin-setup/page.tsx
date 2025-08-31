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

    // Conforme documentação oficial do Bling:
    // redirect_uri e scope são OPCIONAIS, pois usam valores do cadastro do app
    const state = Math.random().toString(36).substring(2, 15); // Estado único para segurança
    
    // Parâmetros mínimos conforme documentação Bling
    const params = new URLSearchParams({
      response_type: 'code',        // REQUIRED
      client_id: clientId,          // REQUIRED  
      state: state                  // RECOMMENDED para CSRF protection
    });
    
    // URL de autorização conforme documentação oficial
    const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?${params.toString()}`;
    
    // Salvar state para validação posterior
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bling_oauth_state', state);
    }
    
    // Debug info
    console.log('🔧 Setup Admin - OAuth Bling (Documentação Oficial):');
    console.log('✓ Response Type:', 'code');
    console.log('✓ Client ID:', clientId);
    console.log('✓ State:', state);
    console.log('✓ Auth URL:', authUrl);
    console.log('📝 Redirect URI será o cadastrado no app Bling');
    
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
          
          <div className="bg-blue-50 p-3 rounded text-sm space-y-2">
            <strong>🔧 Configuração necessária no Bling:</strong>
            <div>1. Acesse seu app em: <a href="https://bling.com.br/cadastro.aplicativos.php" target="_blank" className="text-blue-600 underline">Cadastro de Aplicativos</a></div>
            <div>2. Configure o Redirect URI como:</div>
            <div className="ml-4">
              <strong>Produção:</strong> <code className="bg-gray-200 px-1 rounded">https://bling-chi.vercel.app/admin-callback</code><br/>
              <strong>Desenvolvimento:</strong> <code className="bg-gray-200 px-1 rounded">http://localhost:3000/admin-callback</code>
            </div>
            <div>3. Salve as alterações no aplicativo</div>
            <div className="text-orange-600">⚠️ O redirect URI deve ser EXATAMENTE igual ao configurado no Bling!</div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded text-sm">
            <strong>Debug Info:</strong>
            <br />• Client ID: {process.env.NEXT_PUBLIC_BLING_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado'}
            <br />• URL Base: {typeof window !== 'undefined' ? window.location.origin : 'Carregando...'}
            <br />• Redirect necessário: https://bling-chi.vercel.app/admin-callback
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
