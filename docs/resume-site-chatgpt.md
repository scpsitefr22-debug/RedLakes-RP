# REDLAKES RP — Résumé complet du site internet (contexte ChatGPT)

> Document de référence pour donner du contexte à une IA sur le projet **site web** REDLAKES RP.  
> Dernière mise à jour : juillet 2026. Monorepo : `redlakes-rp`.

---

## 1. Vision & univers RP

**REDLAKES RP** est un serveur Minecraft roleplay dans l'univers **SCP / Fondation**, centré sur le **Site-12** (branche principale du complexe REDLAKES).

Le **site internet** (`apps/web`) remplit deux rôles :

1. **Encyclopédie immersive** — lore, wiki SCP, factions, départements, personnages, chronologie (thème Fondation classifiée).
2. **Outil RP actif** — dossier agent, intranet, rapports RP, transmissions Discord, candidatures, registre joueurs, staff.

Le serveur est en **pré-ouverture** (`serverOpen: false` dans `apps/web/src/config/site.ts`). L'encyclopédie et les candidatures sont ouvertes ; le gameplay Minecraft arrive plus tard.

**IP serveur** : `play.redlakes.fr`  
**Discord** : https://discord.gg/d5DqcZEJkn

---

## 2. Stack technique

| Couche | Technologie | Port / URL |
|--------|-------------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind v4, Framer Motion | `http://localhost:3000` |
| API (backend séparé) | NestJS, Prisma, PostgreSQL | `http://localhost:3001/api` |
| Proxy Next | Rewrites `/api/*` → API NestJS | Config dans `next.config.ts` |
| Base de données | PostgreSQL (Docker) | `localhost:5432` |
| Recherche | Elasticsearch (Docker) | `localhost:9200` |
| Bot Discord | discord.js (hors scope site, mais lié) | Sync grades, transmissions |
| Plugin MC | Paper `RedLakesSync` (optionnel) | `POST /api/sync/role` |

Le site appelle l'API via **`/api`** (proxy) côté client avec `credentials: "include"` (cookie session).

---

## 3. Authentification & session

### Méthodes de connexion

| Mode | Route | Usage |
|------|-------|-------|
| **Discord OAuth** (principal) | `GET /api/auth/discord` | Compte lié au profil joueur |
| **Dev-login** (pré-ouverture) | `POST /api/auth/dev-login` | Pseudo Minecraft, tests locaux |
| **Microsoft OAuth** (futur) | `GET /api/auth/minecraft` | Désactivé (`microsoftOAuthEnabled: false`) |

### Session

- Cookie HTTP-only : `redlakes_token`
- Vérification : `GET /api/auth/me` → `{ authenticated, user: { username, role, clearance, ... } }`
- Déconnexion : `POST /api/auth/logout`

### Middleware Next.js (`apps/web/src/middleware.ts`)

Routes **protégées** (cookie requis, sinon redirect `/connexion?redirect=...`) :

- `/dashboard`
- `/intranet`
- `/staff`
- `/lore/cms`
- `/archives`

### Liaison Discord (depuis le dashboard)

1. Joueur génère un code : `POST /api/auth/discord/code`
2. Sur Discord : `/link CODE`
3. Sync pseudo + grade : `/sync-roles` (bot)
4. Déliaison : `POST /api/auth/discord/unlink`

---

## 4. Système d'habilitation (clearance)

Niveaux **1 à 5** (style Fondation SCP) :

| Niveau | Label |
|--------|-------|
| 1 | Personnel de base |
| 2 | Personnel restreint |
| 3 | Personnel confidentiel |
| 4 | Personnel secret |
| 5 | Personnel top secret |

- Stockée en base sur `Player.clearance`
- **Dérivée automatiquement du grade** à chaque sync Minecraft/Discord
- **Visiteur non connecté** = niveau 1 par défaut
- Hook React : `usePlayerSession()` dans `apps/web/src/hooks/usePlayerSession.ts`

### Où c'est appliqué sur le site

