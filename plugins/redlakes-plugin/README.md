# RedLakesPlugin — Minecraft

Couche d'exécution Minecraft du REDLAKES CORE. **Le CORE décide, ce plugin applique** — aucune logique métier (grades, permissions RP, brèches...) ne doit vivre ici, uniquement de la lecture/application de ce que le CORE renvoie.

Remplace à terme [`plugins/redlakes-sync`](../redlakes-sync) (Paper 1.21/Java 21, sens Minecraft→CORE) — stack incompatible, aucun code partagé. Celui-ci cible **Mohist 1.12.2 / Spigot API / Java 8**, et inverse le sens : c'est le CORE qui reste la source de vérité, ce plugin la consomme.

## État actuel

### Phase 1 (fondation) — ✅ complète, vérifiée en direct sur le vrai serveur
- `core/CoreClient` — client HTTP (bloquant, à appeler uniquement hors du thread principal)
- `core/CoreConfig` — lecture de `config.yml`
- `core/ConnectionManager` + `ConnectionState` — heartbeat ONLINE/DEGRADED/OFFLINE (3 échecs consécutifs → OFFLINE)
- `player/SessionCache` — cache mémoire TTL, jamais une seconde source de vérité
- `player/SessionSyncService` — appelle `GET /sync/minecraft/:uuid` côté CORE et alimente le cache
- `player/PlayerConnectionListener` — sync à la connexion (délai 2s) + retire le joueur du cache à la déconnexion
- Resynchronisation périodique de tous les joueurs connectés (`sync.poll-interval-minutes`, async, jamais dans un tick)
- `commands/RlCommand` — `/rl profil`, `/rl missions`, `/rl staff status` (permission `redlakes.staff`)

### Phase 2 (identité) — ✅ complète
- Résolution User/Character/Faction/Département/Équipe/Grade/permissions (déjà exposée par l'endpoint Phase 1)
- `player/SessionChange` — vraie détection GradeChanged/FactionChanged (§12-13) : compare l'ancienne et la nouvelle session, ne notifie que sur un vrai changement (jamais à chaque poll silencieux)
- `Faction.showAffiliationTag` (§65) : le masquage d'identité civile est décidé côté CORE, plus par une comparaison de slug `"civil"` en dur dans le plugin

### Tests
`src/test/java` (JUnit 5, `./gradlew test`) — 32 tests (`SessionChange`, `SessionCache`, `TagLabel`, `DoorAccessResolver`), purement Java, aucune dépendance Bukkit nécessaire.

### Phase 3 (présentation) — partiellement complète, **pas encore vérifiée visuellement en jeu**
- `presentation/PresentationManager` — nametag + tag tablist via scoreboard Team (couleur dérivée du `clearanceLevel`, texte dérivé du département/faction, tronqué à 4 lettres pour tenir dans la limite historique 16 caractères des Team 1.12.2). Aucun préfixe pour la faction "civil" (identité civile masquée, §19).
- `chat/ChatFormatListener` — reformate le chat global avec l'identité RP (`[TAG] Prénom Nom : message`), priorité HIGHEST (vérifié : ChatManager a son propre formatage RP désactivé sur ce serveur, donc pas de conflit)
- Notifications de connexion/changement dans `PlayerConnectionListener`
- `presentation/TabListManager` — bandeau tablist (§20, branding + grade/faction) via ProtocolLib (`PLAYER_LIST_HEADER_FOOTER` packet, par joueur). ProtocolLib 5.4.0 était cassé sur le vrai serveur (compilé Java 17+, serveur en Java 8) — remplacé par la dernière version compatible Java 8 (4.8.0), vendue dans `libs/` faute de coordonnées maven fiables. `softdepend` dans plugin.yml : dégradation silencieuse si ProtocolLib est absent/désactivé.

**Explicitement différé, avec raison technique :**
- Scoreboard sidebar personnalisé par joueur (§21) : un scoreboard personnel par joueur (`player.setScoreboard(...)`) casserait la visibilité des nametags des AUTRES joueurs (les Team du nametag vivent sur le scoreboard principal partagé) — nécessite soit de répliquer les Team sur chaque scoreboard personnel, soit des packets ProtocolLib dédiés (maintenant possible, pas encore fait)
- Canaux de chat LOCAL/FACTION/DEPARTMENT/TEAM/RADIO/WHISPER/OOC/STAFF (§18) : seul GLOBAL est fait

### Phase 6 (monde dynamique) — Missions : lecture seule branchée
- L'endpoint `/sync/minecraft/:uuid` renvoie aussi `missions` (statut ASSIGNED, personnage ou équipe) — réutilise `MissionsService`-like logic côté CORE
- `/rl missions` affiche les missions en cours
- Pas encore fait : mise à jour du statut depuis le jeu (compléter un objectif), déclencheurs d'objectifs (§36)

### Phase 4 (gameplay) — Portes : premier morceau
- `zones/Door` + `zones/DoorAccessResolver` (pur, testé) + `zones/DoorRegistry` (persistance `doors.yml`) + `zones/DoorListener` (`PlayerInteractEvent`) — §24 "CanCharacterAccess(character, door)", réutilise exactement `clearanceLevel` + `department.slug` déjà exposés, aucune nouvelle couche de permissions.
- `commands/DoorCommand` — `/rl staff door add <clearance> [departement]|remove|list`, cible le bloc regardé (`getTargetBlock`, 6 blocs).
- Volontairement **sans WorldGuard** : la version installée sur le serveur est cassée (même souci Java que ProtocolLib avant réparation, pas encore corrigée) — un système de zones/portes autonome évite cette dépendance.
- Pas encore fait : zones géographiques (au-delà d'un seul bloc), badges/équipements, terminaux.

**Non implémenté** (phases suivantes du cahier des charges) : badges/équipements, terminaux, rapports/documents in-game, NPC, SCP, économie.

## Build

```bash
cd plugins/redlakes-plugin
./gradlew build
# → build/libs/RedLakesPlugin-0.1.0.jar
```

## Configuration (`plugins/RedLakesPlugin/config.yml`)

```yaml
core:
  url: "https://api.redlakes.fr/api"
  server-id: "redlakes-main"
  sync-key: "votre-SYNC_API_KEY"      # même valeur que le bot Discord — voir apps/api SYNC_API_KEY
  request-timeout-seconds: 8
sync:
  poll-interval-minutes: 5
  cache-ttl-minutes: 10
```

## Dépendance CORE

Un seul endpoint consommé pour l'instant : `GET /sync/minecraft/:uuid` (header `X-Redlakes-Sync-Key`), implémenté dans `apps/api/src/sync/sync.service.ts#getMinecraftSession`. Le modèle `player/MinecraftSession.java` doit rester un miroir exact de cette réponse — ne pas ajouter de champ ici avant qu'il existe réellement côté API.

## Non tranché

- Identité par serveur : `core.server-id` est déjà dans la config (affiché par `/rl staff status`) mais le CORE ne le vérifie pas encore — une seule clé `SYNC_API_KEY` partagée avec le bot Discord et tout futur serveur.
- Pas de push CORE→Minecraft (grade changé, sanction, alerte) : uniquement du polling pour l'instant, volontairement, cf. cahier des charges §07-08/58.

## ⚠️ Ce dossier n'était pas suivi par git

Tout ce module a été perdu une fois cette nuit (fichiers disparus du disque, cause exacte non confirmée — probablement un `git clean` lancé ailleurs, ce dossier n'ayant jamais été commité). Reconstruit à l'identique depuis l'historique de session. **Committer ce dossier dès que possible** pour ne pas revivre ça.
