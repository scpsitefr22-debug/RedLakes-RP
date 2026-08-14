# Demarre PostgreSQL + Elasticsearch via Docker
# Gere les conteneurs deja presents (meme hors du projet compose actuel) sans conflit de nom.
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

Write-Host "Demarrage Docker (PostgreSQL + Elasticsearch)..." -ForegroundColor Cyan

$dockerOk = $false
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) { $dockerOk = $true }
} catch {}

if (-not $dockerOk) {
    Write-Host "Docker Desktop n'est pas lance." -ForegroundColor Red
    exit 1
}

function Test-ContainerExists([string]$Name) {
    docker inspect $Name 2>$null | Out-Null
    return $LASTEXITCODE -eq 0
}

function Test-ContainerRunning([string]$Name) {
    if (-not (Test-ContainerExists $Name)) { return $false }
    $state = docker inspect -f "{{.State.Running}}" $Name 2>$null
    return $state -eq "true"
}

function Ensure-Container([string]$Name, [string]$ComposeService) {
    if (Test-ContainerExists $Name) {
        if (-not (Test-ContainerRunning $Name)) {
            Write-Host "  Demarrage conteneur existant : $Name" -ForegroundColor Yellow
            docker start $Name 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Host "  Echec demarrage $Name" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "  Deja actif : $Name" -ForegroundColor DarkGray
        }
        return $true
    }

    Write-Host "  Creation via compose : $ComposeService" -ForegroundColor Yellow
    docker compose up -d $ComposeService 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Echec creation $Name ($ComposeService)" -ForegroundColor Red
        return $false
    }
    return $true
}

$pgOk = Ensure-Container "redlakes-postgres" "postgres"
$esOk = Ensure-Container "redlakes-elasticsearch" "elasticsearch"

if ($pgOk -and $esOk) {
    Write-Host ""
    Write-Host "Docker OK" -ForegroundColor Green
    Write-Host "  PostgreSQL    : localhost:5432  (conteneur redlakes-postgres)" -ForegroundColor Gray
    Write-Host "  Elasticsearch : localhost:9200  (conteneur redlakes-elasticsearch)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Note : si postgres date d'une ancienne install, c'est normal." -ForegroundColor DarkGray
    Write-Host "       Pour repartir a zero : docker rm -f redlakes-postgres redlakes-elasticsearch" -ForegroundColor DarkGray
    Write-Host "       puis relancez l option [8]." -ForegroundColor DarkGray
    exit 0
}

Write-Host ""
Write-Host "Echec partiel - verifiez : docker ps -a --filter name=redlakes" -ForegroundColor Red
exit 1
