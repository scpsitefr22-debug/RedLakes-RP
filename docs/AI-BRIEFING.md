# REDLAKES RP / REDLAKES CORE — Briefing technique complet pour IA

> Document généré pour transmettre à une autre IA (ou à un futur agent) une compréhension complète et immédiatement actionnable de ce dépôt. Il ne remplace pas la lecture du code mais permet de s'orienter sans tout redécouvrir. Dernière mise à jour : 15/08/2026.

---

## 1. Qu'est-ce que ce projet

**REDLAKES RP** est un serveur Minecraft de roleplay SCP/DarkRP francophone. Ce dépôt est son écosystème web complet : un site Next.js encyclopédique/immersif, une API NestJS + PostgreSQL, un bot Discord, un plugin serveur Minecraft, et des outils annexes (terminal narratif, extraction PDF).

Le projet est en pleine transformation architecturale vers **« REDLAKES CORE »** : faire du site web (Next.js + API + PostgreSQL) la **source de vérité unique** de toutes les données RP (grades, factions, départements, joueurs...), Discord et Minecraft devenant de simples **clients** qui lisent/appliquent ces données au lieu de les définir chacun de leur côté dans des fichiers statiques dupliqués.

Le document de référence de cette transformation est **[`docs/REDLAKES-CORE-SPEC.md`](../docs/REDLAKES-CORE-SPEC.md)** — à lire en complément de celui-ci, il contient la philosophie complète, le tableau des « lots » (batches) déjà livrés, et les modèles de données prévus mais pas encore créés.

### Règle de travail absolue (imposée par l'utilisateur, à respecter strictement)

> **CONSERVER → ADAPTER → ENRICHIR → REMPLACER UNIQUEMENT SI NÉCESSAIRE**

