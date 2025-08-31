#!/usr/bin/env python3
"""
Script para converter HTML para PDF
Gera o resumo do projeto em formato PDF
"""

import os
import sys
from pathlib import Path

def convert_html_to_pdf():
    """Converte o arquivo HTML para PDF usando wkhtmltopdf ou weasyprint"""
    
    html_file = Path("d:/bling/resumo-projeto.html")
    pdf_file = Path("d:/bling/Resumo-Projeto-Catalogo-Bling.pdf")
    
    if not html_file.exists():
        print(f"❌ Arquivo HTML não encontrado: {html_file}")
        return False
    
    print("🔄 Convertendo HTML para PDF...")
    
    # Opção 1: Tentar com wkhtmltopdf
    try:
        import pdfkit
        
        options = {
            'page-size': 'A4',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
            'encoding': "UTF-8",
            'no-outline': None,
            'enable-local-file-access': None,
            'print-media-type': None
        }
        
        pdfkit.from_file(str(html_file), str(pdf_file), options=options)
        print(f"✅ PDF gerado com sucesso: {pdf_file}")
        return True
        
    except ImportError:
        print("⚠️ pdfkit não instalado, tentando weasyprint...")
    except Exception as e:
        print(f"❌ Erro com pdfkit: {e}")
    
    # Opção 2: Tentar com weasyprint
    try:
        from weasyprint import HTML, CSS
        
        # CSS adicional para impressão
        css = CSS(string='''
            @page {
                size: A4;
                margin: 2cm;
            }
            
            body {
                font-size: 11pt;
                line-height: 1.4;
            }
            
            .section {
                page-break-inside: avoid;
                margin-bottom: 20px;
            }
            
            h1, h2 {
                page-break-after: avoid;
            }
        ''')
        
        HTML(filename=str(html_file)).write_pdf(
            str(pdf_file),
            stylesheets=[css]
        )
        
        print(f"✅ PDF gerado com sucesso: {pdf_file}")
        return True
        
    except ImportError:
        print("⚠️ weasyprint não instalado")
    except Exception as e:
        print(f"❌ Erro com weasyprint: {e}")
    
    # Opção 3: Instruções manuais
    print("\n📝 INSTRUÇÕES PARA GERAR PDF MANUALMENTE:")
    print("1. Abra o arquivo resumo-projeto.html no seu navegador")
    print("2. Pressione Ctrl+P (Imprimir)")
    print("3. Selecione 'Salvar como PDF'")
    print("4. Configure:")
    print("   - Tamanho: A4")
    print("   - Margens: Padrão")
    print("   - Gráficos de fundo: Ativado")
    print("5. Salve como 'Resumo-Projeto-Catalogo-Bling.pdf'")
    
    return False

def install_dependencies():
    """Instala as dependências necessárias"""
    print("🔄 Instalando dependências para conversão PDF...")
    
    try:
        import subprocess
        
        # Tentar instalar weasyprint (mais fácil)
        subprocess.check_call([sys.executable, "-m", "pip", "install", "weasyprint"])
        print("✅ weasyprint instalado com sucesso!")
        return True
        
    except subprocess.CalledProcessError:
        print("❌ Erro ao instalar weasyprint")
        
    try:
        # Tentar instalar pdfkit
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pdfkit"])
        print("✅ pdfkit instalado com sucesso!")
        print("⚠️ Nota: pdfkit requer wkhtmltopdf instalado no sistema")
        return True
        
    except subprocess.CalledProcessError:
        print("❌ Erro ao instalar pdfkit")
        
    return False

if __name__ == "__main__":
    print("📋 GERADOR DE PDF - RESUMO DO PROJETO")
    print("=" * 50)
    
    # Tentar converter diretamente
    if not convert_html_to_pdf():
        print("\n🔧 Tentando instalar dependências...")
        if install_dependencies():
            print("\n🔄 Tentando novamente...")
            convert_html_to_pdf()
    
    print("\n✅ Script finalizado!")
