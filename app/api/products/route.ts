import { NextRequest, NextResponse } from 'next/server'
import { getCachedProducts, isCacheValid, updateProductsPriceAndStock } from '@/lib/cache'
import { cookies } from 'next/headers'

// Função para sincronizar produtos automaticamente
async function autoSync() {
  try {
    console.log('🔄 Auto-sincronização iniciada...')
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value

    if (!accessToken) {
      console.log('❌ Sem token para sincronização')
      return []
    }

    const allProducts = []
    let page = 1
    let hasMorePages = true

    // Buscar TODAS as páginas para ter catálogo completo
    while (hasMorePages && page <= 50) { // Máximo 50 páginas = 5000 produtos
      console.log(`📡 Auto-sync página ${page}...`)
      
      if (page > 1) {
        await new Promise(resolve => setTimeout(resolve, 500)) // Delay para evitar rate limit
      }
      
      const response = await fetch(`https://www.bling.com.br/Api/v3/produtos?limite=100&pagina=${page}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        console.log(`❌ Erro na página ${page}:`, response.status)
        if (response.status === 429) {
          console.log('⏳ Rate limit - aguardando 2 segundos...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue // Tentar novamente
        }
        break
      }

      const data = await response.json()
      
      if (!data.data || data.data.length === 0) {
        console.log(`📦 Página ${page} vazia, parando`)
        break
      }

      // Mostrar estrutura dos produtos na primeira página
      if (page === 1 && data.data.length > 0) {
        console.log('🔍 Estrutura do primeiro produto:', {
          campos: Object.keys(data.data[0]),
          exemplo: {
            codigo: data.data[0].codigo,
            nome: data.data[0].nome,
            preco: data.data[0].preco,
            estoque: data.data[0].estoque,
            estoqueAtual: data.data[0].estoqueAtual
          }
        })
      }

      const pageProducts = data.data.map((item: any) => {
        // Mapear estoque corretamente usando saldoVirtualTotal
        let estoque = 0
        if (item.estoque && item.estoque.saldoVirtualTotal !== undefined && item.estoque.saldoVirtualTotal !== null) {
          const saldoVirtual = parseFloat(item.estoque.saldoVirtualTotal)
          estoque = isNaN(saldoVirtual) ? 0 : saldoVirtual
        }
        
        return {
          sku: item.codigo || item.id,
          nome: item.nome || 'Produto sem nome',
          preco: parseFloat(item.preco || 0),
          estoque: estoque
        }
      })

      allProducts.push(...pageProducts)
      console.log(`✅ Página ${page}: ${pageProducts.length} produtos adicionados`)
      
      page++
      
      // Se retornou menos que 100 produtos, acabaram as páginas
      if (data.data.length < 100) {
        hasMorePages = false
        console.log(`📦 Última página detectada: ${data.data.length} produtos`)
      }
    }

    await updateProductsPriceAndStock(allProducts)
    console.log(`✅ Auto-sync concluída: ${allProducts.length} produtos processados`)
    
    return await getCachedProducts() // Retorna todos os produtos do cache
  } catch (error) {
    console.error('❌ Erro na auto-sincronização:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    console.log(`📋 Buscando produtos página ${page} (limite: ${limit})`)

    let products = await getCachedProducts()
    
    // Se não tem cache válido, sincronizar automaticamente
    if (!isCacheValid() || products.length === 0) {
      console.log('🔄 Cache inválido ou vazio, sincronizando automaticamente...')
      products = await autoSync()
    }
    
    console.log(`📦 Total produtos no cache: ${products.length}`)
    
    // Filtrar apenas produtos com estoque > 0 (disponíveis)
    const availableProducts = products.filter(p => p.estoque > 0)
    console.log(`📦 Produtos disponíveis: ${availableProducts.length} (somente estoque > 0)`)
    
    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = availableProducts.slice(startIndex, endIndex)
    
    console.log(`📄 Página ${page}: ${paginatedProducts.length} produtos (${startIndex}-${endIndex})`)

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: availableProducts.length,
        totalPages: Math.ceil(availableProducts.length / limit),
        hasMore: endIndex < availableProducts.length
      }
    })

  } catch (error) {
    console.error('💥 Erro na API de produtos:', error)
    return NextResponse.json({ 
      error: 'Erro ao buscar produtos',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
