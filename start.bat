@echo off
echo Iniciando servidor para Landing Transpontual...
echo.
echo Abrindo navegador em http://localhost:8000
echo Pressione Ctrl+C para parar o servidor
echo.

start http://localhost:8000

npx http-server -p 8000 -o
