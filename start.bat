@echo off
echo Iniciando servidor para Landing Transpontual...
echo.
echo Abrindo navegador em http://localhost:3000
echo Pressione Ctrl+C para parar o servidor
echo.

start http://localhost:3000

npx http-server -p 3000 -o
