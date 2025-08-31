import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Usar /tmp na Vercel, pasta local em dev
const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const DATA_PATH = path.join(DATA_DIR, 'ncm.json');

export async function GET() {
  try {
    // Verificar se diretório existe
    let dirExists = false;
    try {
      const stats = await fs.stat(DATA_DIR);
      dirExists = stats.isDirectory();
    } catch {
      dirExists = false;
    }
    
    // Verificar se arquivo existe
    let fileExists = false;
    let fileContent = null;
    try {
      const stats = await fs.stat(DATA_PATH);
      fileExists = stats.isFile();
      if (fileExists) {
        fileContent = JSON.parse(await fs.readFile(DATA_PATH, 'utf8'));
      }
    } catch {
      fileExists = false;
    }
    
    // Tentar criar arquivo de teste para verificar permissões
    let canWrite = false;
    try {
      const testFile = path.join(DATA_DIR, 'test-write.txt');
      await fs.writeFile(testFile, 'Test write permission');
      await fs.unlink(testFile);
      canWrite = true;
    } catch (e) {
      canWrite = false;
    }
    
    return NextResponse.json({
      environment: process.env.VERCEL ? 'vercel' : 'local',
      storage: {
        dir: DATA_DIR,
        dirExists,
        file: DATA_PATH,
        fileExists,
        canWrite,
        fileSize: fileExists ? JSON.stringify(fileContent).length : 0,
        itemCount: fileExists ? Object.keys(fileContent || {}).length : 0
      },
      content: fileContent
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
