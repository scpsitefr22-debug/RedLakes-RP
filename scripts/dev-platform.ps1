# Lanceur professionnel REDLAKES RP — Site + API (+ Bot optionnel)
# Usage : npm run dev  |  .\scripts\dev-platform.ps1  |  REDLAKES.bat

param(
    [switch]$AvecBot,
    [switch]$SansDocker,
    [switch]$SansNavigateur
)

$ErrorActionPreference = "Continue"
$root = Split-Path $PSScriptRoot -Parent
. "$PSScriptRoot\lib\launcher-ui.ps1"
. "$PSScriptRoot\launcher-config.ps1"
$cfg = Get-LauncherConfig

Set-Location $root
Write-RedlakesBanner "Lancement plateforme"

Write-Host "  Verification pre-vol" -ForegroundColor Yellow
Write-Host ""
if (-not (Test-LauncherPreflight $root)) {
    Write-Host ""
    Write-Fail "Pre-vol echoue. Corrigez les points ci-dessus puis relancez."
    Write-Host "  Astuce : npm run setup" -ForegroundColor Gray
    Read-Host "  Entree pour fermer"
    exit 1
}

Write-Host ""
Write-Step 1 5 "Arret des instances precedentes"
& "$PSScriptRoot\stop.ps1" | Out-Null
Write-Ok "Ports liberes"

Write-Host ""
Write-Step 2 5 "Base de donnees"
if (-not $SansDocker -and -not (Test-PortListening 5432)) {
    Write-Host "       Demarrage Docker Postgres..." -ForegroundColor DarkGray
    & "$PSScriptRoot\start-docker.ps1"
    Start-Sleep -Seconds 2
}
if (Test-PortListening 5432) {
    Write-Ok "PostgreSQL actif"
} else {
    Write-Warn "PostgreSQL indisponible — l'API demarrera en mode degrade"
}

Write-Host ""
Write-Step 3 5 "API NestJS (port 3001)"
$apiScript = Join-Path $PSScriptRoot "start-api.ps1"
Start-Process powershell.exe -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command", "`$Host.UI.RawUI.WindowTitle='REDLAKES | API :3001'; & '$apiScript'"
)
$apiReady = Wait-ForHttp -Url "$($cfg.ApiUrl)/health" -Label "API" -TimeoutSec 90

Write-Host ""
Write-Step 4 5 "Site Next.js (port 3000)"
$webScript = Join-Path $PSScriptRoot "start-web.ps1"
Start-Process powershell.exe -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command", "`$Host.UI.RawUI.WindowTitle='REDLAKES | Site :3000'; & '$webScript' -SkipStop"
)
$webReady = Wait-ForHttp -Url $cfg.SiteUrl -Label "Site" -TimeoutSec 120

if ($AvecBot) {
    Write-Host ""
    Write-Step 5 5 "Bot Discord"
    $botEnv = Join-Path $root "apps\discord-bot\.env"
    if (Test-Path $botEnv) {
        $botScript = Join-Path $PSScriptRoot "start-bot.ps1"
        Start-Process powershell.exe -ArgumentList @(
            "-NoExit",
            "-ExecutionPolicy", "Bypass",
            "-Command", "`$Host.UI.RawUI.WindowTitle='REDLAKES | Bot Discord'; & '$botScript'"
        )
        Write-Ok "Bot Discord — fenetre ouverte"
    } else {
        Write-Warn "Bot ignore — copiez apps\discord-bot\.env.example vers .env"
    }
} else {
    Write-Host ""
    Write-Host "  [5/5] Bot Discord ignore (ajoutez -AvecBot ou npm run dev:full)" -ForegroundColor DarkGray
}

if (-not $SansNavigateur -and $webReady) {
    Start-Sleep -Seconds 1
    $consoleUrl = "$($cfg.SiteUrl)/console"
    Write-Host ""
    Write-Host "  Ouverture console de controle : $consoleUrl" -ForegroundColor Cyan
    Start-Process $consoleUrl
}

Show-LaunchSummary -SiteUrl $cfg.SiteUrl -WithBot:$AvecBot -ApiReady:$apiReady -WebReady:$webReady

if (-not $apiReady -or -not $webReady) {
    Write-Warn "Certains services mettent plus de temps — consultez les fenetres PowerShell."
}

Read-Host "  Entree pour fermer ce panneau de lancement"
