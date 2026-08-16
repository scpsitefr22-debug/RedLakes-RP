# Centre de commandement REDLAKES RP
# Menu interactif + actions rapides pour Site, API, Bot Discord, Serveur MC, Bot IA.

param(
    [ValidateSet("menu", "tout", "redlakes", "web", "bot", "mc", "mc-dev", "stop", "")]
    [string]$Action = "menu"
)

$ErrorActionPreference = "Continue"
. "$PSScriptRoot\launcher-config.ps1"
$cfg = Get-LauncherConfig
$RedlakesRoot = $cfg.RedlakesRoot
$McServerRoot = $cfg.McServerRoot

function Test-PathOk($path, $label) {
    if (-not (Test-Path $path)) {
        Write-Host ""
        Write-Host "  ERREUR : $label introuvable" -ForegroundColor Red
        Write-Host "  Chemin : $path" -ForegroundColor DarkGray
        Write-Host ""
        return $false
    }
    return $true
}

function Show-Banner {
    . "$PSScriptRoot\lib\launcher-ui.ps1"
    Write-RedlakesBanner "Centre de commandement"
    Write-Host "  Projet web/API : $($cfg.RedlakesRoot)" -ForegroundColor Gray
    Write-Host "  Serveur MC     : $($cfg.McServerRoot)" -ForegroundColor Gray
    Write-Host ""
}

function Show-Status {
    Write-Host "  --- Etat rapide ---" -ForegroundColor DarkYellow
    foreach ($item in @(
            @{ Port = 5432; Label = "PostgreSQL"; Container = "redlakes-postgres" },
            @{ Port = 3000; Label = "Site web"; Container = $null },
            @{ Port = 3001; Label = "API"; Container = $null },
            @{ Port = 8766; Label = "Bot IA MC"; Container = $null },
            @{ Port = 9200; Label = "Elasticsearch"; Container = "redlakes-elasticsearch" }
        )) {
        $listening = netstat -ano 2>$null | Select-String ":$($item.Port)\s" | Select-String "LISTENING"
        if ($listening) {
            Write-Host "  [ON ] $($item.Label) (port $($item.Port))" -ForegroundColor Green
        } elseif ($item.Container -and (docker inspect $item.Container 2>$null) -and $LASTEXITCODE -eq 0) {
            $running = docker inspect -f "{{.State.Running}}" $item.Container 2>$null
            if ($running -eq "true") {
                Write-Host "  [ON ] $($item.Label) (docker, port $($item.Port))" -ForegroundColor Green
            } else {
                Write-Host "  [OFF] $($item.Label) (conteneur arrete)" -ForegroundColor DarkYellow
            }
        } else {
            Write-Host "  [OFF] $($item.Label) (port $($item.Port))" -ForegroundColor DarkGray
        }
    }
    Write-Host ""
}

function Start-DiscordBot {
    if (-not (Test-PathOk $RedlakesRoot "Dossier REDLAKES")) { return }
    $botScript = Join-Path $RedlakesRoot "scripts\start-bot.ps1"
    Start-Process pwsh.exe -ArgumentList @(
        "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$botScript`""
    )
    Write-Host "  Bot Discord : fenetre ouverte." -ForegroundColor Green
}

function Start-MinecraftServer {
    param([switch]$Dev)
    if (-not (Test-PathOk $McServerRoot "Serveur Minecraft")) { return }
    $bat = if ($Dev) { "start_dev.bat" } else { "start.bat" }
    $batPath = Join-Path $McServerRoot $bat
    if (-not (Test-Path $batPath)) {
        Write-Host "  ERREUR : $bat introuvable" -ForegroundColor Red
        return
    }
    $title = if ($Dev) { "Serveur MC - DEV" } else { "Serveur MC - PROD" }
    Start-Process cmd.exe -ArgumentList @("/k", "title $title && cd /d `"$McServerRoot`" && call `"$bat`"")
    Write-Host "  Serveur Minecraft : fenetre ouverte ($bat)." -ForegroundColor Green
}

function Start-McBotIa {
    if (-not (Test-PathOk $McServerRoot "Serveur Minecraft")) { return }
    $bat = Join-Path $McServerRoot "bot-ia\start_bot_ia_background.bat"
    if (-not (Test-Path $bat)) {
        Write-Host "  ERREUR : start_bot_ia_background.bat introuvable" -ForegroundColor Red
        return
    }
    Push-Location (Join-Path $McServerRoot "bot-ia")
    cmd /c "start_bot_ia_background.bat"
    Pop-Location
    Write-Host "  Bot IA Minecraft : demarrage en arriere-plan." -ForegroundColor Green
}

function Stop-McBotIa {
    if (-not (Test-PathOk $McServerRoot "Serveur Minecraft")) { return }
    $bat = Join-Path $McServerRoot "bot-ia\stop_bot_ia_background.bat"
    if (Test-Path $bat) {
        Push-Location (Join-Path $McServerRoot "bot-ia")
        cmd /c "stop_bot_ia_background.bat"
        Pop-Location
        Write-Host "  Bot IA Minecraft arrete." -ForegroundColor Yellow
    }
}

function Stop-RedlakesStack {
    if (Test-Path "$RedlakesRoot\scripts\stop.ps1") {
        & "$RedlakesRoot\scripts\stop.ps1"
    }
    Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.CommandLine -match "discord-bot|redlakes-discord-bot") {
            Write-Host "  Bot Discord -> PID $($_.ProcessId)" -ForegroundColor Gray
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        }
    }
    Write-Host "  REDLAKES (site, API, bot) arrete." -ForegroundColor Green
}

