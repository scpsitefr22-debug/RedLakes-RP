@echo off
chcp 65001 >nul
title REDLAKES RP - Bot Discord
cd /d "%~dp0"

echo.
echo   REDLAKES RP - Bot Discord
echo.

pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-bot.ps1"

if errorlevel 1 (
    echo.
    echo   Le bot n'a pas pu demarrer. Verifie apps\discord-bot\.env
    echo.
)

pause
