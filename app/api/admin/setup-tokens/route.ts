import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Arquivo para salvar tokens permanentes
const TOKENS_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data')
const TOKENS_FILE = path.join(TOKENS_DIR, 'admin-tokens.json')

interface AdminTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  created_at: number
  last_refresh: number
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ success: false, error: 'Código não fornecido' })
    }

    const clientId = process.env.NEXT_PUBLIC_BLING_CLIENT_ID
    const clientSecret = process.env.BLING_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json({ success: false, error: 'Credenciais não configuradas' })
    }

    console.log('🔧 Trocando código por tokens permanentes...')

    // O redirect_uri deve ser o mesmo usado na autorização (mesmo que não tenha sido enviado)
    // Se foi configurado no app Bling, deve ser enviado na troca de tokens
    const redirectUri = 'https://bling-chi.vercel.app/admin-callback'

    // Fazer requisição conforme documentação oficial Bling
    const tokenResponse = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ Erro ao obter tokens:', tokenResponse.status, tokenResponse.statusText)
      console.error('❌ Resposta completa:', errorText)
      return NextResponse.json({ 
        success: false, 
        error: `Erro HTTP: ${tokenResponse.status} - ${errorText}` 
      })
    }

    const tokenData = await tokenResponse.json()
    console.log('🔧 Tokens recebidos:', { 
      access_token: tokenData.access_token ? `${tokenData.access_token.substring(0, 10)}...` : 'VAZIO',
      refresh_token: tokenData.refresh_token ? `${tokenData.refresh_token.substring(0, 10)}...` : 'VAZIO',
      expires_in: tokenData.expires_in
    })

    // Criar estrutura de tokens admin
    const adminTokens: AdminTokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      created_at: Date.now(),
      last_refresh: Date.now()
    }

    // Criar diretório se não existir
    if (!fs.existsSync(TOKENS_DIR)) {
      console.log('📁 Criando diretório:', TOKENS_DIR)
      fs.mkdirSync(TOKENS_DIR, { recursive: true })
    }

    // Salvar tokens permanentemente
    console.log('💾 Salvando tokens em:', TOKENS_FILE)
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(adminTokens, null, 2))

    // Verificar se foi salvo corretamente
    if (fs.existsSync(TOKENS_FILE)) {
      console.log('✅ Tokens admin salvos permanentemente!')
      console.log('📁 Arquivo confirmado em:', TOKENS_FILE)
      const savedData = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'))
      console.log('🔍 Dados salvos:', {
        access_token: savedData.access_token ? 'OK' : 'VAZIO',
        refresh_token: savedData.refresh_token ? 'OK' : 'VAZIO',
        created_at: new Date(savedData.created_at).toLocaleString()
      })
    } else {
      console.error('❌ Falha ao salvar tokens!')
      return NextResponse.json({ 
        success: false, 
        error: 'Falha ao salvar tokens no arquivo' 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tokens configurados com sucesso. Sistema pronto para usuários comuns!' 
    })

  } catch (error) {
    console.error('Erro ao configurar tokens admin:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Erro interno: ${error}` 
    })
  }
}

// Função para ler tokens admin
export async function GET() {
  try {
    if (!fs.existsSync(TOKENS_FILE)) {
      return NextResponse.json({ configured: false })
    }

    const tokens: AdminTokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'))
    
    return NextResponse.json({ 
      configured: true,
      created_at: new Date(tokens.created_at).toLocaleString(),
      last_refresh: new Date(tokens.last_refresh).toLocaleString()
    })

  } catch (error) {
    return NextResponse.json({ configured: false, error: error })
  }
}
