'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface TokensStatus {
  configured: boolean
  created_at?: string
  last_refresh?: string
  expires_in_minutes?: number
  is_expired?: boolean
  error?: any
}

interface CacheInfo {
  exists: boolean
  lastUpdate?: string
  productCount?: number
  minutesAgo?: number
  isExpired?: boolean
}

interface SystemStatus {
  tokens: TokensStatus
  cache: CacheInfo
  timestamp: string
}

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ Erro ao carregar status: {error}</p>
          <button 
            onClick={fetchStatus}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!status) return null

  const tokensStatus = status.tokens
  const cacheInfo = status.cache

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Status do Sistema</h1>
          <div className="space-x-2">
            <button
              onClick={fetchStatus}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              🔄 Atualizar
            </button>
            <span className="text-xs text-gray-500">
              Última atualização: {new Date(status.timestamp).toLocaleTimeString('pt-BR')}
            </span>
          </div>
        </div>
        
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
                <p><strong>Criado em:</strong> {tokensStatus.created_at ? new Date(tokensStatus.created_at).toLocaleString('pt-BR') : 'N/A'}</p>
                <p><strong>Última atualização:</strong> {tokensStatus.last_refresh ? new Date(tokensStatus.last_refresh).toLocaleString('pt-BR') : 'N/A'}</p>
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
                <p><strong>Última atualização:</strong> {cacheInfo.lastUpdate ? new Date(cacheInfo.lastUpdate).toLocaleString('pt-BR') : 'N/A'}</p>
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
