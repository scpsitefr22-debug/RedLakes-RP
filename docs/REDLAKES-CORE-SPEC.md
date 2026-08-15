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
| 7 | CMS Staff pour les Grades (`/staff/grades`, `/staff/grades/nouveau`, `/staff/grades/[id]`) : CRUD complet côté API (`POST/PATCH/DELETE /grades`, `GET /grades/by-id/:id` staff), formulaire d'édition complet côté site. Réponse directe à la demande de pouvoir éditer le site depuis le site. A aussi révélé et corrigé une dépendance circulaire de modules Nest (`Auth → Sync → Grades → Auth`, résolue avec `forwardRef`) | ✅ Livré et vérifié |
| 8 | Identité visuelle distincte par faction (`/factions`, `/factions/[id]`) : police de titre, palette, motif de fond et style d'animation propres à chacune des 8 factions, système unique (`faction-themes.ts` + `FactionThemeScope`), respecte `prefers-reduced-motion`. Migre au passage `/factions/*` de `data/factions.ts` (statique) vers `GET /factions` (live). A aussi révélé et corrigé un crash (composant d'icône passé en prop brute d'un Server Component vers un Client Component — non sérialisable en RSC) | ✅ Livré et vérifié |
| 9 | CRUD Staff pour Factions et Départements (`/staff/factions`, `/staff/departements`, mêmes sous-routes que les Grades), même pattern (DTOs, guards, `forwardRef` où nécessaire). **Gap des 14/85 grades sans département résolu à 0/85** : typo de source corrigée (4 grades "scientifique" → département `recherche`), les 4 postes "Conseiller" du Conseil Oméga rattachés à leur département existant via correspondance `omegaTier`, Class-B/D/S rattachés à `securite` (déjà listé dans ses utilities), et nouveau département `Direction du Site` (O1) créé pour le Président du Conseil et les 2 grades de la branche "direction" | ✅ Livré et vérifié |
| 10 | Retrait des MTF comme structure RP active : pages `/factions/mtf`, nav, données statiques `mtfUnits`, index de recherche, `ApplicationType.MTF` (candidature web + Discord), catégorie et 5 grades "Forces Mobiles (MTF)" du catalogue de rôles Discord, lien mort du `/wiki` Discord. Chaque référence classée avant modification (ACTIVE vs HISTORIQUE/LORE) — le Lore (`narrative-core`, chronologie, actualités, wiki SCP) n'a pas été touché | ✅ Livré et vérifié |
| 11 | Chronologie officielle intégrée (1945-2027) dans `docs/LORE-BIBLE.md` et `data/timeline.ts` — réconciliation en cascade du lore existant qui dépendait des anciennes dates (Site-12, AEGIS, Directeur du Site, brèche Keter, Guerre interne O5→Oméga), correction d'une incohérence (SCP-████ "transféré depuis Site-19" alors que Site-19 est tombé en 2013), terminologie "MTF" → "FIM" partout dans le lore restant (narrative-core, SCP, CASSIE, seed) | ✅ Livré et vérifié |
| 12 | Modèle `Team` (générique, rattachée à `Department`, jamais un reskin de faction) : CRUD complet (même pattern que Grades/Factions/Départements), CMS staff (`/staff/teams`). Seed des 21 gabarits d'équipes déjà définis dans `site12.ts` (jamais migrés) **plus** les 5 escouades FIM du département Sécurité (Nu-7, Epsilon-11, Alpha-1, Beta-7, Zeta-9) — referme la boucle ouverte au Lot 10 : les FIM remplacent narrativement les MTF retirées, et existent maintenant réellement dans le CORE, pas seulement dans le lore | ✅ Livré et vérifié |
| 13 | Modèle `PlayerAssignment` (historique polymorphe FACTION/DEPARTMENT/TEAM, append-only) + `Player.teamId`/`teamInfo` (même pattern que `gradeId`/`factionId`). `POST /assignments` clôture automatiquement l'affectation ouverte précédente du même joueur pour le même type d'entité et synchronise l'état courant sur `Player` (`factionId`/`teamId` — `DEPARTMENT` n'a pas d'équivalent direct sur `Player`, l'historique reste alors la seule source). Toutes les routes réservées staff/admin (historique d'affectation = donnée sensible, pas de lecture publique comme Grades/Factions/Teams). API vérifiée en direct (création, clôture automatique à la 2e affectation, PATCH, DELETE) — **pas de CMS dédié cette fois** : choisir un joueur (recherche/autocomplete) est une vraie question de design UI, pas juste un formulaire plat comme les catalogues précédents ; backend livré, interface à construire en suivant | ✅ Backend livré et vérifié — UI à venir |
| 14 | Modèle `Sanction` : donne un corps à `Player.sanctions`, jusque-là un simple compteur entier mis à jour à la main sans aucun enregistrement derrière (type, motif, qui l'a prononcée, statut ACTIVE/EXPIREE/LEVEE, date de levée + par qui). Le compteur reste (lecture rapide `/profil` Discord et fiches joueur) mais devient un **total historique cumulatif** synchronisé automatiquement : incrémenté à la création, inchangé quand une sanction est levée (elle a bien eu lieu), décrémenté seulement à la suppression (correction d'une erreur de saisie, pas une clémence RP). Mêmes garde-fous que PlayerAssignment (staff/admin uniquement, DELETE réservé admin). API vérifiée en direct : création + incrément, levée + `liftedAt`/`liftedById` auto-remplis + compteur inchangé, suppression + décrément. Pas de CMS dédié non plus, même raison qu'au Lot 13 (picker joueur = vraie question de design UI) | ✅ Backend livré et vérifié — UI à venir |
| 15 | Fiche staff par joueur (`/staff/joueurs`, `/staff/joueurs/[username]`) : ferme la boucle ouverte aux Lots 13-14 en évitant complètement le problème du "picker" — au lieu d'un sélecteur de joueur générique, la sélection se fait par navigation (l'URL contient le pseudo). La fiche affiche le profil, l'historique de sanctions avec formulaire d'ajout et bouton "Lever", et l'historique d'affectations avec formulaire d'assignation (Faction/Département/Équipe) et bouton "Terminer". Nouvelle route `GET /players/:username/staff-id` (staff/admin) pour résoudre le `Player.id` interne depuis le pseudo, sans exposer cet id sur le profil public. Testé de bout en bout dans le vrai navigateur : création d'une sanction, levée, création d'une affectation, clôture — les quatre actions confirmées à l'écran avant nettoyage | ✅ Livré et vérifié |
| 16+ | `Mission`+`MissionParticipant`, puis Wallet/Transaction, RpEvent, ClassifiedDocument, `FactionRelation` (diplomatie). Côté pages publiques : `/departements`, `/wiki`, `/personnages`, `/actualites`, `/carte`, `/evenements` restent 100% statiques (aucun modèle Prisma), à migrer une par une si le staff doit pouvoir les gérer depuis le site. Escouades AIT non créées — aucune donnée existante à migrer, noms/composition à valider avant toute création (voir §9bis de la Lore Bible : ne pas inventer de canon sans validation) | À venir |
