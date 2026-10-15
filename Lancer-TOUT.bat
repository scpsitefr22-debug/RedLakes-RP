@echo off
chcp 65001 >nul
title REDLAKES RP - Lancer le RP
cd /d "%~dp0"

rem Le site et l'API tournent en ligne (Render) : rien a lancer pour eux.
rem Sur ce PC, le RP n'a besoin que du bot Discord et du serveur Minecraft.
set "MC_DIR=C:\Users\flech\Documents\Serveur_SCP"

echo.
echo   REDLAKES RP - Bot Discord + serveur Minecraft
echo.

start "" "%~dp0Lancer-Bot-Discord.bat"
echo   Bot Discord : fenetre ouverte.

if not exist "%MC_DIR%\start.bat" (
    echo   ERREUR : serveur Minecraft introuvable dans %MC_DIR%
    echo.
    pause
    exit /b 1
)
start "" /d "%MC_DIR%" "%MC_DIR%\start.bat"
echo   Serveur Minecraft : fenetre ouverte.
echo.
echo   Pour arreter le serveur Minecraft : tape  stop  dans sa fenetre.
echo.
timeout /t 10 >nul
