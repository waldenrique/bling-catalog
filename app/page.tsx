'use client'

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

interface Product {
  sku: string
  nome: string
  preco: number
  estoque: number
  situacao?: string
}

interface OrderItem {
  sku: string
  nome: string
  quantidade: number
  preco: number
  total: number
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  useEffect(() => {
    fetchProducts(1, true) // Carregar primeira página
  }, [])

  // Carregar mais produtos quando chegar ao final
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      fetchProducts(page + 1, false)
    }
  }, [inView, hasMore, loading, loadingMore, page])

  const fetchProducts = async (pageNum: number, isFirstLoad: boolean = false) => {
    try {
      if (isFirstLoad) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      setError(null)
      
      const response = await fetch(`/api/products?page=${pageNum}&limit=50`)
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Sistema não configurado. Entre em contato com o administrador.')
          return
        }
        throw new Error('Erro ao carregar produtos')
      }
      
      const data = await response.json()
      console.log('Resposta da API:', data)
      
      // Verificar se a resposta tem a estrutura esperada
      if (!data.products && !Array.isArray(data)) {
        console.error('Estrutura de resposta inesperada:', data)
        throw new Error('Resposta da API em formato inválido')
      }
      
      // Se for array direto (formato antigo), converter para novo formato
      const products = Array.isArray(data) ? data : data.products
      const pagination = data.pagination || { hasMore: false }
      
      if (isFirstLoad) {
        setProducts(products)
      } else {
        setProducts(prev => {
          // Evitar duplicatas
          const newProducts = products.filter((newProduct: Product) => 
            !prev.some(existingProduct => existingProduct.sku === newProduct.sku)
          )
          return [...prev, ...newProducts]
        })
      }
      
      setPage(pageNum)
      setHasMore(pagination.hasMore)
      
      console.log(`Página ${pageNum} carregada: ${products.length} produtos`)
      
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Erro ao carregar produtos. Tente novamente.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleQuantityChange = (sku: string, quantidade: number) => {
    if (quantidade <= 0) {
      setOrderItems(prev => prev.filter(item => item.sku !== sku))
      return
    }

    const product = products.find(p => p.sku === sku)
    if (!product) return

    setOrderItems(prev => {
      const existingItem = prev.find(item => item.sku === sku)
      if (existingItem) {
        return prev.map(item => 
          item.sku === sku 
            ? { ...item, quantidade, total: quantidade * item.preco }
            : item
        )
      }
      return [...prev, {
        sku,
        nome: product.nome,
        quantidade,
        preco: product.preco,
        total: quantidade * product.preco
      }]
    })
  }

  const generateExcel = async () => {
    if (orderItems.length === 0) {
      alert('Adicione pelo menos um produto ao pedido')
      return
    }

    try {
      const response = await fetch('/api/generate-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: orderItems })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao gerar planilha')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pedido-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
      
      // Limpar itens após gerar pedido
      setOrderItems([])
      // Limpar inputs
      const inputs = document.querySelectorAll('input[type="number"]')
      inputs.forEach(input => (input as HTMLInputElement).value = '')
    } catch (error) {
      console.error('Error generating order:', error)
      alert('Erro ao gerar planilha. Tente novamente.')
    }
  }

  const totalPedido = orderItems.reduce((sum, item) => sum + item.total, 0)

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        {(error.includes('não configurado') || error.includes('No cached data')) && (
          <div className="mt-4 space-y-3">
            <a 
              href="/admin" 
              className="block w-fit bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {error.includes('No cached data') ? 'Sincronizar Produtos' : 'Configurar Sistema'}
            </a>
            {error.includes('No cached data') && (
              <p className="text-sm text-gray-600">
                É necessário sincronizar os produtos com o Bling primeiro.
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Lista de Produtos</h1>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-700">Nenhum produto encontrado.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-900 font-semibold">SKU</th>
                  <th className="px-4 py-2 text-left text-gray-900 font-semibold">Nome</th>
                  <th className="px-4 py-2 text-left text-gray-900 font-semibold">Preço</th>
                  <th className="px-4 py-2 text-left text-gray-900 font-semibold">Estoque</th>
                  <th className="px-4 py-2 text-left text-gray-900 font-semibold">Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.sku} className="border-t hover:bg-gray-50">
                    <td className="border px-4 py-2 text-gray-800 font-medium">{product.sku}</td>
                    <td className="border px-4 py-2 text-gray-800">{product.nome}</td>
                    <td className="border px-4 py-2 text-gray-800 font-medium">R$ {product.preco.toFixed(2)}</td>
                    <td className="border px-4 py-2 text-gray-800">{product.estoque}</td>
                    <td className="border px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        max={product.estoque}
                        onChange={(e) => handleQuantityChange(product.sku, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orderItems.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Resumo do Pedido</h2>
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.sku} className="flex justify-between text-gray-800">
                    <span>{item.nome} (x{item.quantidade})</span>
                    <span className="font-medium">R$ {item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <hr className="my-3 border-gray-300" />
              <div className="flex justify-between font-semibold text-lg text-gray-900">
                <span>Total:</span>
                <span>R$ {totalPedido.toFixed(2)}</span>
              </div>
              <button
                onClick={generateExcel}
                className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors font-semibold"
              >
                Gerar Planilha de Pedido
              </button>
            </div>
          )}

          {/* Loading indicator e intersection observer */}
          <div className="mt-6 text-center">
            {loadingMore && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-700">Carregando mais produtos...</span>
              </div>
            )}
            
            {!hasMore && products.length > 0 && (
              <p className="py-4 text-gray-600 bg-gray-50 rounded-lg border">
                ✅ Todos os produtos foram carregados
              </p>
            )}
            
            {/* Elemento de observação para scroll infinito */}
            {hasMore && !loadingMore && (
              <div ref={ref} className="h-4 w-full" />
            )}
          </div>
        </>
      )}
    </div>
  )
}