| Page / composant | Comportement |
|------------------|--------------|
| `/transmissions` | Contenu expurgé si clearance insuffisante |
| `/archives` | Connexion requise + clearance réelle |
| `/lore`, `/lore/[slug]` | Articles filtrés / expurgés |
| `/personnages`, `/personnages/[id]` | Dossiers masqués si niveau trop bas |
| `/intranet` | Affiche secteurs accessibles selon grade |

### Grades & accès site

- Catalogue grades : `apps/web/src/data/rp-grades.ts` (~70+ grades Site-12)
- Matrice accès : `apps/web/src/lib/grade-access.ts` → `canAccessSiteSection(grade, section)`
- Pseudo Discord format : `{Grade} · Prénom Nom` (identité RP)

---

## 5. Cartographie des pages

### 5.1 Accueil & navigation

| Route | Type | Description |
|-------|------|-------------|
| `/` | Statique + composants | Hero, previews lore/factions/transmissions, section recrutement, Coming Soon |
| Header | Client | Menu encyclopédie, organisations, systèmes ; `HeaderAuth` si connecté |

### 5.2 Encyclopédie (contenu majoritairement statique `src/data/`)

| Route | Source données | Habilitation |
|-------|----------------|--------------|
| `/wiki`, `/wiki/[id]` | `data/scp.ts` | Badges niveau, pas encore de gating client complet |
| `/lore`, `/lore/[id]` | Statique + **CMS API** fusionnés (`lib/lore-feed.ts`) | **Gating actif** |
| `/personnages`, `/personnages/[id]` | `data/lore.ts` (characters) | **Gating actif** |
| `/evenements`, `/evenements/[id]` | `data/lore.ts` (gameEvents) | Statique |
| `/chronologie` | `data/timeline.ts` | Statique |
| `/factions`, `/factions/[id]`, `/factions/mtf` | `data/factions.ts` | Statique ; highlight grade si connecté |
| `/departements`, `/departements/site-12`, `/departements/[id]` | `data/site12.ts` | Statique |
| `/carte` | `data/map.ts` | Repères narratifs (pas vraie carte MC) |
| `/cassie` | Règles keyword + recherche locale | Assistant simulé (pas vraie IA) |

### 5.3 Systèmes RP connectés à l'API

| Route | Auth | API utilisée | Rôle RP |
|-------|------|--------------|---------|
| `/connexion` | — | `/auth/me`, `/auth/dev-login`, OAuth Discord | Terminal d'identification |
| `/dashboard` | Oui | `/players/me`, `/applications/me`, liaison Discord | Dossier agent personnel |
| `/intranet` | Oui | `/reports`, `/players/me` | Rapports RP (incident, autorisation, mémo, matériel) |
| `/staff` | Oui + rôle STAFF/ADMIN | `/applications`, `/reports` | Traiter candidatures & rapports |
| `/candidatures` | Connexion pour soumettre | `POST /applications`, `GET /applications/me` | Recrutement pré-ouverture |
| `/joueurs`, `/joueurs/[username]` | Public | `GET /players`, `GET /players/:username` | Registre personnel Site-12 |
| `/transmissions` | Optionnel (clearance réelle si connecté) | `GET /transmissions` | Flux Discord → rapports classifiés |
| `/archives` | Oui | Lore CMS + statique classifié | Documents niveau 3+ |
| `/galerie` | Public | `GET /gallery` | Screenshots / assets |
| `/lore/cms`, `/lore/cms/nouveau`, `/lore/cms/[id]` | Oui (staff) | CRUD `/lore` | Édition lore par le staff |

### 5.4 Actualités

| Route | Source |
|-------|--------|
| `/actualites`, `/actualites/[id]` | `data/news.ts` (statique) |
| Section accueil `NewsSection` | **Fusion** transmissions API (`ANNOUNCE`, `EVENT`) + news statiques |

---

## 6. Flux RP joueur (boucle complète)

