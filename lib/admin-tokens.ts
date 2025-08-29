import fs from 'fs'
import path from 'path'

// Arquivo dos tokens admin
const TOKENS_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data')
const TOKENS_FILE = path.join(TOKENS_DIR, 'admin-tokens.json')

interface AdminTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  created_at: number
  last_refresh: number
}

// Verificar se tokens admin estão configurados
export function hasAdminTokens(): boolean {
  try {
    return fs.existsSync(TOKENS_FILE)
  } catch {
    return false
  }
}

// Obter tokens admin válidos (com refresh automático)
export async function getValidAdminTokens(): Promise<string | null> {
  try {
    if (!fs.existsSync(TOKENS_FILE)) {
      console.log('❌ Tokens admin não configurados')
      return null
    }

    const tokens: AdminTokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'))
    const now = Date.now()
    const tokenAge = now - tokens.last_refresh
    const expiresIn = tokens.expires_in * 1000 // converter para ms

    // Se token ainda é válido (com margem de 5 minutos)
    if (tokenAge < (expiresIn - 5 * 60 * 1000)) {
      console.log('✅ Token admin válido')
      return tokens.access_token
    }

    // Token expirado, fazer refresh
    console.log('🔄 Token admin expirado, fazendo refresh...')
    
    const clientId = process.env.NEXT_PUBLIC_BLING_CLIENT_ID
    const clientSecret = process.env.BLING_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error('❌ Credenciais não configuradas')
      return null
    }

    const refreshResponse = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    if (!refreshResponse.ok) {
      console.error('❌ Erro ao fazer refresh do token admin')
      return null
    }

    const newTokens = await refreshResponse.json()

    // Atualizar tokens salvos
    const updatedTokens: AdminTokens = {
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token || tokens.refresh_token, // Alguns refresh não retornam novo refresh_token
      expires_in: newTokens.expires_in,
      created_at: tokens.created_at,
      last_refresh: now
    }

    fs.writeFileSync(TOKENS_FILE, JSON.stringify(updatedTokens, null, 2))
    console.log('✅ Token admin atualizado com sucesso')

    return updatedTokens.access_token

  } catch (error) {
    console.error('❌ Erro ao obter tokens admin:', error)
    return null
  }
}

// Verificar status dos tokens admin
export function getAdminTokensStatus() {
  try {
    if (!fs.existsSync(TOKENS_FILE)) {
      return { configured: false }
    }

    const tokens: AdminTokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'))
    const now = Date.now()
    const tokenAge = now - tokens.last_refresh
    const expiresIn = tokens.expires_in * 1000

    return {
      configured: true,
      created_at: new Date(tokens.created_at),
      last_refresh: new Date(tokens.last_refresh),
      expires_in_minutes: Math.floor((expiresIn - tokenAge) / (60 * 1000)),
      is_expired: tokenAge > expiresIn
    }

  } catch (error) {
    return { configured: false, error: error }
  }
}
