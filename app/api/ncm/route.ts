import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Usar /tmp na Vercel, pasta local em dev
const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const DATA_PATH = path.join(DATA_DIR, 'ncm.json');

export async function POST(request: Request) {
  const { sku, ncm } = await request.json();
  if (!sku || !ncm) {
    return NextResponse.json({ error: 'SKU e NCM obrigatórios' }, { status: 400 });
  }
  let data: Record<string, string> = {};
  try {
    // Garantir que o diretório existe
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
      console.warn('Aviso ao criar diretório:', err);
      // Continuar mesmo se houver erro ao criar o diretório
    }
    
    // Tentar ler arquivo existente
    try {
      const file = await fs.readFile(DATA_PATH, 'utf8');
      data = JSON.parse(file);
    } catch (err) {
      console.log('Arquivo não existente, criando novo');
    }
    
    // Atualizar e salvar
    data[sku] = ncm;
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), { flag: 'w' });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const file = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(file);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({});
  }
}
