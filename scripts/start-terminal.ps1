# Demarre le prototype REDLAKES TERMINAL (port 3020)
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

Write-Host "Build narrative-core..." -ForegroundColor Cyan
npm run build -w @redlakes/narrative-core
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Lancement terminal sur http://localhost:3020" -ForegroundColor Green
npm run dev -w terminal
