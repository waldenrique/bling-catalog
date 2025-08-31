import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Função para obter o caminho correto do arquivo JSON baseado no ambiente
function getFilePath(fileName: string) {
  // Em ambiente de produção (Vercel), usamos /tmp
  // Em ambiente local, usamos /data
  const isProduction = process.env.NODE_ENV === 'production';
  const basePath = isProduction ? '/tmp' : path.join(process.cwd(), 'data');
  return path.join(basePath, fileName);
}

export async function GET() {
  try {
    // Busca dados de NCM
    const ncmPath = getFilePath('ncm.json');
    const ncmData = await fs.readFile(ncmPath, 'utf8').then(JSON.parse).catch(() => ({}));
    
    // Busca dados de IPI
    const ipiPath = getFilePath('ipi.json');
    const ipiData = await fs.readFile(ipiPath, 'utf8').then(JSON.parse).catch(() => ({}));
    
    // Criar uma lista de produtos com seus NCMs e alíquotas de IPI correspondentes
    const productsWithNcmAndIpi = [];
    
    // Para cada SKU em ncmData
    for (const sku of Object.keys(ncmData).slice(0, 50)) { // Limita a 50 para não sobrecarregar
      const ncm = ncmData[sku];
      
      // Tenta encontrar o IPI com diferentes formatações do NCM
      let ipiRate = ipiData[ncm];
      
      if (ipiRate === undefined && ncm.includes('.')) {
        // Tenta sem pontos
        const ncmSemPontos = ncm.replace(/\./g, '');
        ipiRate = ipiData[ncmSemPontos];
      }
      
      if (ipiRate === undefined && !ncm.includes('.') && ncm.length === 8) {
        // Tenta com pontos
        const ncmComPontos = `${ncm.slice(0, 4)}.${ncm.slice(4, 6)}.${ncm.slice(6, 8)}`;
        ipiRate = ipiData[ncmComPontos];
      }
      
      productsWithNcmAndIpi.push({
        sku,
        ncm,
        ipiRate: ipiRate !== undefined ? ipiRate : 'Não encontrado'
      });
    }
    
    // Retorna as estatísticas e lista de produtos
    return NextResponse.json({
      ncmCount: Object.keys(ncmData).length,
      ipiCount: Object.keys(ipiData).length,
      productsWithNcmAndIpi,
      ipiKeys: Object.keys(ipiData).slice(0, 20) // Primeiras 20 chaves de IPI
    });
  } catch (error) {
    console.error('Erro ao buscar dados de debug:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados de debug' }, { status: 500 });
  }
}
