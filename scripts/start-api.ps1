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

$pgListening = netstat -ano 2>$null | Select-String ":5432\s" | Select-String "LISTENING"
if (-not $pgListening) {
    Write-Host "  ATTENTION : PostgreSQL (port 5432) non detecte." -ForegroundColor Yellow
    Write-Host "  1. Lance Docker Desktop" -ForegroundColor Yellow
    Write-Host "  2. Lancer-HUB.bat -> option 8 (Docker Postgres)" -ForegroundColor Yellow
    Write-Host "  3. Relance ce script API" -ForegroundColor Yellow
    Write-Host ""
    $dockerExe = "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerExe) {
        Write-Host "  Tentative d'ouverture de Docker Desktop..." -ForegroundColor Cyan
        Start-Process $dockerExe -ErrorAction SilentlyContinue
        Write-Host "  Attends 30-60 s que Docker soit pret, puis option 8 du HUB." -ForegroundColor Gray
        Write-Host ""
    }
}

npm run start:dev
