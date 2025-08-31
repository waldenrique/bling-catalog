@echo off
echo ========================================
echo    GERADOR DE PDF - RESUMO DO PROJETO
echo ========================================
echo.
echo 🔄 Abrindo arquivo HTML no navegador...
echo.

:: Abrir arquivo no navegador padrão
start "" "resumo-projeto.html"

echo ✅ Arquivo aberto no navegador!
echo.
echo 📝 INSTRUÇÕES PARA GERAR PDF:
echo.
echo 1. No navegador, pressione Ctrl+P
echo 2. Selecione "Salvar como PDF" ou "Microsoft Print to PDF"
echo 3. Configure:
echo    - Tamanho: A4
echo    - Margens: Padrão
echo    - Mais configurações → Gráficos de fundo: ✅ ATIVADO
echo 4. Clique em "Salvar"
echo 5. Salve como: "Resumo-Projeto-Catalogo-Bling.pdf"
echo.
echo 💡 DICA: Para melhor resultado, ative "Gráficos de fundo"
echo    para manter as cores e estilos do documento!
echo.
echo ========================================
echo     PDF será gerado na pasta escolhida
echo ========================================
pause
