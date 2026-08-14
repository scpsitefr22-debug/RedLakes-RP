@echo off
chcp 65001 >nul
title REDLAKES RP - Site seul
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-web.ps1"

pause
