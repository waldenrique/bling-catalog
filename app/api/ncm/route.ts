import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'ncm.json');

export async function POST(request: Request) {
  const { sku, ncm } = await request.json();
  if (!sku || !ncm) {
    return NextResponse.json({ error: 'SKU e NCM obrigatórios' }, { status: 400 });
  }
  let data: Record<string, string> = {};
  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    try {
      const file = await fs.readFile(DATA_PATH, 'utf8');
      data = JSON.parse(file);
    } catch {}
    data[sku] = ncm;
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
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
