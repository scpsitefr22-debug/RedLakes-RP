@echo off
chcp 65001 >nul
title REDLAKES RP — Centre de commandement
cd /d "%~dp0"

echo.
echo   REDLAKES RP — Centre de commandement
echo   Site, API, Minecraft, Docker, Bot Discord
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\hub.ps1"

exit /b %ERRORLEVEL%
