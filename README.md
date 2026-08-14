# REDLAKES RP — Site Officiel (Minecraft)

Encyclopédie immersive SCP / DarkRP pour le serveur Minecraft **REDLAKES RP**.

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 16, TypeScript, TailwindCSS v4, Framer Motion |
| Backend | NestJS, Prisma, PostgreSQL |
| Auth | Microsoft OAuth → profil Minecraft Java |
| Recherche | Elasticsearch (+ fallback SQL) |
| Infra | Docker Compose (PostgreSQL + Elasticsearch) |

## Démarrage rapide (Windows)

### Première installation (une seule fois)

```powershell
cd C:\Users\flech\Projects\redlakes-rp
.\scripts\setup.ps1
```

Ou double-cliquez sur **`Lancer-REDLAKES.bat`** après le setup.

### Lancer le projet (3 méthodes)

**Méthode 1 — Tout en un (recommandé)**  
Double-cliquez `Lancer-REDLAKES.bat`  
Ou en PowerShell :
```powershell
cd C:\Users\flech\Projects\redlakes-rp
.\scripts\start.ps1
```
Ouvre 2 fenêtres : API (3001) + Site (3000).

**Méthode 2 — Site uniquement**
```powershell
.\scripts\start-web.ps1
```

**Méthode 3 — Manuellement**
```powershell
# Terminal 1 — API
cd apps\api
npm run start:dev

# Terminal 2 — Site
cd apps\web
npm run dev
```

### Arrêter

```powershell
.\scripts\stop.ps1
```
Ou double-cliquez **`Arreter-REDLAKES.bat`**.

> Si vous voyez *"Port 3000 is in use"* ou *"Another next dev server is already running"*, lancez d'abord `.\scripts\stop.ps1`.

## Démarrage rapide (détaillé)

### 1. Services (Docker Desktop requis)

```bash
docker compose up -d
```

### 2. Base de données

```bash
cd apps/api
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
```

### 3. API

```bash
cd apps/api
npm run start:dev
# → http://localhost:3001/api
```

### 4. Frontend

```bash
cd apps/web
cp .env.local.example .env.local
npm run dev
# → http://localhost:3000
```

## Auth Minecraft

- **Production** : `GET /api/auth/minecraft` → Microsoft OAuth → profil Minecraft
- **Développement** : connexion via pseudo sur `/dashboard` (`POST /api/auth/dev-login`)

Configurer dans `apps/api/.env` :
```
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_REDIRECT_URI=http://localhost:3001/api/auth/microsoft/callback
```

## API Endpoints

| Route | Description |
|-------|-------------|
| `GET /api/auth/me` | Session joueur |
| `GET /api/players` | Liste joueurs publics |
| `GET /api/players/me` | Tableau de bord |
| `POST /api/applications` | Candidature |
| `GET /api/lore` | Articles publiés |
| `GET /api/lore/cms` | CMS staff |
| `POST /api/lore` | Créer article (staff) |
| `GET /api/search?q=` | Recherche Elasticsearch |
| `GET /api/gallery` | Assets galerie |

## Serveur Minecraft

```
play.redlakes.fr
```

## Structure

```
apps/web/     → Site encyclopédique Next.js
apps/api/     → API NestJS + Prisma
docker-compose.yml → PostgreSQL + Elasticsearch
```

## CMS Lore (Staff)

1. Se connecter via `/dashboard` (compte staff/admin)
2. Accéder à `/lore/cms`
3. Les articles publiés sont indexés dans Elasticsearch automatiquement
