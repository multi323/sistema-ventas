@echo off
CLS
echo.
echo ============================================
echo    TILIO - Sistema de Ventas
echo ============================================
echo.
echo Instalando dependencias...
call npm install

echo.
echo ✅ Dependencias instaladas
echo.
echo 🔥 Iniciando servidor...
echo.
echo 📍 Abre tu navegador en: http://localhost:3000
echo.
echo 💡 Tips:
echo   - Regístrate con tu email y nombre del negocio
echo   - Completa tu información en Gestión de Menú
echo   - Crea categorías y productos
echo   - Comparte tu enlace de carta con clientes
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

call npm start
pause
