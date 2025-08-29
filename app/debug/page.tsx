'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<any>({});
  const [adminTokensStatus, setAdminTokensStatus] = useState<any>({});
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Verificar variáveis de ambiente
    setEnvVars({
      clientId: process.env.NEXT_PUBLIC_BLING_CLIENT_ID,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      windowOrigin: typeof window !== 'undefined' ? window.location.origin : 'undefined'
    });

    // Testar APIs
    testAdminTokens();
  }, []);

  const testAdminTokens = async () => {
    try {
      const response = await fetch('/api/admin/setup-tokens');
      const data = await response.json();
      setAdminTokensStatus(data);
    } catch (error) {
      setAdminTokensStatus({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  };

  const testBlingConnection = async () => {
    setTestResult('Testando conexão com Bling...');
    
    const clientId = process.env.NEXT_PUBLIC_BLING_CLIENT_ID;
    const baseUrl = window.location.origin;
    const redirectUri = encodeURIComponent(`${baseUrl}/admin-callback`);
    const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&state=admin-setup&redirect_uri=${redirectUri}`;
    
    setTestResult(`URL gerada: ${authUrl}`);
    
    // Tentar redirecionar
    setTimeout(() => {
      window.location.href = authUrl;
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">🔍 Debug do Sistema</h1>
        
        {/* Variáveis de Ambiente */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Variáveis de Ambiente</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>

        {/* Status dos Tokens Admin */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔑 Status dos Tokens Admin</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(adminTokensStatus, null, 2)}
          </pre>
        </div>

        {/* Teste de Conexão */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Teste de Conexão</h2>
          
          <button 
            onClick={testBlingConnection}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
          >
            Testar Conexão com Bling
          </button>
          
          {testResult && (
            <div className="bg-yellow-100 p-4 rounded">
              <p className="text-sm font-mono">{testResult}</p>
            </div>
          )}
        </div>

        {/* Links Úteis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Links Úteis</h2>
          <div className="space-y-2">
            <a href="/admin-setup" className="block text-blue-600 hover:underline">
              → Admin Setup
            </a>
            <a href="/status" className="block text-blue-600 hover:underline">
              → Status do Sistema
            </a>
            <a href="/" className="block text-blue-600 hover:underline">
              → Catálogo Principal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
