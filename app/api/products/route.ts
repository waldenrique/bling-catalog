import { NextRequest, NextResponse } from 'next/server'
import { getCachedProducts, isCacheValid, syncProductsWithAdminTokens } from '@/lib/cache'
import { hasAdminTokens } from '@/lib/admin-tokens'

// Função para sincronizar produtos automaticamente usando tokens admin
async function autoSync() {
  try {
    console.log('🔄 Auto-sincronização iniciada...')
    
    // Verificar se tokens admin estão configurados
    if (!hasAdminTokens()) {
      console.log('❌ Tokens admin não configurados')
      return []
    }

    // Usar a nova função de sincronização com tokens admin
    const success = await syncProductsWithAdminTokens()
    if (success) {
      console.log('✅ Auto-sincronização concluída')
      return await getCachedProducts()
    } else {
      console.log('❌ Falha na auto-sincronização')
      return []
    }

  } catch (error) {
    console.error('❌ Erro na auto-sincronização:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    // Verificar se o cache é válido
    const cacheValid = await isCacheValid()
    
    let allProducts = []

    if (cacheValid) {
      console.log('✅ Cache válido, usando dados salvos')
      allProducts = await getCachedProducts()
    } else {
      console.log('⚠️ Cache expirado ou inexistente')
      
      // Verificar se tokens admin estão configurados
      if (!hasAdminTokens()) {
        return NextResponse.json({ 
          error: 'Sistema não configurado. Acesse /admin-setup para configurar os tokens admin.',
          redirectTo: '/admin-setup'
        }, { status: 503 })
      }

      // Sincronizar com tokens admin
      allProducts = await autoSync()
      
      if (allProducts.length === 0) {
        return NextResponse.json({ 
          error: 'Erro ao sincronizar produtos. Verifique os tokens admin.',
          redirectTo: '/admin-setup'
        }, { status: 500 })
      }
    }

    // Filtrar produtos com estoque > 0
    const productsWithStock = allProducts.filter(product => product.estoque > 0)

    // Calcular paginação
    const totalProducts = productsWithStock.length
    const totalPages = Math.ceil(totalProducts / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedProducts = productsWithStock.slice(startIndex, endIndex)

    console.log(`📦 Página ${page}: ${paginatedProducts.length} produtos (${productsWithStock.length} com estoque de ${allProducts.length} total)`)

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        totalWithStock: productsWithStock.length,
        pageSize,
        hasMore: page < totalPages
      }
    })

  } catch (error) {
    console.error('❌ Erro na API de produtos:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
