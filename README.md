# 🛒 Bling Product Catalog

Sistema de catálogo de produtos integrado com a API do Bling, desenvolvido em Next.js com TypeScript e Tailwind CSS.

## 🚀 Características

### ✨ **Funcionalidades Principais**
- 📦 **Catálogo Completo**: 3.480+ produtos sincronizados automaticamente
- 🔄 **Sincronização Inteligente**: Cache permanente com atualizações a cada 30 minutos
- 📊 **Estoque em Tempo Real**: Apenas produtos com estoque > 0 são exibidos
- ♾️ **Scroll Infinito**: Interface estilo Excel para navegação fluida
- 🔐 **Autenticação OAuth**: Login seguro com a API do Bling
- ⚡ **Performance Otimizada**: Cache local para navegação super rápida

### 🛠️ **Stack Tecnológica**
- **Frontend**: Next.js 15.5.2 + TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: Bling API v3
- **Authentication**: OAuth 2.0
- **Cache**: Sistema de arquivo local (JSON)
- **Build Tool**: Turbopack

## 📋 **Pré-requisitos**

1. Node.js 18+ instalado
2. Credenciais da API do Bling (Client ID e Client Secret)
3. Conta no Bling com produtos cadastrados

## 🔧 **Instalação**

1. **Clone o repositório**
   ```bash
   git clone https://github.com/SEU_USUARIO/bling-catalog.git
   cd bling-catalog
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   NEXT_PUBLIC_BLING_CLIENT_ID=seu_client_id_aqui
   BLING_CLIENT_SECRET=seu_client_secret_aqui
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

5. **Acesse o sistema**
   Abra http://localhost:3000 no seu navegador

## 🎯 **Como Usar**

1. **Primeiro Acesso**: 
   - O sistema redirecionará para login do Bling
   - Após autenticação, iniciará sincronização automática
   - Primeira sincronização pode demorar ~30 segundos (baixando catálogo completo)

2. **Navegação**:
   - Interface estilo planilha com produtos listados
   - Scroll infinito para navegar pelos produtos
   - Campos de quantidade editáveis para cada produto
   - Botão "Gerar Pedido Excel" para exportar seleções

3. **Atualizações Automáticas**:
   - Sistema atualiza preços e estoques a cada 30 minutos
   - Cache mantém catálogo completo sempre disponível
   - Performance otimizada após primeira sincronização

## 📁 **Estrutura do Projeto**

```
bling-catalog/
├── app/                    # Páginas e API routes (App Router)
│   ├── api/
│   │   ├── auth/          # Endpoints de autenticação
│   │   └── products/      # API de produtos
│   ├── login/             # Página de login
│   └── page.tsx           # Página principal (catálogo)
├── lib/
│   └── cache.ts           # Sistema de cache de produtos
├── middleware.ts          # Middleware de autenticação
├── data/                  # Cache local (ignorado pelo Git)
└── components/            # Componentes React (se houver)
```

## 🔐 **Segurança**

- Tokens OAuth armazenados em cookies HTTPOnly
- Refresh tokens para renovação automática
- Cache local não inclui dados sensíveis
- Variáveis de ambiente para credenciais

## 📊 **Performance**

- **Primeira carga**: ~30 segundos (sincronização completa)
- **Cargas subsequentes**: ~300ms por página
- **Cache size**: ~3.480 produtos
- **Produtos disponíveis**: ~1.147 com estoque
- **Paginação**: 50 produtos por página

## 🚀 **Deploy**

### Vercel (Recomendado)
1. Conecte seu repositório GitHub no Vercel
2. Configure as variáveis de ambiente no dashboard
3. Deploy automático a cada push

### Outras Plataformas
- Configure as variáveis de ambiente
- Certifique-se que o diretório `data/` tem permissão de escrita
- Execute `npm run build && npm start`

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 **Suporte**

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Verifique a documentação da API do Bling
- Consulte os logs do sistema para debugging

---

**Desenvolvido com ❤️ usando Next.js e Bling API**
