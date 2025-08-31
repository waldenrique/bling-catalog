# Resumo do Projeto Bling Catalog

## Visão Geral
O projeto Bling Catalog é uma aplicação web desenvolvida com Next.js que integra com a API do Bling para gerenciar um catálogo de produtos. A aplicação permite visualizar produtos, criar pedidos e gerenciar informações adicionais como NCM (Nomenclatura Comum do Mercosul) e alíquotas de IPI.

## Arquitetura

### Frontend
- **Framework**: Next.js 15.5.2
- **Estilo**: Tailwind CSS
- **Componentes**: Mistura de componentes de servidor e cliente com uso de diretivas "use client"
- **Gerenciamento de Estado**: React Hooks (useState, useEffect)
- **Recursos de UI**: Layout responsivo, scroll infinito, tabela de produtos, formulários para pedidos

### Backend
- **API Routes**: Implementadas como rotas de API do Next.js em `/app/api/`
- **Autenticação**: OAuth 2.0 com token refresh automático
- **Armazenamento de Dados**: Sistema de arquivos (diferenciado por ambiente)
  - Ambiente de desenvolvimento: `/data/`
  - Ambiente de produção (Vercel): `/tmp/`

## Principais Funcionalidades

### 1. Catálogo de Produtos
- Listagem de produtos com informações como SKU, nome, preço, estoque
- Scroll infinito para carregar mais produtos
- Busca e filtragem de produtos
- Exibição de dados fiscais como NCM e alíquota de IPI

### 2. Gestão de Pedidos
- Adição de produtos ao pedido com quantidade
- Cálculo automático de valores (subtotal, IPI, total geral)
- Geração de planilha Excel com detalhes do pedido
- Visualização de resumo do pedido em tempo real

### 3. Gestão de NCM
- Interface administrativa para associar NCMs a SKUs de produtos
- API para gerenciar dados de NCM
- Armazenamento em arquivo JSON
- Exibição na tabela de produtos e inclusão nos pedidos

### 4. Gestão de IPI
- Interface administrativa para associar alíquotas de IPI a códigos NCM
- Cálculo automático de valor de IPI em pedidos
- Exibição de detalhes de IPI na tabela de produtos e no resumo de pedidos
- Inclusão de valores e alíquotas de IPI na planilha Excel

### 5. Autenticação
- Integração com OAuth 2.0 do Bling
- Persistência de tokens com refresh automático
- Mecanismo para evitar autenticações frequentes
- Status da autenticação e debug

## Principais Arquivos

### Páginas
- **app/page.tsx**: Página principal com listagem de produtos e criação de pedidos
- **app/admin-ncm/page.tsx**: Interface para gestão de NCMs
- **app/admin-ipi/page.tsx**: Interface para gestão de alíquotas de IPI
- **app/admin/page.tsx**: Página de administração geral

### APIs
- **app/api/products/route.ts**: API para obtenção de produtos do Bling
- **app/api/ncm/route.ts**: API para gestão de dados de NCM
- **app/api/ipi/route.ts**: API para gestão de dados de IPI
- **app/api/generate-order/route.ts**: API para geração de planilha Excel de pedidos
- **app/api/admin/setup-tokens/route.ts**: API para configuração de tokens OAuth

### Utilitários
- **lib/admin-tokens.ts**: Funções para gerenciamento de tokens OAuth
- **data/ncm.json**: Armazenamento de mapeamento SKU → NCM
- **data/ipi.json**: Armazenamento de mapeamento NCM → alíquota de IPI

## Desafios Técnicos Superados

1. **Persistência de Tokens OAuth**: Implementação de mecanismo para persistir tokens de acesso e evitar autenticações frequentes.

2. **Armazenamento em Produção**: Adaptação para trabalhar com diretório `/tmp` no ambiente Vercel e `/data` em ambiente local.

3. **Cálculos Fiscais**: Implementação de lógica para cálculo correto de IPI com base no NCM dos produtos.

4. **Consistência de Dados**: Criação de sistema para manter dados de NCM e IPI atualizados e acessíveis.

5. **Experiência do Usuário**: Interface responsiva com feedback imediato para operações como adição de produtos e cálculos de valores.

## Tecnologias Utilizadas
- Next.js
- React
- TypeScript
- Tailwind CSS
- XLSX (para geração de planilhas)
- OAuth 2.0
- Fetch API

## Próximos Passos Potenciais
- Implementação de sistema de usuários e permissões
- Dashboard com estatísticas de vendas
- Integração com sistema de pagamento
- Sincronização automática com sistema de estoque
- Implementação de outros tributos como ICMS e PIS/COFINS

## Considerações de Deploy
- Ambiente de produção: Vercel
- Necessidade de tratamento específico para armazenamento em `/tmp`
- Sistema de cache para melhorar desempenho
- Monitoramento de erros e performance
