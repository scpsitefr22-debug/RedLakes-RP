# UI partagée — lanceurs REDLAKES RP

function Write-RedlakesBanner {
    param([string]$Subtitle = "Plateforme RP Site-12")
    Clear-Host
    Write-Host ""
    Write-Host "  +----------------------------------------------------------+" -ForegroundColor DarkRed
    Write-Host "  |                                                          |" -ForegroundColor DarkRed
    Write-Host "  |     R E D L A K E S   R P                                |" -ForegroundColor Red
    Write-Host "  |     $Subtitle" -ForegroundColor DarkGray
    Write-Host "  |                                                          |" -ForegroundColor DarkRed
    Write-Host "  +----------------------------------------------------------+" -ForegroundColor DarkRed
    Write-Host ""
}

function Write-Step {
    param(
        [int]$Number,
        [int]$Total,
        [string]$Message
    )
    Write-Host "  [$Number/$Total] $Message" -ForegroundColor Cyan
}

function Write-Ok { param([string]$Message) Write-Host "       OK  $Message" -ForegroundColor Green }
function Write-Warn { param([string]$Message) Write-Host "       !!  $Message" -ForegroundColor Yellow }
function Write-Fail { param([string]$Message) Write-Host "       XX  $Message" -ForegroundColor Red }

function Test-PortListening {
    param([int]$Port)
    return [bool](netstat -ano 2>$null | Select-String ":$Port\s" | Select-String "LISTENING")
}

function Wait-ForHttp {
    param(
        [string]$Url,
        [int]$TimeoutSec = 90,
        [string]$Label = "Service"
    )
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    $dots = 0
    while ((Get-Date) -lt $deadline) {
        try {
            $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) {
                Write-Host ""
                Write-Ok "$Label disponible ($Url)"
                return $true
            }
        } catch {
            # retry
        }
        $dots = ($dots + 1) % 4
        $pad = "." * $dots
        Write-Host "`r       ... attente $Label$pad   " -NoNewline -ForegroundColor DarkGray
        Start-Sleep -Seconds 2
    }
    Write-Host ""
    Write-Warn "$Label non joignable apres ${TimeoutSec}s ($Url)"
    return $false
}

function Test-LauncherPreflight {
    param([string]$Root)

    $ok = $true

    try {
        $nv = node --version 2>$null
        Write-Ok "Node.js $nv"
    } catch {
        Write-Fail "Node.js absent — https://nodejs.org"
        $ok = $false
    }

    $apiEnv = Join-Path $Root "apps\api\.env"
    $webEnv = Join-Path $Root "apps\web\.env.local"
    $apiEx = Join-Path $Root "apps\api\.env.example"
    $webEx = Join-Path $Root "apps\web\.env.local.example"

    if (-not (Test-Path $apiEnv) -and (Test-Path $apiEx)) {
        Copy-Item $apiEx $apiEnv
        Write-Warn "apps\api\.env cree depuis .env.example"
    }
    if (-not (Test-Path $webEnv) -and (Test-Path $webEx)) {
        Copy-Item $webEx $webEnv
        Write-Warn "apps\web\.env.local cree depuis .env.example"
    }

    if (Test-Path $apiEnv) { Write-Ok "Configuration API" } else {
        Write-Fail "apps\api\.env manquant — lancez npm run setup"
        $ok = $false
    }
    if (Test-Path $webEnv) { Write-Ok "Configuration site" } else {
        Write-Warn "apps\web\.env.local absent (valeurs par defaut)"
    }

    if (Test-PortListening 5432) {
        Write-Ok "PostgreSQL (5432)"
    } else {
        Write-Warn "PostgreSQL arrete — lancez npm run db:up ou HUB [8]"
    }

    return $ok
}

function Show-LaunchSummary {
    param(
        [string]$SiteUrl = "http://localhost:3000",
        [switch]$WithBot,
        [switch]$ApiReady,
        [switch]$WebReady
    )
    Write-Host ""
    Write-Host "  +-- Services ------------------------------------------------+" -ForegroundColor DarkGray
    $apiTag = if ($ApiReady) { "[ON ]" } else { "[...]" }
    $webTag = if ($WebReady) { "[ON ]" } else { "[...]" }
    $apiColor = if ($ApiReady) { "Green" } else { "Yellow" }
    $webColor = if ($WebReady) { "Green" } else { "Yellow" }
    Write-Host "  $apiTag API        http://localhost:3001/api" -ForegroundColor $apiColor
    Write-Host "  $webTag Site       $SiteUrl" -ForegroundColor $webColor
    Write-Host "  [   ] Console    ${SiteUrl}/console" -ForegroundColor Cyan
    if ($WithBot) {
        Write-Host "  [   ] Bot Discord  fenetre dediee" -ForegroundColor Gray
    }
    Write-Host "  +-----------------------------------------------------------+" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  Arret : npm run stop  ou  Arreter-REDLAKES.bat" -ForegroundColor DarkGray
    Write-Host ""
}
