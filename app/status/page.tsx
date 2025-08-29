import { getAdminTokensStatus } from '@/lib/admin-tokens'
import { getCacheInfo } from '@/lib/cache'
import Link from 'next/link'

export default function StatusPage() {
  const tokensStatus = getAdminTokensStatus()
  const cacheInfo = getCacheInfo()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Status do Sistema</h1>
        
        {/* Status dos Tokens Admin */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔑 Tokens Admin</h2>
          
          {tokensStatus.configured ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-green-700 font-medium">Configurado</span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Criado em:</strong> {tokensStatus.created_at?.toLocaleString('pt-BR')}</p>
                <p><strong>Última atualização:</strong> {tokensStatus.last_refresh?.toLocaleString('pt-BR')}</p>
                <p><strong>Expira em:</strong> {tokensStatus.expires_in_minutes} minutos</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-1 px-2 py-1 rounded text-xs ${
                    tokensStatus.is_expired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {tokensStatus.is_expired ? 'Expirado (será renovado automaticamente)' : 'Válido'}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-red-700 font-medium">Não Configurado</span>
              </div>
              
              <p className="text-gray-600 text-sm">
                Os tokens admin não foram configurados. O sistema não poderá sincronizar produtos.
              </p>
              
              <Link 
                href="/admin-setup"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Configurar Tokens Admin
              </Link>
            </div>
          )}
        </div>

        {/* Status do Cache */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">💾 Cache de Produtos</h2>
          
          {cacheInfo.exists ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${cacheInfo.isExpired ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                <span className={`font-medium ${cacheInfo.isExpired ? 'text-orange-700' : 'text-green-700'}`}>
                  {cacheInfo.isExpired ? 'Expirado' : 'Válido'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Produtos em cache:</strong> {cacheInfo.productCount?.toLocaleString()}</p>
                <p><strong>Última atualização:</strong> {cacheInfo.lastUpdate?.toLocaleString('pt-BR')}</p>
                <p><strong>Há:</strong> {cacheInfo.minutesAgo} minutos</p>
              </div>
              
              {cacheInfo.isExpired && (
                <p className="text-orange-600 text-sm mt-2">
                  ⚠️ Cache expirado. Será atualizado automaticamente na próxima requisição.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                <span className="text-gray-700 font-medium">Sem Cache</span>
              </div>
              
              <p className="text-gray-600 text-sm">
                Nenhum cache de produtos encontrado. Será criado na primeira sincronização.
              </p>
            </div>
          )}
        </div>

        {/* Status Geral */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Status Geral</h2>
          
          <div className="space-y-3">
            {tokensStatus.configured && cacheInfo.exists && !cacheInfo.isExpired ? (
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-green-700 font-medium">Sistema Funcionando</span>
              </div>
            ) : tokensStatus.configured ? (
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                <span className="text-orange-700 font-medium">Sistema Configurado (aguardando sincronização)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-red-700 font-medium">Sistema Não Configurado</span>
              </div>
            )}
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>• <strong>Autenticação:</strong> Sistema usa tokens admin permanentes</p>
              <p>• <strong>Usuários:</strong> Podem acessar o catálogo sem login</p>
              <p>• <strong>Cache:</strong> Atualizado automaticamente a cada 30 minutos</p>
              <p>• <strong>Produtos:</strong> Apenas com estoque &gt; 0 são exibidos</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Voltar ao Catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}
