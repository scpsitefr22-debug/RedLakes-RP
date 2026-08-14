@echo off
cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -File .\scripts\start-terminal.ps1
pause
