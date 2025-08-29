'use client';

import { useState } from 'react';

export default function TestePage() {
  const [result, setResult] = useState<string>('');

  const testBlingAuth = () => {
    const clientId = '1e61dfee4219e92860965ecb57aba780e5872272'; // Seu client ID
    const redirectUri = `${window.location.origin}/admin-callback`;
    
    const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&state=test&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    setResult(`Redirecionando para: ${authUrl}`);
    
    console.log('URL gerada:', authUrl);
    console.log('Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);
    
    // Aguardar 2 segundos e redirecionar
    setTimeout(() => {
      window.location.href = authUrl;
    }, 2000);
  };

  const checkEnvironment = () => {
    const info = {
      origin: window.location.origin,
      clientId: process.env.NEXT_PUBLIC_BLING_CLIENT_ID,
      nodeEnv: process.env.NODE_ENV,
      currentUrl: window.location.href
    };
    
    setResult(JSON.stringify(info, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">🧪 Teste de Conexão Bling</h1>
        
        <div className="space-y-4">
          <button 
            onClick={checkEnvironment}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Verificar Ambiente
          </button>
          
          <button 
            onClick={testBlingAuth}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Testar Autenticação Bling
          </button>
          
          {result && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Resultado:</h3>
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">{result}</pre>
            </div>
          )}
          
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              ℹ️ Se o teste de ambiente mostrar os dados corretos e o botão de autenticação redirecionar para o Bling, então a configuração está correta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
