# Demarre le site Next.js (port 3000)
param([switch]$SkipStop)

$root = Split-Path $PSScriptRoot -Parent

if (-not $SkipStop) {
    & "$PSScriptRoot\stop.ps1"
}

Set-Location "$root\apps\web"

$Host.UI.RawUI.WindowTitle = "REDLAKES | Site :3000"

if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.local.example") {
        Copy-Item ".env.local.example" ".env.local"
    }
}

if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dependances web..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "  +----------------------------------------+" -ForegroundColor DarkRed
Write-Host "  |  REDLAKES SITE :  http://localhost:3000" -ForegroundColor Green
Write-Host "  |  CONSOLE       :  http://localhost:3000/console" -ForegroundColor Cyan
Write-Host "  +----------------------------------------+" -ForegroundColor DarkRed
Write-Host "  Ctrl+C pour arreter" -ForegroundColor DarkGray
Write-Host ""

npm run dev
