@echo off
chcp 65001 >nul
title REDLAKES - TOUT demarrer
cd /d "%~dp0"

echo.
echo   Demarrage complet : Site + API + Bot Discord + Serveur MC (dev)
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\hub.ps1" -Action tout

echo.
echo   Fenetres ouvertes. Site : http://localhost:3000
echo.
pause
