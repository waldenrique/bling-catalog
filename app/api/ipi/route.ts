import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Função para obter o caminho correto do arquivo JSON baseado no ambiente
function getFilePath() {
  // Em ambiente de produção (Vercel), usamos /tmp
  // Em ambiente local, usamos /data
  const isProduction = process.env.NODE_ENV === 'production';
  const basePath = isProduction ? '/tmp' : path.join(process.cwd(), 'data');
  return path.join(basePath, 'ipi.json');
}

// Busca os dados do arquivo JSON
async function getIpiData() {
  try {
    const filePath = getFilePath();
    const fileExists = await fs.stat(filePath).then(() => true).catch(() => false);

    if (!fileExists) {
      // Se o arquivo não existir, tenta copiar do data local para /tmp em produção
      if (process.env.NODE_ENV === 'production') {
        try {
          const sourceFile = path.join(process.cwd(), 'data', 'ipi.json');
          const fileContent = await fs.readFile(sourceFile, 'utf8');
          await fs.writeFile(filePath, fileContent);
        } catch (error) {
          console.error('Erro ao copiar arquivo IPI para /tmp:', error);
          return {};
        }
      } else {
        return {};
      }
    }

    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler arquivo IPI:', error);
    return {};
  }
}

// Handler GET - Retorna os dados de IPI
export async function GET() {
  try {
    const data = await getIpiData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar dados de IPI:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados de IPI' }, { status: 500 });
  }
}

// Handler POST - Atualiza os dados de IPI
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validação dos dados
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Dados inválidos. Envie um objeto com mapeamento NCM -> alíquota IPI' },
        { status: 400 }
      );
    }

    // Salva os dados no arquivo
    const filePath = getFilePath();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar dados de IPI:', error);
    return NextResponse.json({ error: 'Erro ao salvar dados de IPI' }, { status: 500 });
  }
}
