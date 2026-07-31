@echo off
title Hyuga Frontend (5173)
cd /d "%~dp0"
if not exist node_modules (
  echo Dependencies o'rnatilmoqda...
  call npm install
)
echo.
echo Frontend: http://127.0.0.1:5173
echo API proxy: /api -^> http://127.0.0.1:8000
echo.
call npm run dev