```
1. Connexion site (/connexion) — Discord OAuth ou dev-login
2. Dashboard (/dashboard) — identité RP (prénom/nom), liaison Discord
3. Plugin Minecraft ou /sync-roles — grade + clearance synchronisés
4. Intranet (/intranet) — déposer un rapport RP (incident, autorisation…)
5. Staff (/staff) + webhook Discord — traitement du rapport
6. Transmissions (/transmissions) — activité Discord visible selon habilitation
7. Registre (/joueurs) — fiche publique avec grade, médailles, identité RP
```

### Identité RP

- Champs : `rpFirstName`, `rpLastName` (base `Player`)
- Mise à jour site : `PATCH /api/players/me`
- Bot Discord : `/identite prenom nom`
- Pseudo Discord auto : `{Grade} · Prénom Nom`

### Rapports RP (intranet)

Types Prisma : `INCIDENT`, `AUTHORIZATION`, `MEMO`, `EQUIPMENT`  
Statuts : `PENDING`, `REVIEWED`, `ARCHIVED`

| Action | Endpoint |
|--------|----------|
| Déposer | `POST /api/reports` |
| Mes rapports | `GET /api/reports/me` |
| Staff liste | `GET /api/reports` |
| Traiter | `PATCH /api/reports/:id/review` |

### Candidatures

Types API : `STAFF`, `MTF`, `RECHERCHE`, `ADMINISTRATION`  
Le formulaire web propose aussi LORE et BUILD (mappés dans le texte `[Poste visé : …]`).

| Action | Endpoint |
|--------|----------|
| Soumettre | `POST /api/applications` |
| Mes candidatures | `GET /api/applications/me` |
| Staff | `GET /api/applications?status=PENDING` |
| Valider/refuser | `PATCH /api/applications/:id/review` |

---

## 7. Transmissions Discord → Site

Le bot Discord envoie les événements publics à `POST /api/sync/discord/event`.  
Stockés en `DiscordTransmission`, exposés via `GET /api/transmissions`.

Types : `MESSAGE`, `ANNOUNCE`, `MEMBER_JOIN`, `MEMBER_LEAVE`, `EVENT`, `BOOST`

Affichage RP :
- Pseudos **codifiés** (pas de données privées brutes)
- Chaque transmission a un `clearance` requis
- Contenu expurgé si joueur sous le niveau requis

---

## 8. CMS Lore (staff)

- Liste admin : `GET /api/lore/cms` (STAFF/ADMIN)
- Public : `GET /api/lore?clearance=N` et `GET /api/lore/:slug`
- CRUD : `POST`, `PATCH`, `DELETE /api/lore/:id`
- Catégories : MONDE, SITE, CHRONOLOGIE, GUERRES, CATASTROPHES, PERSONNAGES, SCP, FACTION, EVENEMENT
- Articles publiés indexés dans Elasticsearch
- Fusion front : statique (`data/lore.ts`) + CMS, dédoublonnage par slug

---

## 9. Structure fichiers web (`apps/web/src/`)

```
app/                    # Pages Next.js App Router
  dashboard/              # Dossier agent
  intranet/               # Terminal rapports RP
  staff/                  # Dashboard staff
  connexion/              # Login
  candidatures/           # Recrutement
  joueurs/                # Registre + fiches
  transmissions/          # Flux classifié Discord
  archives/               # Docs classifiés
  lore/                   # Encyclopédie (fusion CMS)
  lore/cms/               # Édition staff
  wiki/, factions/, departements/, personnages/, evenements/, chronologie/, carte/, cassie/, galerie/, actualites/

components/
  auth/                   # RpLoginTerminal
  clearance/              # ClearanceBanner
  intranet/               # IntranetTerminal
  staff/                  # StaffDashboard
  lore/                   # LoreCatalog, LoreArticleReader, LoreEditor
  transmissions/          # TransmissionsFeed, TransmissionsFeedConnected
  layout/                 # Header, HeaderAuth, Footer, GlobalSearch
  home/                   # Sections page d'accueil

data/                     # Contenu statique encyclopédie
  lore.ts, scp.ts, factions.ts, site12.ts, timeline.ts, news.ts, map.ts, rp-grades.ts

hooks/
  usePlayerSession.ts     # Session + clearance

lib/
  api.ts                  # apiFetch, API_PROXY, API_URL
  lore-feed.ts            # Fusion lore statique + CMS
  grade-access.ts         # Matrice accès par grade
  clearance.ts            # Labels niveaux 1-5
  transmissions.ts        # Fetch transmissions

config/site.ts            # Flags pré-ouverture, Discord, OAuth
middleware.ts             # Protection routes authentifiées
```

