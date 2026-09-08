# Matrice RP / HRP / Hybride — REDLAKES

Audit de toutes les routes du site, produit à partir d'une exploration complète
de `apps/web/src/app/` (74 pages). Sert de base à la Master Directive RP/HRP/
Connaissance/Anti-métagame.

## État des systèmes (clarifié — pas en pause, contrairement à une hypothèse
initiale de la Master Directive)

- **CORE (`/core`)** : entièrement construit et en production — séquence de
  boot, taskbar, 11 apps en fenêtres, déjà reskinné par faction. **Pas en
  pause.**
- **Missions** : page staff complète (`/staff/missions`), widget dashboard,
  app CORE. **Pas en pause.**
- **Economy** et **intégration Minecraft** : aucune trace dans le code
  exploré (seuls `minecraftUsername`/`minecraftUuid` existent, pour lier
  l'identité). Jamais commencés — pas "en pause", juste pas encore abordés.

## Légende

- **Type** — RP / HRP / HYBRIDE
- **Risque** — mécanisme de fuite ou de métagame potentiel, pas juste un avis esthétique
- **Priorité** — P0 (sécurité/fuite réelle à vérifier en urgence), P1 (structure/UX à corriger), P2 (amélioration), — (aucune action)

## Public — Encyclopédie

| Route | Type | Contexte | Risque | Action | Priorité |
|---|---|---|---|---|---|
| `/` | HYBRIDE | Landing marketing, pas de données sensibles | Aucun | Aucune | — |
| `/wiki`, `/wiki/[id]` | RP | Base de connaissances SCP publique | Metagame si les dossiers complets (confinement, tests, incidents) sont visibles sans tenir compte de la clearance ; rappel : les statuts de breach doivent rester staff-driven, jamais simulés | Vérifier côté API si `/wiki/[id]` limite déjà le contenu classifié par clearance | **P0** si aucune restriction actuelle |
| `/lore`, `/lore/[id]` | RP | Déjà gated par `ClearanceBanner` par département | Faible — déjà partiellement protégé | Confirmer que le gating est réellement server-side, pas juste le bandeau visuel | P1 |
| `/personnages`, `/personnages/[id]` | RP | NPC / figures publiques | Aucun a priori | Aucune | — |
| `/chronologie` | RP | Timeline complète 1945→aujourd'hui | Metagame si contient des infos censées être découvertes en jeu | À évaluer selon contenu réel | P2 |
| `/evenements`, `/evenements/[id]` | RP | Archives d'incidents passés | Faible si événements clos/publics | Aucune | — |
| `/carte` | RP | Carte interactive du monde RP | Metagame si zones/installations secrètes visibles sans restriction de connaissance | Filtrer les marqueurs selon le contexte joueur (voir directive §28) | P1 |
| `/transmissions` | RP (façade sur Discord réel) | Déjà filtré par clearance selon l'exploration | Faible | Ne jamais exposer la source technique (Discord) au frontend RP | — |
| `/galerie` | HRP léger | Médias communautaires (screenshots) | Aucun | Aucune | — |
| `/archives` | RP | Lié à l'auth réelle, déjà nécessite login | À vérifier : filtrage clearance server-side ? | Auditer | P1 |
| `/documents`, `/documents/[slug]` | RP | Documents classifiés | **Critique si mal protégé** — la restriction doit être server-side (jamais "reçoit tout puis cache", voir directive §25) | Auditer l'API classified-documents : le filtrage se fait-il avant l'envoi ? | **P0** |
| `/joueurs`, `/joueurs/[username]` | HYBRIDE | Vrai roster joueurs, présentation RP | Faible — données déjà publiques par design | Aucune a priori | — |
| `/candidatures` | HRP | Formulaire de recrutement réel | Aucun | Garder le framing pratique, pas de RP à inventer ici | — |
| `/ophis` | RP pur | Chatbot local, aucune donnée réelle exposée | Aucun | Aucune | — |
| `/galerie`, `/console` | HRP | Médias / dev-only | Aucun | Aucune | — |

## Organisations — le gros du risque metagame

| Route | Type | Contexte | Risque | Action | Priorité |
|---|---|---|---|---|---|
| `/factions` | RP | Catalogue — existence des factions | Aucun — l'existence d'une faction peut être publique (directive §10) | Aucune | — |
| `/factions/[id]` | HYBRIDE | Organigramme complet, effectifs, relations, départements, docs liés | Directive §10/§13 : un civil ne doit pas voir effectifs, relations secrètes | ✅ Connexion requise pour roster/relations/budgets ; nom/description restent publics ; section "rôles" étiquetée guide pratique | Fait |
| `/departements`, `/departements/[id]`, `/departements/site-12` | HYBRIDE | Organigramme + pay/quota réels | Modéré — pay/quota = mécanique de jeu utile à connaître, mais l'organigramme complet Site-12 en un coup d'œil casse la découverte | Garder public l'existence des départements ; restreindre organigramme/staffing complet à l'appartenance faction | P1 |
| `/grades`, `/grades/[slug]` | HYBRIDE | Référence de progression (pay, quota, accès) | Faible-modéré — les joueurs ont besoin de connaître leur voie de progression | Probablement OK de garder en référence publique | P2 |
| `/intranet` | RP immersif | Espace interne par faction | **Fort — metagame et fuite inter-faction** si le contenu n'est pas réellement isolé par faction/département (directive §13, §16) | Confirmer que l'API restreint par appartenance réelle, pas juste par affichage conditionnel | **P0** |

## Compte / Identité

| Route | Type | Contexte | Risque | Action | Priorité |
|---|---|---|---|---|---|
| `/connexion`, `/bienvenue` | HRP | Auth réelle (déjà auditée cette session) | Aucun | Aucune | — |
| `/integration` | HYBRIDE | Quiz d'onboarding déguisé en mémo IC | Confusion joueur/personnage | ✅ Bandeau "hors RP" ajouté | Fait |
| `/dashboard` | HYBRIDE | Fiche perso + vrais réglages de compte | Déjà séparé en sections, confirmé lors des tests de cette session | — | Fait |
| `/actualites`, `/actualites/[id]` | HYBRIDE | Mélangeait patch notes réels et actus RP | Confusion UX | ✅ Onglets "Actualités RP" / "Annonces du site" | Fait |

## CORE — le plus gros chantier

| Route | Type | Contexte | Risque | Action | Priorité |
|---|---|---|---|---|---|
| `/core` (11 apps : Profil, Notifications, Rapports, Carte, Missions, Personnel, Équipes, Documents, Communications, Messagerie, OPHIS) | RP immersif | Regroupe rapports, messagerie, roster, missions, documents — recoupe largement Intranet et Dashboard | **Le plus large** — mêmes questions de cloisonnement faction/département/clearance qu'Intranet et Documents, mais à l'échelle de tout un OS simulé | Auditer chaque app CORE une par une pour la question "qui voit quoi" | **P0** (vu l'ampleur) |

## Staff — HRP, risque sécurité classique (pas RP)

| Route | Type | Contexte | Risque | Action | Priorité |
|---|---|---|---|---|---|
| `/staff/*` (30+ pages CRUD) | HRP | Déjà protégé par rôle (STAFF/ADMIN) | Aucun niveau RP ; risque sécurité classique si les guards ne sont pas réellement server-side | Alléger l'habillage RP (proposé précédemment) ; vérifier les guards | P1 (UX) / **P0** si les guards ne sont pas vraiment server-side — à vérifier |
| `/lore/cms`, `/lore/cms/[id]`, `/lore/cms/nouveau` | HRP | Hors `/staff/`, n'avait pas de garde client (API déjà protégée) | UX seulement — l'API refusait déjà les mutations non-staff | ✅ `layout.tsx` ajouté, même garde que `/staff/*` | Fait |

## Transversal (pas une route unique)

| Zone | Type | Contexte | Risque | Action | Priorité |
|---|---|---|---|---|---|
| Recherche globale + autocomplete | — | Interroge tout le contenu | Fallback SQL laissait passer les SCP non approuvés ; chemin Elasticsearch n'appliquait aucun filtre de département | ✅ Filtre de statut + de département appliqué aux deux chemins | Fait |
| Sanctions | — | Modèle `Sanction` entièrement lié au personnage (`playerId`) — 5 types tous implicitement RP | Aucun système de sanction HRP (mute/kick/ban compte) n'existe, distinct de Discord | **À trancher avec l'utilisateur** — nouvelle fonctionnalité à construire ou modération HRP volontairement laissée à Discord ? | En attente |

## État au 8 septembre 2026

**Audit P0 terminé** (Phase 4 de la Master Directive). Résultat réel, pas hypothétique :
- Wiki, Documents classifiés, Intranet, CORE (Rapports/Messagerie/Communications/Documents/Missions), Staff (`/staff/*`) : déjà correctement filtrés/gardés server-side, rien à corriger.
- `GET /players` et `/players/:username` : fuite confirmée (roster complet + `discordUsername`/`minecraftUuid`/`hasPassword` publics) — **corrigé**.
- `/factions/:slug`, `/factions/:slug/members`, `/faction-relations/*` : aucune garde — **corrigé** (connexion requise pour roster/relations/budgets départements).
- Recherche (SQL + Elasticsearch) : fuitait les SCP en attente de validation, ES n'appliquait aucun filtre de département — **corrigé**.
- `/lore/cms` : API déjà protégée, juste pas de garde visuel — **corrigé** (layout ajouté).

**P1 fermés** : séparation `/actualites` RP/HRP (onglets), bandeau HRP sur `/integration`, étiquette "Guide pratique" sur la section rôles de faction, verrou de connexion sur l'ensemble du site + intro d'accueil.

**P1 restant, hors périmètre technique pur** :
- **Sanctions** : le modèle `Sanction` actuel est entièrement lié au personnage (`playerId`) — les 5 types (avertissement, blâme, mise à pied, rétrogradation, bannissement) sont tous implicitement RP. Il n'existe aucun système de sanction HRP (mute/kick/ban compte, séparé de Discord) dans REDLAKES. Construire ça serait une vraie nouvelle fonctionnalité, pas une réorganisation — **à trancher avec l'utilisateur** : le veut-il, ou la modération HRP reste-t-elle uniquement l'affaire de Discord ?

**Phase 3 (Matrice de connaissance) — non commencée.** Qui a le droit de savoir quoi par faction/département/grade/clearance est du canon RP, pas une décision technique — nécessite l'utilisateur, voir directive §33 ("Ne pas inventer les règles").
