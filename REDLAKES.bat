@echo off
chcp 65001 >nul
title REDLAKES RP — Plateforme
cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
    echo.
    echo   Node.js / npm est requis.
    echo   Installez-le depuis https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo.
echo   REDLAKES RP — Demarrage plateforme...
echo   Site + API + console de controle
echo.

call npm run dev

exit /b %ERRORLEVEL%
