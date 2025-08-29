import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { saveCachedProducts } from '@/lib/cache'

export async function POST() {
  try {
    console.log('🔄 Iniciando sincronização com Bling...')
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 })
    }

    const allProducts = []
    let page = 1
    let hasMore = true

    // Buscar todas as páginas de produtos
    while (hasMore) {
      console.log(`📡 Buscando página ${page}...`)
      
      // Adicionar delay para evitar rate limiting (3 req/sec)
      if (page > 1) {
        await new Promise(resolve => setTimeout(resolve, 400)); // 400ms delay
      }
      
      const response = await fetch(`https://www.bling.com.br/Api/v3/produtos?limite=100&pagina=${page}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Erro na página ${page}:`, response.status, errorText)
        
        if (response.status === 429) {
          console.log('⏳ Rate limit atingido, aguardando 2 segundos...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue // Tentar novamente esta página
        }
        break
      }

      const data = await response.json()
      
      if (!data.data || !Array.isArray(data.data)) {
        console.log('Estrutura de dados inválida na página', page)
        break
      }

      console.log(`📦 Página ${page}: ${data.data.length} produtos total`)

      // Para debug, vamos mostrar a estrutura real dos produtos
      if (page === 1 && data.data.length > 0) {
        console.log('🔍 Estrutura completa do primeiro produto:', JSON.stringify(data.data[0], null, 2))
        console.log('🔍 Campos disponíveis:', Object.keys(data.data[0]))
      }

      // Mapear produtos da página atual
      const pageProducts = data.data.map((item: any) => {
        // Debug do produto individual - mostrar mais produtos para entender a estrutura
        if (page === 1 && pageProducts.length <= 5) {
          console.log(`🔍 Debug produto ${item.nome}:`, {
            campos: Object.keys(item),
            estoque_completo: item.estoque,
            estoque_virtual: item.estoque?.virtual,
            estoque_fisico: item.estoque?.fisico,
            estoqueAtual: item.estoqueAtual,
            quantidade: item.quantidade,
            depositos: item.depositos
          })
        }
        
        // Tentar encontrar estoque - CORRIGIDO para saldoVirtualTotal
        let estoque = 0
        
        // Primeiro tentar estoque.saldoVirtualTotal (campo correto descoberto!)
        if (item.estoque && item.estoque.saldoVirtualTotal !== undefined && item.estoque.saldoVirtualTotal !== null) {
          const saldoVirtual = parseFloat(item.estoque.saldoVirtualTotal)
          estoque = isNaN(saldoVirtual) ? 0 : saldoVirtual
        }
        // Fallbacks para outros campos
        else if (item.estoque && item.estoque.virtual !== undefined && item.estoque.virtual !== null) {
          estoque = parseFloat(item.estoque.virtual) || 0
        }
        else if (item.estoque && item.estoque.fisico !== undefined && item.estoque.fisico !== null) {
          estoque = parseFloat(item.estoque.fisico) || 0
        }
        else if (item.estoqueAtual !== undefined && item.estoqueAtual !== null) {
          estoque = parseFloat(item.estoqueAtual) || 0
        } 
        else if (item.quantidade !== undefined && item.quantidade !== null) {
          estoque = parseFloat(item.quantidade) || 0
        }
        
        // Se não encontrou, tentar em depositos
        if (estoque === 0 && item.depositos && Array.isArray(item.depositos) && item.depositos.length > 0) {
          estoque = parseFloat(item.depositos[0].saldo || item.depositos[0].quantidade || 0)
        }

        // Debug do estoque calculado para os primeiros produtos
        if (page === 1 && pageProducts.length <= 3) {
          console.log(`📊 Estoque calculado para ${item.nome}: ${estoque}`)
        }

        return {
          sku: item.codigo || item.id,
          nome: item.nome || 'Produto sem nome',
          preco: parseFloat(item.preco || 0),
          estoque: estoque
        }
      })

      // Adicionar TODOS os produtos (mesmo com estoque 0 ou negativo)
      allProducts.push(...pageProducts)

      console.log(`✅ Página ${page}: ${pageProducts.length} produtos TOTAIS de ${data.data.length} da API`)

      // Verificar se há mais páginas
      hasMore = data.data.length === 100
      page++

      // Delay de 1 segundo entre requests para evitar rate limiting (limite: 3/segundo)
      if (hasMore) {
        console.log('⏱️ Aguardando 1 segundo para evitar rate limiting...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Limite de segurança para evitar loop infinito
      if (page > 20) { // Reduzindo de 50 para 20
        console.log('⚠️ Limite de páginas atingido')
        break
      }
    }

    // Salvar no cache
    await saveCachedProducts(allProducts)

    console.log(`🎉 Sincronização concluída: ${allProducts.length} produtos totais`)

    return NextResponse.json({
      success: true,
      message: `Sincronizados ${allProducts.length} produtos com estoque`,
      totalProducts: allProducts.length,
      pagesProcessed: page - 1
    })

  } catch (error) {
    console.error('💥 Erro na sincronização:', error)
    return NextResponse.json({ 
      error: 'Sync error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