function Open-Site {
    Start-Process $cfg.SiteUrl
}

function Show-Menu {
    Show-Banner
    Show-Status
    Write-Host "  DEMARRAGE" -ForegroundColor Yellow
    Write-Host "  [1] TOUT : Site + API + Bot + MC dev"
    Write-Host "  [2] Plateforme : Site + API + Bot (+ Docker auto)"
    Write-Host "  [3] Plateforme : Site + API seulement"
    Write-Host "  [P] PRO : npm run dev (console de controle)"
    Write-Host "  [4] Bot Discord seul"
    Write-Host "  [5] Serveur Minecraft (production)"
    Write-Host "  [6] Serveur Minecraft (mode dev)"
    Write-Host "  [7] Bot IA Minecraft seul"
    Write-Host "  [8] Docker Postgres + Elasticsearch (REDLAKES)"
    Write-Host ""
    Write-Host "  ARRET / OUTILS" -ForegroundColor Yellow
    Write-Host "  [9] Ouvrir la console de controle (/console)"
    Write-Host "  [O] Ouvrir le site public"
    Write-Host "  [S] Arreter REDLAKES (site, API, bot Discord)"
    Write-Host "  [I] Arreter Bot IA Minecraft"
    Write-Host "  [Q] Quitter"
    Write-Host ""
}

function Invoke-HubAction([string]$choice) {
    switch ($choice.ToUpper()) {
        "1" {
            Write-Host ""
            Write-Host "  Lancement complet..." -ForegroundColor Cyan
            & "$RedlakesRoot\scripts\dev-platform.ps1" -AvecBot
            Start-Sleep -Seconds 3
            Start-MinecraftServer -Dev
            Write-Host ""
            Write-Host "  MC    : fenetre dev ouverte" -ForegroundColor Green
        }
        "2" {
            & "$RedlakesRoot\scripts\dev-platform.ps1" -AvecBot
        }
        "3" {
            & "$RedlakesRoot\scripts\dev-platform.ps1"
        }
        "P" {
            Set-Location $RedlakesRoot
            npm run dev
        }
        "4" { Start-DiscordBot }
        "5" { Start-MinecraftServer }
        "6" { Start-MinecraftServer -Dev }
        "7" { Start-McBotIa }
        "8" {
            if (Test-PathOk $RedlakesRoot "REDLAKES") {
                & "$RedlakesRoot\scripts\start-docker.ps1"
            }
        }
        "9" { Start-Process $cfg.ConsoleUrl }
        "O" { Open-Site }
        "S" { Stop-RedlakesStack }
        "I" { Stop-McBotIa }
        "Q" { return $false }
        default {
            Write-Host "  Choix invalide." -ForegroundColor Red
        }
    }
    return $true
}

# Actions rapides (sans menu) pour les .bat
switch ($Action) {
    "tout" {
        & "$RedlakesRoot\scripts\dev-platform.ps1" -AvecBot
        Start-Sleep -Seconds 3
        Start-MinecraftServer -Dev
        exit 0
    }
    "redlakes" {
        & "$RedlakesRoot\scripts\dev-platform.ps1" -AvecBot
        exit 0
    }
    "web" {
        & "$RedlakesRoot\scripts\dev-platform.ps1"
        exit 0
    }
    "bot" {
        Start-DiscordBot
        exit 0
    }
    "mc" {
        Start-MinecraftServer
        exit 0
    }
    "mc-dev" {
        Start-MinecraftServer -Dev
        exit 0
    }
    "stop" {
        Stop-RedlakesStack
        exit 0
    }
}

# Mode menu interactif
while ($true) {
    Show-Menu
    $input = Read-Host "  Votre choix"
    if (-not (Invoke-HubAction $input)) { break }
    Write-Host ""
    Read-Host "  Appuyez sur Entree pour revenir au menu"
}