---

## 10. API endpoints utilisés par le site (référence rapide)

```
GET  /auth/me
GET  /auth/discord
POST /auth/dev-login
POST /auth/logout
POST /auth/discord/code
POST /auth/discord/unlink

GET  /players
GET  /players/me
PATCH /players/me
GET  /players/:username

POST /applications
GET  /applications/me
GET  /applications?status=PENDING
PATCH /applications/:id/review

POST /reports
GET  /reports/me
GET  /reports
PATCH /reports/:id/review

GET  /lore?clearance=N
GET  /lore/:slug
GET  /lore/cms
POST /lore
PATCH /lore/:id
DELETE /lore/:id

GET  /transmissions?limit=N
GET  /gallery
GET  /search?q=
```

---

## 11. État actuel & limites connues

### Fonctionnel / RP-actif
- Dashboard, intranet, rapports, staff, candidatures (avec session)
- Transmissions avec clearance réelle
- Lore CMS fusionné sur `/lore`
- Registre joueurs synchronisé API
- Header avec état connecté
- Middleware auth sur routes sensibles

### Encore statique ou partiel
- Wiki SCP, événements, chronologie — pas de gating clearance client
- CASSIE — assistant keyword, pas LLM
- Carte — repères fictifs, pas carte Minecraft réelle
- Actualités détail (`/actualites/[id]`) — statique uniquement
- `serverOpen: false` — bannière pré-ouverture sur l'accueil

### Dépendances externes pour données live
- API + PostgreSQL doivent tourner pour joueurs, rapports, candidatures
- Bot Discord pour alimenter les transmissions
- Plugin Minecraft `RedLakesSync` pour sync grades automatique (sinon dev-login + sync manuelle)

---

## 12. Design & identité visuelle

- Thème **dark / Fondation SCP** : noir, rouge « redlake », effets hologramme (`hologram-border`)
- Typo mono pour éléments « terminal / classifié »
- Composants : Lucide icons, badges `Niv. X`, texte expurgé `████████ — ACCÈS REFUSÉ`
- Langue interface : **français**

---

## 13. Variables d'environnement (site)

```env
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
API_URL=http://localhost:3001/api   # SSR / rewrites
```

Cookie session posé par l'API sur le domaine du site (proxy `/api`).

---

## 14. Commandes utiles (développement)

```powershell
# Tout lancer
.\Lancer-REDLAKES.bat

# Site seul
cd apps/web && npm run dev

# API seule
cd apps/api && npm run start:dev

# Base de données
cd apps/api && npx prisma db push
```

---

## 15. Instructions pour ChatGPT

Quand tu travailles sur ce projet :

1. **Réponds en français** sauf demande contraire.
2. Le site est un **outil RP**, pas une simple vitrine — privilégier connexion joueur, habilitation, flux staff.
3. Modifications site = dossier **`apps/web`** sauf si endpoint API manquant.
4. Next.js **16** — conventions peuvent différer de versions antérieures.
5. Ne pas casser le proxy `/api` — utiliser `apiFetch` et `credentials: "include"`.
6. Respecter le système **clearance 1-5** pour tout contenu classifié.
7. Pré-ouverture : `devLoginEnabled: true` est normal en local.
8. Contenu encyclopédique canon = `apps/web/src/data/` ; contenu éditable staff = CMS `/lore/cms`.

---

*Fin du document — REDLAKES RP Site-12*
