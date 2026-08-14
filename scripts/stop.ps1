# Arrete proprement les serveurs REDLAKES (node.js sur ports 3000 et 3001)
$ErrorActionPreference = "SilentlyContinue"
$root = Split-Path $PSScriptRoot -Parent

Write-Host "Arret des serveurs REDLAKES..." -ForegroundColor Yellow

function Stop-Port($port) {
    $pids = @()
    $netstat = netstat -ano | Select-String ":$port\s" | Select-String "LISTENING"
    foreach ($line in $netstat) {
        $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
        $pid = [int]$parts[-1]
        if ($pid -gt 0) { $pids += $pid }
    }
    $pids = $pids | Select-Object -Unique
    foreach ($pid in $pids) {
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  Port $port -> PID $pid ($($proc.ProcessName))" -ForegroundColor Gray
            taskkill /PID $pid /F 2>&1 | Out-Null
        }
    }
}

Stop-Port 3000
Stop-Port 3001

# Tuer les processus node orphelins lies au projet
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ForEach-Object {
    if ($_.CommandLine -match "redlakes-rp|next dev|nest start") {
        Write-Host "  Node orphelin -> PID $($_.ProcessId)" -ForegroundColor Gray
        taskkill /PID $_.ProcessId /F 2>&1 | Out-Null
    }
}

# Nettoyer le cache Next.js (evite erreurs Turbopack)
$nextCache = Join-Path $root "apps\web\.next"
if (Test-Path $nextCache) {
    Remove-Item $nextCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  Cache .next supprime" -ForegroundColor Gray
}


Start-Sleep -Milliseconds 500
Write-Host "Serveurs arretes." -ForegroundColor Green
