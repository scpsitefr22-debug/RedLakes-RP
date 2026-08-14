# Bot Discord REDLAKES RP

Bot officiel du serveur Minecraft SCP-RP **REDLAKES**. Il relie les comptes
Discord aux comptes Minecraft, synchronise les grades (ex. Civil -> Soldat Garde)
et donne acces a l'encyclopedie, aux profils et au statut serveur.

## Securite du token

- Le token n'est **jamais** ecrit dans le code : il est lu depuis `.env`.
- Si un token a ete partage/commit, **regenere-le** :
  Discord Developer Portal > ton application > Bot > **Reset Token**.
- `.env` est ignore par Git.

## Prerequis (Discord Developer Portal)

1. https://discord.com/developers/applications -> **New Application**
2. Onglet **Bot** :
   - Reset Token -> copie le token dans `DISCORD_BOT_TOKEN`
   - Active **Server Members Intent** (necessaire pour la bienvenue / roles)
3. Onglet **General Information** : copie l'**Application ID** dans `DISCORD_CLIENT_ID`
4. Onglet **OAuth2 > URL Generator** :
   - Scopes : `bot`, `applications.commands`
   - Permissions : `Manage Roles`, `Manage Nicknames`, `Manage Channels`,
     `Send Messages`, `Embed Links`, `Read Message History`
   - Ouvre l'URL generee pour inviter le bot sur ton serveur
5. Sur Discord, active le **Mode developpeur** (Parametres > Avances),
   clic droit sur le serveur > Copier l'identifiant -> `DISCORD_GUILD_ID`

## Configuration

```bash
cp .env.example .env
# puis renseigne les variables (token, client id, guild id, SYNC_API_KEY identique a l'API)
```

`SYNC_API_KEY` doit etre **identique** a celle de `apps/api/.env`.

## Bot autonome (dependances isolees)

Ce bot est **independant du reste du monorepo**. Il est volontairement **exclu
des workspaces npm de la racine** (`"!apps/discord-bot"` dans le `package.json`
racine) afin de posseder son **propre `node_modules` local** dans
`apps/discord-bot/`.

Consequences :

- L'install et le lancement se font **dans ce dossier**, sans dependre du
  hoisting des workspaces ni d'un `npm install` global de la racine.
- Un `node_modules` racine corrompu/partiel **n'impacte plus** le bot.
- Toutes ses dependances directes sont listees dans son propre `package.json`
  (`discord.js`, `dotenv`, et en dev `tsx`, `typescript`, `@types/node`).

## Lancer

Depuis `apps/discord-bot/` :

```bash
npm install      # cree apps/discord-bot/node_modules (autonome)
npm run verify   # diagnostic token / serveur
npm run setup:guild  # cree/retrouve les salons STAFF TECHNIQUE (une fois ou a chaque lancement)
npm run deploy   # enregistre les commandes slash (a refaire si tu en ajoutes)
npm run dev      # demarre le bot (rechargement auto)
```

Ou depuis la racine du projet : double-clic sur **`Lancer-Bot-Discord.bat`**
(le script `scripts/start-bot.ps1` installe les dependances locales si besoin,
puis verifie, deploie et lance le bot).

## Commandes

| Commande | Description |
|----------|-------------|
| `/link <code>` | Lie Discord a Minecraft (code genere sur le site) |
| `/unlink` | Delie le compte |
| `/profil [membre]` | Dossier personnel + sync roles RP (pour toi) |
| `/sync-roles` | Force la sync de ton grade in-game vers Discord |
| `/roles-scan` | [Staff] Re-scanne les roles RP et affiche le mapping |
| `/serveur` | Statut Minecraft + IP |
| `/grades [departement]` | Hierarchie Site-12 |
| `/wiki [section]` | Liens encyclopedie |
| `/candidature` | Postuler pour l'equipe |
| `/aide` | Liste des commandes |
| `/ping` | Etat bot + API |

## Auto-setup : salons STAFF TECHNIQUE

