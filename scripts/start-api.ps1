# Demarre l'API NestJS (port 3001)
$root = Split-Path $PSScriptRoot -Parent
Set-Location "$root\apps\api"

$Host.UI.RawUI.WindowTitle = "REDLAKES | API :3001"

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
    }
}

if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dependances API..." -ForegroundColor Yellow
    npm install
    npx prisma generate
}

Write-Host ""
Write-Host "  +----------------------------------------+" -ForegroundColor DarkRed
Write-Host "  |  REDLAKES API  :  http://localhost:3001/api" -ForegroundColor Green
Write-Host "  +----------------------------------------+" -ForegroundColor DarkRed
Write-Host "  Ctrl+C pour arreter" -ForegroundColor DarkGray
Write-Host ""

npm run start:dev
