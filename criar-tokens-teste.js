import fs from 'fs'
import path from 'path'

// Simular tokens para teste
const TOKENS_DIR = path.join(process.cwd(), 'data')
const TOKENS_FILE = path.join(TOKENS_DIR, 'admin-tokens.json')

// Criar tokens de teste
const testTokens = {
  access_token: 'test_access_token_123',
  refresh_token: 'test_refresh_token_456',
  expires_in: 21600, // 6 horas
  created_at: Date.now(),
  last_refresh: Date.now()
}

console.log('🧪 Criando tokens de teste...')

// Criar diretório se não existir
if (!fs.existsSync(TOKENS_DIR)) {
  fs.mkdirSync(TOKENS_DIR, { recursive: true })
  console.log('📁 Diretório criado:', TOKENS_DIR)
}

// Salvar tokens de teste
fs.writeFileSync(TOKENS_FILE, JSON.stringify(testTokens, null, 2))
console.log('💾 Tokens de teste salvos em:', TOKENS_FILE)

// Verificar se foi salvo
if (fs.existsSync(TOKENS_FILE)) {
  const saved = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'))
  console.log('✅ Tokens verificados:')
  console.log('  📅 Criado em:', new Date(saved.created_at).toLocaleString())
  console.log('  🔑 Access token:', saved.access_token.substring(0, 10) + '...')
  console.log('  🔄 Refresh token:', saved.refresh_token.substring(0, 10) + '...')
  console.log('  ⏰ Expira em:', saved.expires_in, 'segundos')
} else {
  console.log('❌ Falha ao salvar tokens de teste')
}

console.log('🎯 Agora teste acessar: http://localhost:3000/')
console.log('📊 Para ver status: http://localhost:3000/status')
console.log('🔍 Para debug: http://localhost:3000/api/debug-tokens')
