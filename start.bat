@echo off
title Hyuga — start both
cd /d "%~dp0"
start "Hyuga Backend" cmd /k "cd /d "%~dp0server" && start.bat"
timeout /t 3 /nobreak >nul
start "Hyuga Frontend" cmd /k "cd /d "%~dp0client" && start.bat"
echo Backend va Frontend ishga tushirilmoqda...
echo Brauzer: http://127.0.0.1:5173
pause
