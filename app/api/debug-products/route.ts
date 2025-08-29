import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  console.log('🚀 API DEBUG CHAMADA')
  
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value

    if (!accessToken) {
      console.log('❌ Sem token')
      return NextResponse.json({ error: 'No access token' }, { status: 401 })
    }

    console.log('✅ Token encontrado, fazendo requisição...')

    const response = await fetch('https://www.bling.com.br/Api/v3/produtos?limite=5&pagina=1', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    console.log('📡 Status resposta:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Erro Bling:', errorText)
      return NextResponse.json({ error: 'Bling error', details: errorText }, { status: 500 })
    }

    const data = await response.json()
    console.log('📦 DADOS RECEBIDOS:', JSON.stringify(data, null, 2))

    if (data.data && data.data.length > 0) {
      const firstProduct = data.data[0]
      console.log('🔍 PRIMEIRO PRODUTO COMPLETO:', JSON.stringify(firstProduct, null, 2))
      console.log('🏷️ CAMPOS DISPONÍVEIS:', Object.keys(firstProduct))
    }

    return NextResponse.json({ 
      success: true, 
      rawData: data,
      debug: 'Check server console for details'
    })
    
  } catch (error) {
    console.error('💥 ERRO GERAL:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