Au demarrage, le bot peut **creer automatiquement** la categorie et les salons
dans `🛡 | 【🛠 STAFF TECHNIQUE】` (ou l'equivalent test).

| Variable | Defaut | Role |
|----------|--------|------|
| `DISCORD_AUTO_SETUP` | `true` | Active la creation/recherche auto au demarrage |
| `DISCORD_SETUP_MODE` | `test` | `test` = categorie `[TEST] ...` + salons `test-*` ; `prod` = noms finaux |
| `DISCORD_CATEGORY_STAFF` | vide | ID d'une categorie existante (sinon recherche/creation par nom) |
| `DISCORD_CATEGORY_NAME` | vide | Nom categorie en mode prod (defaut : STAFF TECHNIQUE) |

Salons crees (ou retrouves) :

| Salon (prod) | Salon (test) | Usage |
|--------------|--------------|-------|
| `logs-bot` | `test-logs-bot` | `CHANNEL_LOGS` |
| `bienvenue` | `test-bienvenue` | `CHANNEL_WELCOME` |
| `annonces-fondation` | `test-annonces-fondation` | `CHANNEL_ANNOUNCES` + flux site |
| `transmissions-site` | `test-transmissions-site` | Flux Discord -> Site |

Les IDs deja renseignes dans `.env` (`CHANNEL_*`) ne sont **pas ecrases**.
Le bot a besoin de la permission **Gerer les salons** pour creer la categorie.

En mode **test**, tu peux laisser les salons vides dans `.env` : le bot configure
tout seul sans toucher a une future config prod.

## Synchronisation automatique des grades RP

Au demarrage, le bot **detecte les roles deja presents** sur Discord
(les noms peuvent differer : "Soldat Garde D" = "Soldat Garde") et les **reorganise**
(couleurs par branche, separateurs, hierarchie). Il ne cree de nouveaux roles
**que si** `DISCORD_AUTO_CREATE_ROLES=true`.

**Discord -> Site** : quand un joueur lie recoit un role RP sur Discord, son grade
se met a jour automatiquement sur le site (dashboard, /joueurs).

Regenerer le catalogue apres mise a jour de l'Excel :

```bash
python scripts/generate-rp-catalog.py "chemin/vers/Branche Du Site 12.xlsx"
```

**Jamais modifies** : roles staff, admin, mod, Membre, Joueur, Civil, Visiteur,
roles techniques et boosts.

**Roles manquants** : si un grade du catalogue n'existe pas encore sur Discord,
le bot le **cree automatiquement** avec la couleur de sa branche (Securite = bleu,
Scientifique = vert, Maintenance = orange, etc.).

**Rangement propre** : separateurs par departement + hierarchie Site-12 :
```
━━━ CONSEIL OMEGA ━━━
━━━ SECURITE ━━━
━━━ SCIENTIFIQUE ━━━
...
```
Les salons bot sont aussi ranges dans la categorie STAFF TECHNIQUE.
Desactive avec `DISCORD_AUTO_ORGANIZE_ROLES=false`.

Quand un grade change (plugin Minecraft -> API, `/link`, `/profil`, `/sync-roles`,
connexion OAuth) :

1. le **site** est mis a jour ;
2. une annonce **webhook** part dans Discord (si `DISCORD_WEBHOOK_URL`) ;
3. le bot retire l'ancien role RP et assigne le nouveau, **sans toucher** aux
   autres roles du membre.

`DISCORD_ROLE_MAP` est **optionnel** : surcharge manuelle si un role Discord a un
nom different du grade in-game :

```json
{ "Soldat Garde": "2345678901" }
```

(Les IDs : Parametres serveur > Roles > clic droit > Copier l'identifiant.)

Le bot doit etre **au-dessus** des roles RP qu'il gere (Parametres serveur > Roles).

## Pont Discord -> Site : "Transmissions de la Fondation" (theme SCP)

Le bot fait office de **piece centrale** du site : il surveille certains salons et
relaie l'activite a l'API (`POST /api/sync/discord/event`). L'API transforme chaque
evenement en **transmission RP** (style Fondation : noms de code, niveaux
d'habilitation, horodatage Site-12) puis le site l'affiche sur la page
**`/transmissions`** (et un apercu sur l'accueil).

### Confidentialite (par defaut)

- Les **pseudos** sont **codifies** cote API en designations RP (`Agent-7C3F`...),
  de maniere **stable mais non reversible** (hash sale). Le vrai pseudo n'est jamais
  stocke pour les salons prives.
- Pour les salons prives, **aucun message brut** n'est transmis : seules des
  metadonnees (salon, auteur anonymise, horodatage) partent vers l'API.
- Le pseudo reel et un **extrait** ne sont relayes que pour les salons **`public: true`**
  (et l'extrait necessite l'intent `MessageContent`, voir plus bas).

### Variables a configurer

| Variable | Role |
|----------|------|
| `DISCORD_TRANSMISSIONS` | Interrupteur global (`true` par defaut) |
| `DISCORD_RELAY_MEMBERS` | Relayer arrivees/departs de membres (`true` par defaut) |
| `DISCORD_CHANNEL_MAP` | Salons ecoutes -> classification RP (JSON, voir ci-dessous) |
| `DISCORD_ENABLE_MESSAGE_CONTENT` | Active l'intent privilegie pour les extraits (`false` par defaut) |

Exemple de `DISCORD_CHANNEL_MAP` :

```json
{
  "111111111111111111": { "label": "Annonces", "clearance": 1, "public": true, "kind": "announce" },
  "222222222222222222": { "label": "Rapports d'incident", "clearance": 3, "public": false, "kind": "message" }
}
```

- `label` : nom RP du secteur affiche sur le site.
- `clearance` : niveau d'habilitation (1 a 5) requis pour lire la transmission.
- `public` : `true` => pseudo + extrait ; `false` => metadonnees seules (expurge).
- `kind` : `announce` pour les salons d'annonces, `message` sinon.

> Seuls les salons listes dans `DISCORD_CHANNEL_MAP` sont ecoutes. Sans mapping,
> aucun message n'est relaye (seuls les arrivees/departs le sont, en niveau 1).

### Intents Discord

Le bot ajoute l'intent **`GuildMessages`** (non privilegie) pour detecter les
messages des salons surveilles. Le **contenu** des messages n'est PAS lu par defaut
(seules les metadonnees). Pour inclure un **extrait** des salons publics, active
l'intent privilegie **Message Content** :

1. Developer Portal > Bot > **Privileged Gateway Intents** > coche **Message Content Intent**.
2. Mets `DISCORD_ENABLE_MESSAGE_CONTENT="true"` dans `.env`.

Si tu actives la variable **sans** cocher l'intent dans le portail, Discord refuse
la connexion : laisse `false` tant que l'intent n'est pas active.
