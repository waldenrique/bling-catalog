import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const diagnostics: {
      files: {
        ncm: boolean;
        ipi: boolean;
      };
      contents: {
        ncm: any;
        ipi: any;
      };
      sample: {
        ncm: any;
        ipi: any;
      };
    } = {
      files: {
        ncm: false,
        ipi: false
      },
      contents: {
        ncm: {},
        ipi: {}
      },
      sample: {
        ncm: null,
        ipi: null
      }
    };
    
    // Verificar o diretório data
    const dataDir = path.join(process.cwd(), 'data');
    let dirExists = false;
    
    try {
      await fs.access(dataDir);
      dirExists = true;
    } catch (error) {
      console.error('Diretório data não existe:', error);
    }
    
    // Verificar arquivo NCM
    const ncmPath = path.join(dataDir, 'ncm.json');
    try {
      const ncmStats = await fs.stat(ncmPath);
      diagnostics.files.ncm = ncmStats.isFile();
      if (diagnostics.files.ncm) {
        const ncmContent = await fs.readFile(ncmPath, 'utf8');
        const ncmData = JSON.parse(ncmContent);
        const ncmKeys = Object.keys(ncmData);
        diagnostics.contents.ncm = {
          size: ncmContent.length,
          keyCount: ncmKeys.length
        };
        if (ncmKeys.length > 0) {
          const sampleKey = ncmKeys[0];
          diagnostics.sample.ncm = {
            key: sampleKey,
            value: ncmData[sampleKey]
          };
        }
      }
    } catch (error) {
      console.error('Erro ao verificar arquivo NCM:', error);
    }
    
    // Verificar arquivo IPI
    const ipiPath = path.join(dataDir, 'ipi.json');
    try {
      const ipiStats = await fs.stat(ipiPath);
      diagnostics.files.ipi = ipiStats.isFile();
      if (diagnostics.files.ipi) {
        const ipiContent = await fs.readFile(ipiPath, 'utf8');
        const ipiData = JSON.parse(ipiContent);
        const ipiKeys = Object.keys(ipiData);
        diagnostics.contents.ipi = {
          size: ipiContent.length,
          keyCount: ipiKeys.length
        };
        if (ipiKeys.length > 0) {
          const sampleKey = ipiKeys[0];
          diagnostics.sample.ipi = {
            key: sampleKey,
            value: ipiData[sampleKey]
          };
        }
      }
    } catch (error) {
      console.error('Erro ao verificar arquivo IPI:', error);
    }
    
    // Verificar caminhos em produção (Vercel)
    let vercelDiagnostics = {};
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      const tmpDir = '/tmp';
      const tmpNcmPath = path.join(tmpDir, 'ncm.json');
      const tmpIpiPath = path.join(tmpDir, 'ipi.json');
      
      try {
        // Verificar se arquivos existem no /tmp
        const tmpNcmExists = await fs.stat(tmpNcmPath).then(() => true).catch(() => false);
        const tmpIpiExists = await fs.stat(tmpIpiPath).then(() => true).catch(() => false);
        
        vercelDiagnostics = {
          tmpNcmExists,
          tmpIpiExists
        };
      } catch (error) {
        console.error('Erro ao verificar arquivos em /tmp:', error);
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      dataDir: {
        path: dataDir,
        exists: dirExists
      },
      diagnostics,
      vercel: vercelDiagnostics,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Erro ao executar diagnóstico',
      message: error.message
    }, { status: 500 });
  }
}
