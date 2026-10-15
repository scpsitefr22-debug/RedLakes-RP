@echo off
chcp 65001 >nul
title REDLAKES RP - Site de developpement
cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
    echo.
    echo   Node.js / npm est requis - https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo.
echo   REDLAKES RP - Site + API de TEST sur ce PC (base locale)
echo   Pour developper uniquement. Le vrai site est en ligne :
echo   https://redlakes-web.onrender.com
echo.

call npm run dev
exit /b %ERRORLEVEL%
