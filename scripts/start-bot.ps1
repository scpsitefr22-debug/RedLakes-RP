# Demarre le bot Discord REDLAKES (autonome, node_modules local)
# Le bot est exclu des workspaces npm de la racine : il utilise SES propres
# dependances installees dans apps\discord-bot\node_modules.
$root = Split-Path $PSScriptRoot -Parent
Set-Location "$root\apps\discord-bot"

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
    }
    Write-Host ""
    Write-Host "  Fichier .env cree depuis .env.example." -ForegroundColor Yellow
    Write-Host "  Renseigne DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID" -ForegroundColor Yellow
    Write-Host "  dans apps\discord-bot\.env puis relance ce script." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

if (-not (Test-Path "node_modules\discord.js")) {
    Write-Host "Installation des dependances du bot (node_modules local autonome)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "  Echec de l'installation des dependances du bot." -ForegroundColor Red
        Write-Host ""
        pause
        exit 1
    }
}

Write-Host ""
Write-Host "  Verification de la configuration..." -ForegroundColor Cyan
npm run verify
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  Verification echouee (token ou acces au serveur Discord)." -ForegroundColor Red
    Write-Host "  Lis le message ci-dessus : lien d invitation ou token a corriger." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "  Preparation des salons Discord..." -ForegroundColor Cyan
npm run setup:guild
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  Setup salons echoue - verifie les permissions du bot (Gerer les salons)." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "  Enregistrement des commandes slash..." -ForegroundColor Cyan
npm run deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  Deploy echoue - voir le lien d invitation ci-dessus." -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "  Bot Discord REDLAKES en cours de demarrage..." -ForegroundColor Green
Write-Host "  (Ctrl+C pour arreter)" -ForegroundColor Gray
Write-Host ""

npm run dev
