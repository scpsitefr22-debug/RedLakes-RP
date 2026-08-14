# REDLAKES CORE — Spécification fonctionnelle

> Document de référence validé pour la transformation progressive du site REDLAKES RP existant en REDLAKES CORE : le site (Web + API + PostgreSQL) devient la source de vérité unique pour l'écosystème ; Discord, Minecraft et les futures IA en deviennent des clients.
>
> Règle absolue : **CONSERVER → ADAPTER → ENRICHIR → REMPLACER UNIQUEMENT SI NÉCESSAIRE**. Ne jamais reconstruire une fonctionnalité qui fonctionne déjà, ne jamais refaire la page d'accueil, la direction artistique ou la navigation. Toujours enrichir l'existant, jamais repartir de zéro.

## Objectif

Créer le véritable centre de contrôle de REDLAKES : le CORE décide, les autres systèmes (Discord, Minecraft, IA) appliquent.

## Ce qui est conservé intégralement

- Page d'accueil, DA, animations, navigation, footer — inchangés.
- Toutes les pages publiques (Wiki SCP, Lore, Personnages, Factions, MTF, Départements, Site-12, Carte, Chronologie, Actualités, Galerie, CASSIE, Transmissions, Joueurs, Connexion) — design identique.
- CMS actuel (édition, création, publication, historique, recherche) — devient la base du futur système documentaire.
- Authentification (Discord OAuth, Dev Login, sessions, cookies, sécurité).
- Dashboard joueur (identité RP, rapports, candidatures, statistiques, Discord) — enrichi, pas refait.
- Dashboard staff (candidatures, rapports, audit, commentaires, historique) — enrichi, pas refait.
- Bot Discord — conservé entièrement, devient progressivement un client du CORE.
- API NestJS / Prisma / PostgreSQL — architecture, services, modules, guards conservés.

## Ce qui est enrichi

### Système des joueurs
Identité, matricule, nom/prénom RP, Discord, Minecraft, grade, faction, département, équipe, clearance, salaire, solde, statistiques, réputation, médailles, historique (grades/factions/économie/activités), missions, rapports, candidatures, notifications, sanctions.

### Système des grades — la source de vérité centrale
Un `Grade` définit : nom, description, faction, département, tier, salaire, clearance, permissions Web/Discord/Minecraft, zones accessibles, documents accessibles, hiérarchie. Modifier un grade se propage automatiquement au site, à Discord et à Minecraft.

### Factions
Nom, description, logo, couleur, historique, chef, sous-chefs, départements, équipes, membres, budget, documents, missions, relations diplomatiques.

### Départements
Chef, adjoints, équipes, membres, budget, documents, missions (ex. Recherche, Sécurité, Administration, Maintenance, Médical, Logistique, Commandement).

### Documents classifiés
Titre, slug, auteur, classification, statut, version, historique, pièces jointes, tags, personnes/factions/SCP/événements/missions/documents liés. Clearance **toujours vérifiée côté API**, jamais uniquement en React.

### Missions
Titre, description, objectifs, difficulté, statut, créateur, participants, récompenses, expiration, validation, historique, événement lié, rapports liés. Individuelles, d'équipe ou de faction.

### Événements RP
Statut, gravité, conséquences, participants, missions générées, historique, notifications, journal (brèche SCP, attaque, évasion, guerre, incident, catastrophe, alerte...).

### Économie
Wallet, transactions (salaire, prime, amende, transfert), historique, comptes de faction/département. Transactions **immuables**, opérations PostgreSQL atomiques.

### Sanctions
Auteur, raison, début, fin, type, commentaires, historique, documents liés.

### Permissions
Suppression **progressive** (pas immédiate) de la logique actuelle basée sur `PLAYER/STAFF/ADMIN` au profit de permissions dérivées du Grade. Le système de rôles actuel reste en place en parallèle jusqu'à preuve que les permissions dérivées du Grade donnent les mêmes résultats.

## Base de données — nouveaux modèles prévus

