# Chemins du centre de commandement REDLAKES
# Le depot est detecte automatiquement depuis scripts/

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$script:LauncherConfig = @{
    RedlakesRoot = $repoRoot
    McServerRoot = "C:\Users\flech\Documents\Serveur_SCP"
    SiteUrl      = "http://localhost:3000"
    ApiUrl       = "http://localhost:3001/api"
    McBotIaUrl   = "http://127.0.0.1:8766/health"
    ConsoleUrl   = "http://localhost:3000/console"
}

function Get-LauncherConfig {
    return $script:LauncherConfig
}
