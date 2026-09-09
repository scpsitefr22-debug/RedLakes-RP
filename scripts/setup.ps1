# Installation initiale REDLAKES RP
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

Write-Host "=== SETUP REDLAKES RP ===" -ForegroundColor Cyan

# Web
Write-Host "`n[1/3] Installation frontend..." -ForegroundColor Yellow
Set-Location "$root\apps\web"
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "  .env.local cree" -ForegroundColor Gray
}
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }

# API
Write-Host "`n[2/3] Installation API..." -ForegroundColor Yellow
Set-Location "$root\apps\api"
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  .env cree" -ForegroundColor Gray
}
npm install
npx prisma generate
if ($LASTEXITCODE -ne 0) { exit 1 }

# Migrations (base de donnees Neon distante — voir DATABASE_URL dans apps/api/.env)
Write-Host "`n[3/3] Migrations base de donnees..." -ForegroundColor Yellow
Set-Location "$root\apps\api"
npx prisma migrate dev --name init 2>&1
npx prisma db seed 2>&1

Set-Location $root
Write-Host "`n=== SETUP TERMINE ===" -ForegroundColor Green
Write-Host "Lancez la plateforme :" -ForegroundColor Cyan
Write-Host "  REDLAKES.bat   ou   npm run dev" -ForegroundColor White
Write-Host "  Lancer-HUB.bat pour le centre de commandement complet" -ForegroundColor Gray
