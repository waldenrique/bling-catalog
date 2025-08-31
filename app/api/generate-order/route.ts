import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';

interface OrderItem {
  sku: string;
  nome: string;
  quantidade: number;
  preco: number;
  total: number;
  ncm?: string;
  ipi?: number;
  valorIpi?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json() as { items: OrderItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'É necessário fornecer pelo menos um item para o pedido' },
        { status: 400 }
      );
    }

    // Cria uma nova planilha
    const wb = XLSX.utils.book_new();
    
    // Formata os dados para o Excel
    const wsData = [
      ['SKU', 'Nome', 'Quantidade', 'Preço', 'Total Base', 'IPI %', 'Valor IPI', 'Total com IPI', 'NCM'], // Cabeçalho
      ...items.map(item => {
        const valorIpi = item.valorIpi || 0;
        const totalComIpi = item.total + valorIpi;
        return [
          item.sku,
          item.nome,
          item.quantidade,
          item.preco.toFixed(2),
          item.total.toFixed(2),
          item.ipi ? `${item.ipi}%` : '-',
          valorIpi.toFixed(2),
          totalComIpi.toFixed(2),
          item.ncm || 'N/A'
        ];
      })
    ];

    // Calcula os totais
    const totaisBase = items.reduce((acc, item) => acc + item.total, 0);
    const totaisIpi = items.reduce((acc, item) => acc + (item.valorIpi || 0), 0);
    const totalGeral = totaisBase + totaisIpi;
    
    // Adiciona linhas de totais
    wsData.push(['', '', '', '', '', '', '', '', '']);
    wsData.push(['', '', '', 'Total Base:', totaisBase.toFixed(2), '', '', '', '']);
    wsData.push(['', '', '', 'Total IPI:', totaisIpi.toFixed(2), '', '', '', '']);
    wsData.push(['', '', '', 'Total Geral:', totalGeral.toFixed(2), '', '', '', '']);

    // Cria uma planilha com os dados
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Ajusta largura das colunas
    const colWidths = [
      { wch: 15 },  // SKU
      { wch: 40 },  // Nome
      { wch: 10 },  // Quantidade
      { wch: 10 },  // Preço
      { wch: 12 },  // Total Base
      { wch: 8 },   // IPI %
      { wch: 12 },  // Valor IPI
      { wch: 15 },  // Total com IPI
      { wch: 15 }   // NCM
    ];
    ws['!cols'] = colWidths;

    // Adiciona a planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Pedido');

    // Gera o buffer do Excel
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Retorna o arquivo Excel
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Disposition': 'attachment; filename="pedido.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar o arquivo Excel' },
      { status: 500 }
    );
  }
}
