import fs from 'fs'
import path from 'path'
import { getValidAdminTokens } from './admin-tokens'

// No Vercel, usar /tmp para cache temporário
const CACHE_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data')
const CACHE_FILE = path.join(CACHE_DIR, 'products-cache.json')
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutos em millisegundos

interface ProductCache {
  lastUpdate: number
  products: Array<{
    sku: string
    nome: string
    preco: number
    estoque: number
  }>
}

export async function getCachedProducts() {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return []
    }

    const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as ProductCache
    console.log('📦 Lendo cache')
    return cacheData.products || []
  } catch (error) {
    console.error('Erro ao ler cache:', error)
    return []
  }
}

export function isCacheValid() {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return false
    }

    const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as ProductCache
    const now = Date.now()
    
    // Verificar se o cache ainda é válido (menos de 30 minutos)
    return (now - cacheData.lastUpdate) < CACHE_DURATION
  } catch (error) {
    console.error('Erro ao verificar cache:', error)
    return false
  }
}

export async function saveCachedProducts(products: ProductCache['products']) {
  try {
    // Criar diretório se não existir (funciona local e no Vercel)
    const dataDir = path.dirname(CACHE_FILE)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const cacheData: ProductCache = {
      lastUpdate: Date.now(),
      products
    }

    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2))
    console.log(`💾 Cache salvo com ${products.length} produtos em ${CACHE_FILE}`)
  } catch (error) {
    console.error('Erro ao salvar cache:', error)
  }
}

// Nova função para atualizar apenas estoque e preço (mantendo todos os produtos)
export async function updateProductsPriceAndStock(updatedProducts: ProductCache['products']) {
  try {
    const existingProducts = await getCachedProducts()
    
    if (existingProducts.length === 0) {
      // Se não tem cache, salva todos os produtos
      console.log('🆕 Primeiro cache - salvando todos os produtos')
      await saveCachedProducts(updatedProducts)
      return
    }

    console.log(`🔄 Atualizando preços e estoques de ${existingProducts.length} produtos existentes`)
    
    // Criar mapa para lookup rápido
    const updatedMap = new Map()
    updatedProducts.forEach(product => {
      updatedMap.set(product.sku, product)
    })

    // Atualizar produtos existentes + adicionar novos
    const allProducts = [...existingProducts]
    let updatedCount = 0
    let newCount = 0

    // Atualizar produtos existentes
    for (let i = 0; i < allProducts.length; i++) {
      const updated = updatedMap.get(allProducts[i].sku)
      if (updated) {
        allProducts[i].preco = updated.preco
        allProducts[i].estoque = updated.estoque
        updatedCount++
        updatedMap.delete(updated.sku) // Remove do mapa
      }
    }

    // Adicionar produtos novos que não existiam
    updatedMap.forEach((product) => {
      allProducts.push(product)
      newCount++
    })

    // Salvar cache atualizado
    const cacheData: ProductCache = {
      lastUpdate: Date.now(),
      products: allProducts
    }

    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2))
    console.log(`💾 Cache atualizado: ${updatedCount} produtos atualizados, ${newCount} produtos novos, ${allProducts.length} total`)
    
  } catch (error) {
    console.error('Erro ao atualizar cache:', error)
  }
}

export function getCacheInfo() {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return { exists: false, lastUpdate: null, productCount: 0 }
    }

    const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as ProductCache
    const now = Date.now()
    const minutesAgo = Math.floor((now - cacheData.lastUpdate) / (60 * 1000))

    return {
      exists: true,
      lastUpdate: new Date(cacheData.lastUpdate),
      productCount: cacheData.products.length,
      minutesAgo,
      isExpired: now - cacheData.lastUpdate >= CACHE_DURATION
    }
  } catch (error) {
    return { exists: false, lastUpdate: null, productCount: 0 }
  }
}

// Nova função para sincronizar produtos usando tokens admin
export async function syncProductsWithAdminTokens() {
  try {
    console.log('🔄 Iniciando sincronização com tokens admin...')
    
    const accessToken = await getValidAdminTokens()
    if (!accessToken) {
      console.error('❌ Tokens admin não disponíveis')
      return false
    }

    const allProducts = []
    let currentPage = 1
    let hasMorePages = true

    while (hasMorePages) {
      console.log(`📥 Buscando página ${currentPage}...`)
      
      const response = await fetch(`https://www.bling.com.br/Api/v3/produtos?pagina=${currentPage}&limite=100`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error(`❌ Erro na página ${currentPage}: ${response.status}`)
        break
      }

      const data = await response.json()
      
      if (!data.data || data.data.length === 0) {
        hasMorePages = false
        break
      }

      // Processar produtos da página
      for (const item of data.data) {
        if (item.codigo && item.nome && item.preco) {
          allProducts.push({
            sku: String(item.codigo),
            nome: item.nome,
            preco: parseFloat(item.preco) || 0,
            estoque: parseInt(item.estoque?.saldoVirtualTotal || '0') || 0
          })
        }
      }

      console.log(`✅ Página ${currentPage}: ${data.data.length} produtos processados`)
      
      // Verificar se há mais páginas
      hasMorePages = data.data.length === 100
      currentPage++

      // Delay entre requests para não sobrecarregar a API
      if (hasMorePages) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    console.log(`🎉 Sincronização completa: ${allProducts.length} produtos encontrados`)

    // Salvar no cache
    if (allProducts.length > 0) {
      await saveCachedProducts(allProducts)
      return true
    } else {
      console.log('⚠️ Nenhum produto encontrado para cachear')
      return false
    }

  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
    return false
  }
}