`Grade` (✅ créé), `Faction`, `Department`, `Team`, `Wallet`, `Transaction`, `Mission`, `MissionParticipant`, `RpEvent`, `RpEventParticipant`, `Sanction`, `GradeHistory`, `FactionHistory`, `ClassifiedDocument`, `DocumentVersion`, `DocumentAttachment`.

## Migration

Ne jamais supprimer les données existantes (Lore, Wiki, SCP, Actualités, Chronologie, CMS, Rapports, Candidatures). Migration progressive, un lot à la fois, chaque lot vérifié (build/lint/tsc + test contre une vraie base) avant de passer au suivant.

## Discord / Minecraft / IA

- **Discord** : devient un client du CORE (grades, missions, événements, documents, notifications, profils).
- **Minecraft** : rien développé pour l'instant. Le CORE prépare l'architecture ; le plugin (`redlakes-sync`, à réécrire pour Spigot/PaperSpigot `1.12.2-R0.1-SNAPSHOT` + Java 8, jamais Paper 1.21/Java 21) sera développé plus tard. Minecraft appliquera les données du CORE, ne sera plus jamais la source de vérité du grade.
- **IA** : architecture préparée (configuration, permissions, feature flags, connecteurs futurs) — aucune IA développée maintenant. CASSIE reste inchangée.

## Sécurité

Toutes les vérifications côté API. Toutes les opérations économiques atomiques. Toutes les modifications journalisées (`AuditLog`). Toutes les permissions centralisées. Toutes les routes sensibles protégées.

## Historique des lots livrés

| Lot | Contenu | Statut |
|---|---|---|
| 1 | Modèle `Grade` (lecture seule), seed depuis `rp-grades.ts`, `GET /grades` | ✅ Livré et vérifié |
| 2 | `Player.gradeId` → relation `Grade`, résolution du grade dans `sync.service.ts` (catalogue en priorité, ancienne table floue en repli), backfill des joueurs existants, `gradeInfo` exposé dans les réponses `/players/*` | ✅ Livré et vérifié |
| 3 | Modèles `Faction`/`Department` (lecture seule), seed depuis `factions.ts`/`site12.ts`, `GET /factions(/:slug)`, `GET /departments(/:slug)`, relation Faction↔Department | ✅ Livré et vérifié |
| 4 | `Player.factionId` → relation `Faction`, `Grade.departmentRefId` → relation `Department` (résolu depuis le slug déjà présent dans `Grade.departmentId`), `sync.service.ts` résout la faction en plus du grade, backfills | ✅ Livré et vérifié — **gap identifié** : 14/85 grades (Oméga, Direction, Détention, "Scientifique") ne matchent aucun `Department` — ces catégories n'ont jamais été modélisées comme départements (seuls les 4 de `site12.ts` existent), décision à prendre |
| 5 | Premières pages web publiques consommant le catalogue CORE : `/grades` (catalogue filtrable, groupé par branche) et `/grades/[slug]` (fiche détail — clearance, salaire, quota, zones d'accès, sections du site, lien vers le département). Aperçu "Conseil Oméga" ajouté sur la page d'accueil (données live, section masquée si l'API est indisponible). Aucune page/route existante modifiée, hors une entrée de menu et une nouvelle section d'accueil | ✅ Livré et vérifié |
| 6 | Le bot Discord devient un vrai client CORE pour les grades : `/grades` lit désormais `GET /grades` en direct au lieu d'un miroir statique déjà obsolète (`lib/site12.ts`, supprimé) ; `/profil` affiche département et salaire via `gradeInfo`/`factionInfo`, désormais exposés par `getProfileByDiscordId` | ✅ Livré et vérifié |
| 6+ | Team, Wallet/Transaction, Mission, RpEvent, ClassifiedDocument, Sanction, `FactionRelation` (diplomatie), départements manquants (Oméga/Direction/Détention), pages web pour Factions/Départements branchées sur l'API (actuellement encore statiques) | À venir |
