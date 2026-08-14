# RedLakes Sync — Plugin Minecraft

Synchronise les grades et factions des joueurs vers le site REDLAKES RP (`POST /api/sync/role`).

## Prérequis

- Paper 1.21+
- LuckPerms (ou permissions `redlakes.grade.*` / `redlakes.faction.*`)
- API REDLAKES en ligne avec `SYNC_API_KEY` configurée

## Build

```bash
cd plugins/redlakes-sync
gradle jar
# → build/libs/RedLakesSync-1.0.0.jar
```

## Configuration (`plugins/RedLakesSync/config.yml`)

```yaml
api-url: "https://api.redlakes.fr/api"
sync-key: "votre-SYNC_API_KEY"
grade-permission-prefix: "redlakes.grade."
```

## Permissions LuckPerms (exemple)

```
redlakes.grade.sergent
redlakes.grade.caporal
redlakes.faction.fondation_scp
```

Le nœud après le préfixe devient le grade envoyé à l'API (les `.` sont remplacés par des espaces).

## Déclencheurs

- Connexion joueur (délai 2 s)
- Commande `/redlakessync`

## Boucle RP complète

1. LuckPerms change le grade in-game
2. Plugin → API → base PostgreSQL + habilitation
3. Joueur se connecte au site → intranet, transmissions, archives
4. Rapport RP → webhook Discord staff → traitement `/staff`