- Ne jamais reconstruire une fonctionnalité qui marche déjà.
- Ne jamais refaire la page d'accueil, la direction artistique (DA) ou la navigation sans demande explicite.
- Travailler par petits lots (« lots ») vérifiés un par un : modification de schéma → migration → seed/backfill si besoin → `tsc --noEmit` + lint + build → **vérification contre une vraie base de données vivante** → commit avec message honnête (dire explicitement si la vérification n'a pas pu être faite).
- Ne jamais supprimer de données existantes (Lore, Wiki, SCP, Actualités, Chronologie, CMS, Rapports, Candidatures).

### Vision produit (directive explicite de l'utilisateur, priorité haute)

> « Je ne veux pas un site qui affiche des informations. Je veux que le visiteur ait l'impression d'entrer dans un véritable univers […] Notre objectif est de créer la référence des serveurs RP, avec un site qui puisse rivaliser avec celui d'un véritable jeu AAA. »

Conséquences concrètes attendues :
- Identité visuelle **forte et unique**, interface immersive et moderne, animations discrètes mais qualitatives, navigation intuitive.
- Chaque faction (Fondation SCP, Police, Gouvernement, Entreprises, AEGIS, Insurrection du Chaos, Main du Serpent, GOC, Crime organisé) doit avoir sa **propre identité visuelle réellement distincte** (pas juste une couleur d'accent différente) — décision validée : « univers visuels vraiment distincts par faction ».
- Préférence forte pour **une fonctionnalité parfaitement réalisée plutôt que dix fonctionnalités moyennes**.
- Élimination **progressive** de toutes les données statiques : le site doit réagir en direct aux changements dans l'API/la base.
- Le premier chantier de refonte visuelle choisi par l'utilisateur : les **pages Factions** (`/factions/*`), actuellement encore alimentées par des fichiers statiques (`data/factions.ts`, `data/faction-role-catalog.ts`) — chantier commencé via un agent de design en isolation (`git worktree`), **interrompu, non terminé, non revu** (voir section 10).

Autre directive majeure et récente (satisfaite) : **« sa serait magnifique que je puisse modifier directement le site VIA le site lui même »** → l'utilisateur veut pouvoir éditer les données RP (en commençant par les Grades) directement depuis une interface staff du site, sans passer par du code ou la base de données à chaque fois. C'est fait pour les Grades (voir section 6.6).

---

## 2. Stack technique

| Couche | Techno | Détails |
|---|---|---|
| Frontend | **Next.js 16** (App Router, **Turbopack**), React 19, TypeScript | ⚠️ Next.js 16 a des breaking changes vs les connaissances d'entraînement d'un LLM — voir `apps/web/AGENTS.md` : « lire la doc dans `node_modules/next/dist/docs/` avant d'écrire du code » |
| Style | **Tailwind CSS v4** (thème via custom properties CSS dans `globals.css`, pas de config JS classique) | + Framer Motion pour les animations |
| Backend | **NestJS** + **Prisma ORM** + **PostgreSQL** | Architecture modules/controllers/services/guards classique Nest |
| Auth | Discord OAuth2 (connexion site), Microsoft OAuth (profil Minecraft Java, prod), Dev Login (pseudo direct en dev) | Sessions + cookies, RBAC par rôle (`PLAYER`/`STAFF`/`ADMIN`) via `AuthGuard` + `RolesGuard` + décorateur `@Roles()` |
| Recherche | Elasticsearch **avec fallback SQL automatique** si indisponible (volontairement pas lancé en local actuellement) | |
| Base de données | **PostgreSQL hébergé sur Neon** (cloud, gratuit) — voir section 5, migration depuis Docker local suite à une panne irréparable de Docker Desktop | |
| Bot Discord | **discord.js v14** | Client CORE progressif (voir section 7) |
| Terminal narratif | Vite + TS (`apps/terminal`), consomme `packages/narrative-core` | Outil séparé, peu prioritaire actuellement |
| Serveur Minecraft réel | **Mohist 1.12.2 + Forge 14.23.5.2860 + Java 8** | ⚠️ **PAS Paper/Spigot moderne, PAS Java 21** — erreur corrigée explicitement par l'utilisateur en session, à ne jamais reproduire. Le plugin `redlakes-sync` doit cibler `Spigot/PaperSpigot 1.12.2-R0.1-SNAPSHOT` + Java 8, jamais 1.21/Java 21. |
| Monorepo | npm workspaces (`apps/*`, `packages/*`, hors `apps/discord-bot` qui a son propre `package.json` séparé) | |

---

## 3. Structure du dépôt

```
redlakes-rp/
├── apps/
│   ├── web/            → Site Next.js (encyclopédie + dashboard + CMS)
│   ├── api/             → API NestJS + Prisma + PostgreSQL
│   ├── discord-bot/     → Bot Discord (discord.js v14, workspace séparé)
│   └── terminal/        → Terminal narratif (Vite, secondaire)
├── packages/
│   └── narrative-core/  → Bibliothèque de contenu narratif partagée (chapitres, monde, GNS)
├── plugins/
│   └── redlakes-sync/   → Plugin Minecraft Java (Forge/Mohist 1.12.2) — quasiment rien développé
├── pdf_extract/          → Outils d'extraction de contenu PDF (annexe)
├── scripts/              → Scripts PowerShell de démarrage/arrêt (setup.ps1, dev-platform.ps1, stop.ps1, start-*.ps1) + scripts Python (sync catalogues)
├── docs/
│   └── REDLAKES-CORE-SPEC.md → Spec vivante de la transformation CORE (mise à jour à chaque lot livré)
├── docker-compose.yml    → PostgreSQL 16 + Elasticsearch 8.15 (local, PostgreSQL n'est plus utilisé — Neon le remplace)
├── *.bat                 → Raccourcis Windows (Lancer-REDLAKES.bat, Arreter-REDLAKES.bat, etc.)
└── package.json           → workspaces npm + scripts racine
```

### Démarrage (Windows)

- Tout-en-un : `Lancer-REDLAKES.bat` ou `.\scripts\start.ps1` → ouvre API (3001) + Site (3000).
- Manuel : `cd apps/api && npm run start:dev` puis `cd apps/web && npm run dev`.
- Arrêt propre : `.\scripts\stop.ps1` ou `Arreter-REDLAKES.bat`.
- ⚠️ **Piège récurrent rencontré en session** : des instances `npm run dev`/`start:dev` lancées en arrière-plan sans nettoyage s'accumulent (jusqu'à 10 process Node dupliqués observés), ce qui a fait planter le pool de workers Turbopack (message trompeur « Jest worker encountered child process exceptions » — n'a **rien** à voir avec des tests Jest, c'est l'infra interne de compilation parallèle de Turbopack). Fix systématique : `taskkill //F //IM node.exe`, vider `.next`, relancer une seule instance propre de chaque serveur, et être patient (20-30s+ de démarrage sous charge avant de conclure à un échec).

---

## 4. Frontend — `apps/web`

### 4.1 Conventions

- App Router (`src/app/`), composants dans `src/components/` organisés par domaine (`grades/`, `factions/`, `staff/`, `layout/`, `platform/`, `lore/`, `home/`, `console/`, `intranet/`, `archives/`, `transmissions/`, `personnages/`, `clearance/`, `auth/`, `ui/`).
- `src/lib/api.ts` : client fetch générique. `apiFetch<T>(path, options)` passe par le proxy Next `/api` (port 3000 → proxifié vers l'API NestJS sur 3001), avec `credentials: "include"` pour les cookies de session.
- `src/data/*.ts` : données **statiques** encore en place, cible de la migration progressive vers l'API/DB (`rp-grades.ts`, `factions.ts`, `faction-role-catalog.ts`, `site12.ts`, `lore.ts`, `scp.ts`, `news.ts`, `map.ts`, `timeline.ts`, `redlakes-rp-rules.ts`).
- `src/middleware.ts` : middleware Next (probablement pour la protection de routes staff/auth — à vérifier au besoin).

### 4.2 Pages publiques (toutes existantes, DA à ne pas retoucher sans demande)

Accueil (`/`), Wiki SCP (`/wiki`, `/wiki/[id]`), Lore (`/lore`, `/lore/[id]`), Personnages (`/personnages`, `/personnages/[id]`), Factions (`/factions`, `/factions/[id]`, `/factions/mtf`, `/factions/mtf/[id]`), Départements (`/departements`, `/departements/[id]`, `/departements/site-12`), Carte (`/carte`), Chronologie (`/chronologie`), Actualités (`/actualites`, `/actualites/[id]`), Galerie (`/galerie`), CASSIE IA (`/cassie`), Transmissions (`/transmissions`), Événements (`/evenements`, `/evenements/[id]`), Joueurs (`/joueurs`, `/joueurs/[username]`), Connexion (`/connexion`), Candidatures (`/candidatures`), Archives classifiées (`/archives`), Intranet (`/intranet`), Console (`/console`).

### 4.3 Grades — première feature entièrement branchée sur le CORE (Lot 5)

- `GET /grades` → `/grades` (catalogue public filtrable par branche, recherche, groupé) via `GradesCatalog.tsx`.
- `/grades/[slug]` → fiche détail (clearance, salaire, quota, description, objectifs, zones d'accès, sections du site accessibles, département lié).
- `components/home/GradesPreview.tsx` : section « Conseil Oméga » ajoutée sur la page d'accueil, données live, **masquée automatiquement si l'API est indisponible** (pas de casse silencieuse).
- `lib/grade-labels.ts` : interface `ApiGrade`, `BRANCH_LABELS`, `BRANCH_ORDER`, `TIER_LABELS`, helpers de zones d'accès (lit `data/site12.ts`).

### 4.4 Dashboards existants (conservés, enrichis, pas refaits)

- `/dashboard` : dossier agent joueur (identité RP, rapports, candidatures, Discord).
- `/staff` : `StaffDashboard.tsx` — candidatures en attente, rapports RP en attente, audit feed, **et désormais un accès direct « Gestion des grades »**.

### 4.5 CMS existants

- **CMS Lore** (`/lore/cms`, `/lore/cms/nouveau`, `/lore/cms/[id]`) — pattern de référence historique : liste via `GET /lore/cms`, formulaire via `LoreEditor.tsx`. Défaut connu et **volontairement pas reproduit** dans le nouveau CMS Grades : la page d'édition (`[id]/page.tsx`) récupère **toute la liste** côté client puis filtre par id (inefficace).
- **CMS Grades (nouveau, Lot 7)** — voir section 6.6.

---

## 5. Base de données

- PostgreSQL, actuellement **hébergé sur Neon** (`ep-lively-night-za4i86ne.c-2.eu-west-2.aws.neon.tech`), configuré via `DATABASE_URL` dans `apps/api/.env` (gitignored). Migration effectuée après une panne irréparable de Docker Desktop sur la machine de dev (socket AF_UNIX bloqué, toutes les tentatives de réparation locales ont échoué) — décision explicite de l'utilisateur : abandonner Docker pour la DB au profit d'une base hébergée gratuite.
- `docker-compose.yml` existe toujours (PostgreSQL 16 + Elasticsearch 8.15) mais **PostgreSQL local n'est plus utilisé**.
- Prisma : migrations classiques (`npx prisma migrate dev` / `migrate deploy`), `seed.ts` (chaîne `seedGrades()` puis `seedFactions()`), scripts de backfill idempotents pour les migrations progressives (`backfill-player-grades.ts`, `backfill-player-factions.ts`, `backfill-grade-departments.ts`).

### 5.1 Schéma Prisma complet (état actuel, `apps/api/prisma/schema.prisma`)

**Modèles historiques (pré-CORE, conservés intégralement) :**
- `User` — identité centrale (Minecraft UUID/username, Microsoft ID, Discord ID, email, rôle `PLAYER/STAFF/ADMIN`). Relations vers tout le reste.
- `Session` — sessions de connexion (token, expiration).
- `Player` — profil RP d'un `User` : `grade`/`faction` (**chaînes libres historiques**, encore présentes en parallèle des nouvelles relations `gradeId`/`gradeInfo` et `factionId`/`factionInfo`), teamName, identité RP (prénom/nom), playtime, ancienneté, réputation, sanctions, clearance, médailles, achievements/inventory en JSON.
- `Application` — candidatures (`STAFF`/`MTF`/`RECHERCHE`/`ADMINISTRATION`), statut `PENDING/APPROVED/REJECTED`, revue par le staff.
- `LoreArticle` — articles Lore (catégories `MONDE/SITE/CHRONOLOGIE/GUERRES/CATASTROPHES/PERSONNAGES/SCP/FACTION/EVENEMENT`, statut `DRAFT/PUBLISHED/ARCHIVED`, clearance, tags, auteur).
- `GalleryAsset`, `LinkCode` (codes de liaison Discord↔site).
- `PersonnelReport` — rapports RP (`INCIDENT/AUTHORIZATION/MEMO/EQUIPMENT`), statut `PENDING/REVIEWED/ARCHIVED`.
- `DiscordTransmission` — événements Discord relayés côté site en thème RP (« transmissions »). **Anonymisation appliquée** : pseudos codifiés (`codename`), aucun message brut privé stocké, contenu conservé seulement pour les salons explicitement publics.
- **Couche plateforme** (transverse à toutes les entités) : `AuditLog` (journal d'audit horodaté par entité/action), `PlatformComment` (commentaires, y compris internes staff), `PlatformNotification`, `PlatformTag`/`PlatformEntityTag` (tags génériques). `PlatformEntityType` couvre `PERSONNEL_REPORT/APPLICATION/LORE_ARTICLE/PLAYER/USER`.

**Modèles REDLAKES CORE (nouveaux, construits lot par lot) :**
- `Grade` — **la pièce centrale du CORE**. `slug`, `name`, `branch`, `tier`, `departmentId` (legacy, chaîne slug), `departmentRefId`/`departmentRef` (relation FK vers `Department`), `pay`, `quota`, `clearance` (1-5), `description`, et 4 tableaux de strings : `objectives`, `utilities`, `accessZones`, `siteSections`. CRUD complet (voir section 6.6).
- `Faction` — `slug`, `name`, `tagline`, `description`, `history`, `color`, `clearance`, `playable`, `objectives[]`, `chefId`/`chef` (relation `User`), `deputyIds[]`, `budget` (champ simple, remplacé plus tard par un vrai `Wallet`). Lecture seule pour l'instant (pas de CRUD API encore).
- `Department` — `slug`, `name`, `factionId`/`faction`, `omegaTier`, `directorGradeName`, `color`, `utilities[]`, `objectives[]`, `chefId`/`chef`, `deputyIds[]`, `budget`. Lecture seule pour l'instant.
- `Player.gradeId → Grade`, `Player.factionId → Faction` (Lot 2 et Lot 4) — les champs `Player.grade`/`Player.faction` en string restent en place comme fallback tant que le catalogue ne couvre pas 100% des cas.

**Gap connu et documenté (non résolu)** : 14 grades sur 85 (catégories Oméga, Direction, Détention, « Scientifique ») ne matchent aucun `Department` existant — ces catégories n'ont jamais été modélisées comme vrais départements (seuls les 4 départements de `site12.ts` ont été seedés). Décision à prendre plus tard.

**Modèles prévus mais PAS ENCORE créés** (dans la spec, section « à venir ») : `Team`, `Wallet`, `Transaction`, `Mission`, `MissionParticipant`, `RpEvent`, `RpEventParticipant`, `Sanction`, `GradeHistory`, `FactionHistory`, `ClassifiedDocument`, `DocumentVersion`, `DocumentAttachment`, `FactionRelation` (diplomatie).

---

## 6. Backend — `apps/api`

Modules Nest actifs (déclarés dans `app.module.ts`) : `PrismaModule`, `PlatformModule`, `HealthModule`, `AuthModule`, `PlayersModule`, `ApplicationsModule`, `LoreModule`, `SearchModule`, `GalleryModule`, `SyncModule`, `ReportsModule`, `GradesModule`, `FactionsModule`, `DepartmentsModule`.

### 6.1 Auth (`src/auth`)

- `AuthGuard` + `RolesGuard` + décorateur `@Roles(UserRole.STAFF, UserRole.ADMIN)` — pattern RBAC standard réutilisé partout où il faut protéger une route.
- OAuth Discord (connexion site) et Microsoft (profil Minecraft Java, prod), Dev Login en dev.
- ⚠️ **Piège architectural découvert et corrigé cette session** : `AuthModule` importe `SyncModule` (pour des besoins internes), et `SyncModule` importe `GradesModule`. Ajouter `AuthModule` comme import de `GradesModule` (nécessaire pour que les guards de `GradesController` puissent résoudre `AuthService`) crée donc un **cycle** `Auth → Sync → Grades → Auth`. Résolu avec `forwardRef(() => Module)` **des deux côtés du cycle qui se referme** (dans `grades.module.ts` ET dans `auth.module.ts`). À garder en tête pour tout futur module qui a besoin des guards d'auth tout en étant déjà consommé (directement ou indirectement) par `SyncModule`.

### 6.2 `PlayersModule`, `ApplicationsModule`, `ReportsModule`, `LoreModule`, `SearchModule`, `GalleryModule`

Modules historiques, non retouchés dans les derniers lots hors enrichissement des `include` Prisma (`players.service.ts` : `gradeInfo: { include: { departmentRef: true } }, factionInfo: true` sur les 3 méthodes de requête — un vrai bug d'include manquant a été trouvé et corrigé au Lot 4).

### 6.3 `SyncModule`

Point d'entrée utilisé par le bot Discord et potentiellement Minecraft pour synchroniser les profils. `sync.service.ts::getProfileByDiscordId()` résout maintenant `gradeInfo`/`factionInfo` en plus des champs legacy. `syncRole`/`syncGradeFromDiscord` résolvent grade/faction via le catalogue avec repli sur l'ancienne logique floue (`players/grade-clearance.ts`) si aucune correspondance catalogue.

### 6.4 `GradesModule` — CRUD complet (Lot 1 → Lot 7)

- `GET /grades?branch=` — public, liste filtrable.
- `GET /grades/by-id/:id` — **STAFF/ADMIN**, doit être déclaré **avant** la route `:slug` sinon Nest la traite comme un slug littéral `by-id`.
- `GET /grades/:slug` — public, fiche détail.
- `POST /grades` — **STAFF/ADMIN**, création.
- `PATCH /grades/:id` — **STAFF/ADMIN**, mise à jour (slug volontairement exclu du payload de mise à jour côté frontend — immuable après création).
- `DELETE /grades/:id` — **ADMIN uniquement**.
- `grades.service.ts` exporte aussi `normalizeGradeName()` — normalisation (NFD, suppression diacritiques `/[\u0300-\u036f]/g`, lowercase, nettoyage) utilisée pour faire matcher un nom de grade texte libre venant de Discord/Minecraft avec le catalogue, tolérante aux variations d'accents/casse/tirets.
- DTOs (`dto/grade.dto.ts`) : `CreateGradeDto`/`UpdateGradeDto` avec `class-validator` (slug/name min 2 caractères, clearance entre 1 et 5, tableaux de strings optionnels).

### 6.5 `FactionsModule` / `DepartmentsModule` (Lot 3)

`GET /factions`, `GET /factions/:slug`, `GET /departments`, `GET /departments/:slug` — **lecture seule pour l'instant**, pas de CRUD. Si l'utilisateur demande à éditer les Factions/Départements depuis le site (probable, vu la demande déjà faite pour les Grades), le pattern à répliquer est exactement celui de `GradesModule` (DTOs + service CRUD + controller avec guards + `forwardRef` si nécessaire avec `AuthModule`).

### 6.6 CMS Staff Grades (Lot 7, tout dernier travail livré)

Réponse directe à la demande explicite de l'utilisateur de pouvoir éditer le site depuis le site lui-même. Commit [`3c92ea2`](../) « Add staff CMS for grades (create/edit/delete via the site) ».

Frontend :
- `/staff/grades` — liste, lien « Nouveau grade », accessible aussi depuis une carte dans `StaffDashboard.tsx` et depuis le menu « Systèmes » du header (« Gestion Grades (Staff) »).
- `/staff/grades/nouveau` — `<GradeEditor mode="create" />`.
- `/staff/grades/[id]` — fetch via `GET /grades/by-id/:id` (pas le pattern inefficace de Lore), `<GradeEditor mode="edit" gradeId initial=... />`.
- `components/staff/GradeEditor.tsx` — formulaire complet (nom, slug auto-généré, branche, tier, département via `<select>` peuplé par `GET /departments`, salaire, quota, clearance 1-5, description, objectifs/compétences/zones d'accès/sections du site en champs texte séparés par virgules), bouton supprimer (avec `confirm()`), lien de prévisualisation vers la fiche publique.

---

## 7. Bot Discord — `apps/discord-bot`

Workspace npm séparé (exclu de `apps/*` dans les workspaces racine). discord.js v14. Contient énormément de tooling autour de la gestion des rôles Discord (catalogue de rôles RP, organisation, dédoublonnage, diagnostic, réparation, séparateurs visuels — `lib/role-*.ts`, `run-role-*.ts` à la racine de `src/`), un catalogue narratif (`lib/rp-catalog.ts`), et les commandes slash standards (`commands/*.ts` : `grades`, `profil`, `identite`, `candidature`, `rapports`, `serveur`, `wiki`, `ping`, `aide`, `link`/`unlink`, `sync-roles`, `roles-admin/-check/-import/-organize`, `hub-roles`).

### État CORE du bot (Lot 6, livré)

- `commands/grades.ts` — réécrit pour lire `GET /grades` **en direct** au lieu d'un miroir statique obsolète (`lib/site12.ts`, **supprimé**, confirmé n'être utilisé que là). Les valeurs de choix de branche ont été corrigées pour matcher exactement `Grade.branch` (ex. `"scientifique"`, pas `"recherche"`).
- `commands/profil.ts` — enrichi pour afficher département et salaire via `gradeInfo`.
- `lib/api.ts` — interfaces `GradeInfo`/`FactionInfo`, méthode `api.getGrades()`.

Le reste du bot (gestion des rôles Discord, catalogue narratif) reste largement autonome et n'a pas encore été migré vers le CORE — c'est un chantier futur si l'utilisateur le demande.

---

## 8. Minecraft — `plugins/redlakes-sync`

**État : quasiment rien développé.** Un seul fichier Java (`RedLakesSyncPlugin.java`). La spec CORE dit explicitement : « rien développé pour l'instant […] sera développé plus tard. Minecraft appliquera les données du CORE, ne sera plus jamais la source de vérité du grade. »

⚠️ **Erreur à ne jamais reproduire** : le serveur réel tourne sur **Mohist 1.12.2 + Forge 14.23.5.2860 + Java 8**, pas sur Paper/Spigot moderne avec Java 21 — une correction explicite de l'utilisateur en session a établi ce fait après une hypothèse initialement erronée. Le plugin doit cibler `Spigot/PaperSpigot 1.12.2-R0.1-SNAPSHOT` + Java 8.

---

## 9. Outils annexes

- `apps/terminal` — terminal narratif Vite/TS, consomme `packages/narrative-core` (chapitres, contenu, monde, système GNS). Peu prioritaire dans les demandes récentes de l'utilisateur.
- `packages/narrative-core` — bibliothèque de contenu narratif partagée entre terminal et potentiellement d'autres surfaces.
- `pdf_extract/` — outils d'extraction de contenu depuis des PDF (probablement pour ingérer de la documentation SCP/lore source).
- `scripts/` — scripts PowerShell (setup, démarrage/arrêt orchestré des services) et Python (`generate-rp-catalog.py`, appelé par `npm run sync:grades`).

---

## 10. Chantier en cours, INTERROMPU et NON REVU — identité visuelle des Factions

Suite à la directive « univers visuels vraiment distincts par faction » (voir section 1), un agent de conception/implémentation a été lancé en isolation (`git worktree`) pour retravailler les pages `/factions/*` avec une identité visuelle propre à chaque faction. Un brief de design complet a été écrit (`/tmp/faction-identity-*/brief.md` — chemin temporaire, probablement plus disponible).

**Ce travail a été interrompu deux fois** par des redémarrages de session/process, et n'a **jamais été revu ni mergé**. Il existe (ou existait) dans un worktree séparé :

```
worktree: C:\Users\flech\Projects\redlakes-rp\.claude\worktrees\agent-a8f8c216396f21c00
branch:   worktree-agent-a8f8c216396f21c00
```

**Action à faire en priorité si l'utilisateur relance ce sujet** : vérifier si ce worktree/cette branche existe toujours (`git worktree list`, `git branch -a`), auditer ce qui a été fait, décider de reprendre l'implémentation, la jeter et repartir de zéro, ou la fusionner après revue — rien de tout cela n'a été fait à ce jour.

---

## 11. Pièges techniques rencontrés cette session (à connaître avant d'agir)

1. **Corruption Unicode via les outils d'édition** : écrire une regex contenant des échappements `\uXXXX` (ex. `/[\u0300-\u036f]/g` pour matcher les diacritiques) via les outils standards d'édition/écriture de fichier a été corrompu à plusieurs reprises en caractères Unicode combinants littéraux directement dans le fichier (bug de transmission, pas une erreur de frappe). **Fix fiable qui fonctionne à chaque fois** : réécrire le fichier via un script Python exécuté en shell, en construisant la chaîne avec `chr(92)` (backslash) plutôt qu'en tapant `\u` directement — évite toute interprétation d'échappement en amont. Sur Windows, éviter aussi de faire `print()`/`repr()` du contenu corrompu vers stdout (encodage cp1252 par défaut, plante sur les caractères combinants) — écrire le fichier directement sans debug print intermédiaire.
2. **Dépendances circulaires de modules NestJS** : voir section 6.1. Symptôme : `UnknownDependenciesException` puis, une fois un import ajouté naïvement, `UndefinedModuleException` (« The module at index [0] of the imports array is undefined »). Fix : `forwardRef(() => Module)` des deux côtés de l'arête qui referme le cycle.
3. **Hygiène des process Node en dev** : voir section 3, fin. Toujours vérifier `tasklist`/`netstat` avant de conclure à un bug de code quand quelque chose « ne marche plus » — souvent une accumulation de process orphelins ou un serveur qui a juste été tué par un redémarrage d'environnement.
4. **Docker Desktop sur cette machine** : cassé de façon persistante (socket AF_UNIX `dockerInference` bloqué, toutes les méthodes de réparation standard ont échoué : `Remove-Item`, `fsutil reparsepoint delete`, `wsl --shutdown`, désactivation d'`EnableDockerAI`). Ne plus compter dessus pour PostgreSQL — Neon est la solution actuelle. Le `docker-compose.yml` reste dans le repo mais n'est plus le chemin réel utilisé.

---

## 12. Historique des lots CORE livrés (résumé — détail complet dans `docs/REDLAKES-CORE-SPEC.md`)

| Lot | Contenu | Statut |
|---|---|---|
| 1 | Modèle `Grade` (lecture seule), seed, `GET /grades` | ✅ |
| 2 | `Player.gradeId` → relation `Grade`, résolution catalogue-first dans `sync.service.ts`, backfill, `gradeInfo` exposé | ✅ |
| 3 | Modèles `Faction`/`Department` (lecture seule), seed, endpoints GET | ✅ |
| 4 | `Player.factionId` → `Faction`, `Grade.departmentRefId` → `Department`, backfills | ✅ (gap 14/85 grades sans département identifié) |
| 5 | Pages web publiques `/grades` + `/grades/[slug]`, aperçu accueil « Conseil Oméga » | ✅ |
| 6 | Bot Discord `/grades` et `/profil` deviennent des clients CORE live | ✅ |
| 7 | **CMS Staff pour les Grades** (`/staff/grades/*`, CRUD API complet) | ✅ (ce document) |
| 8+ | Team, Wallet/Transaction, Mission, RpEvent, ClassifiedDocument, Sanction, `FactionRelation`, départements manquants (Oméga/Direction/Détention), CRUD Factions/Départements, pages Factions/Départements branchées sur l'API (encore statiques), reprise du chantier identité visuelle factions | À venir |

---

## 13. Comment continuer efficacement

1. Toujours lire `docs/REDLAKES-CORE-SPEC.md` en premier pour la philosophie et l'état exact des lots.
2. Toute nouvelle feature CORE suit le même pattern que Grades : modèle Prisma additif (jamais de suppression) → migration → seed/backfill idempotent → service/controller/DTOs Nest avec guards → page(s) web → (si pertinent) client Discord → vérification live avant commit → mise à jour du tableau de lots dans la spec.
3. Pour toute page staff d'édition, répliquer le pattern `staff/grades/*` (liste → `/nouveau` → `/[id]`), pas le pattern moins efficace de `lore/cms/[id]`.
4. Ne jamais toucher à la DA/nav/accueil sans demande explicite ; toute refonte visuelle doit passer par le workflow `frontend-design` (brief → agent en worktree isolé → évaluateur indépendant → boucle de correction) et être **revue avant merge**, contrairement au chantier factions actuellement en suspens.
