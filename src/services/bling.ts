'use client';

export interface Product {
  id: string;
  nome: string;
  codigo: string;
  preco: number;
  estoque: number;
}

export async function getProducts(page: number = 1, limit: number = 100) {
  try {
    console.log(`Buscando produtos da página ${page}`);
    
    const accessToken = getCookie('access_token');
    if (!accessToken) {
      throw new Error('Token não encontrado');
    }
    
    const response = await fetch('https://www.bling.com.br/Api/v3/produtos', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'GET'
    });

    if (!response.ok) {
      console.error('Erro ao buscar produtos:', response.status);
      const errorText = await response.text();
      console.error('Resposta de erro:', errorText);
      throw new Error(`Falha ao buscar produtos: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Resposta da API do Bling:', responseData);

    // Mapear os produtos da resposta
    if (responseData && Array.isArray(responseData)) {
      const mappedProducts = responseData.map((item: any) => ({
        id: item.id?.toString() || '',
        nome: item.descricao || '',
        codigo: item.codigo || '',
        preco: parseFloat(item.valor || '0'),
        estoque: parseInt(item.saldo?.quantidade || '0')
      }));

      console.log('Produtos mapeados:', mappedProducts);

      return {
        data: mappedProducts,
        hasMore: false // Por enquanto, desativamos o infinite scroll
      };
    } else {
      console.error('Estrutura inesperada na resposta:', responseData);
      return { data: [], hasMore: false };
    }
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return { data: [], hasMore: false };
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}
