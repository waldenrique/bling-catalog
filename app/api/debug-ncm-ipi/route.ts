import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
    const ncmPath = path.join(dataDir, 'ncm.json');
    const ipiPath = path.join(dataDir, 'ipi.json');
    
    let ncmData = {};
    let ncmError = null;
    let ipiData = {};
    let ipiError = null;
    
    // Carregar dados de NCM
    try {
      const ncmContent = await fs.readFile(ncmPath, 'utf8');
      ncmData = JSON.parse(ncmContent);
    } catch (error) {
      ncmError = error.message;
      console.error('Erro ao carregar NCM:', error);
    }
    
    // Carregar dados de IPI
    try {
      const ipiContent = await fs.readFile(ipiPath, 'utf8');
      ipiData = JSON.parse(ipiContent);
    } catch (error) {
      ipiError = error.message;
      console.error('Erro ao carregar IPI:', error);
    }
    
    // Obter exemplos de produtos com NCM e IPI
    const productCachePath = path.join(dataDir, 'products-cache.json');
    let productsWithNcmAndIpi = [];
    try {
      const productsContent = await fs.readFile(productCachePath, 'utf8');
      const productsData = JSON.parse(productsContent);
      
      // Pegar alguns produtos para teste
      if (Array.isArray(productsData.items)) {
        productsWithNcmAndIpi = productsData.items
          .filter(p => p.sku && (p.ncm || ncmData[p.sku]))
          .slice(0, 5)
          .map(p => {
            const ncm = ncmData[p.sku] || p.ncm || null;
            let ipiRate = null;
            
            if (ncm) {
              // Tenta encontrar o IPI usando o NCM exatamente como está
              ipiRate = ipiData[ncm];
              
              // Se não encontrar, tenta remover os pontos do NCM
              if (ipiRate === undefined && ncm.includes('.')) {
                const ncmSemPontos = ncm.replace(/\./g, '');
                ipiRate = ipiData[ncmSemPontos];
              }
              
              // Se ainda não encontrar, tenta adicionar pontos ao NCM
              if (ipiRate === undefined && !ncm.includes('.') && ncm.length === 8) {
                const ncmComPontos = `${ncm.slice(0, 4)}.${ncm.slice(4, 6)}.${ncm.slice(6, 8)}`;
                ipiRate = ipiData[ncmComPontos];
              }
            }
            
            return {
              sku: p.sku,
              nome: p.nome,
              ncm,
              ipiRate: ipiRate !== undefined ? ipiRate : null
            };
          });
      }
    } catch (error) {
      console.error('Erro ao carregar produtos de exemplo:', error);
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      dataDir,
      ncm: {
        path: ncmPath,
        exists: !ncmError,
        error: ncmError,
        count: Object.keys(ncmData).length,
        sampleEntries: Object.entries(ncmData).slice(0, 5)
      },
      ipi: {
        path: ipiPath,
        exists: !ipiError,
        error: ipiError,
        count: Object.keys(ipiData).length,
        sampleEntries: Object.entries(ipiData).slice(0, 5)
      },
      productExamples: productsWithNcmAndIpi
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Erro ao verificar dados de NCM e IPI',
      message: error.message
    }, { status: 500 });
  }
}
