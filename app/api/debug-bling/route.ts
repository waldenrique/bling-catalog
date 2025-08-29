import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    console.log('🔍 Debug: Verificando produtos do Bling...')
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 })
    }

    // Buscar apenas a primeira página para debug
    console.log(`📡 Buscando primeira página...`)
    
    const response = await fetch(`https://www.bling.com.br/Api/v3/produtos?limite=10&pagina=1`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erro:`, response.status, errorText)
      return NextResponse.json({ 
        error: 'API Error',
        status: response.status,
        details: errorText
      }, { status: response.status })
    }

    const data = await response.json()
    
    console.log('📦 Resposta da API:', JSON.stringify(data, null, 2))

    if (!data.data || !Array.isArray(data.data)) {
      return NextResponse.json({ 
        error: 'Invalid data structure',
        received: data
      })
    }

    // Analisar estrutura dos produtos
    const products = data.data.map((item: any, index: number) => {
      console.log(`Produto ${index + 1}:`, JSON.stringify(item, null, 2))
      
      return {
        id: item.id,
        codigo: item.codigo,
        nome: item.nome,
        preco: item.preco,
        estoque: item.estoque,
        estoqueAtual: item.estoqueAtual,
        quantidade: item.quantidade,
        depositos: item.depositos,
        // Incluir todos os campos para análise
        allFields: Object.keys(item)
      }
    })

    return NextResponse.json({
      success: true,
      totalReceived: data.data.length,
      products: products,
      rawResponse: data
    })

  } catch (error) {
    console.error('💥 Erro no debug:', error)
    return NextResponse.json({ 
      error: 'Debug error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
