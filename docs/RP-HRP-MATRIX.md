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
| `/factions/[id]` | HYBRIDE | Organigramme complet, effectifs, relations, départements, docs liés | **Fort** — directive §10/§13 : un civil ne doit pas voir organigramme, effectifs, salaires, opérations, membres, relations secrètes | Server-side : séparer public (nom, description générale) de ce qui nécessite appartenance/clearance (roster, relations, docs liés) | **P0** |
| `/departements`, `/departements/[id]`, `/departements/site-12` | HYBRIDE | Organigramme + pay/quota réels | Modéré — pay/quota = mécanique de jeu utile à connaître, mais l'organigramme complet Site-12 en un coup d'œil casse la découverte | Garder public l'existence des départements ; restreindre organigramme/staffing complet à l'appartenance faction | P1 |
| `/grades`, `/grades/[slug]` | HYBRIDE | Référence de progression (pay, quota, accès) | Faible-modéré — les joueurs ont besoin de connaître leur voie de progression | Probablement OK de garder en référence publique | P2 |
| `/intranet` | RP immersif | Espace interne par faction | **Fort — metagame et fuite inter-faction** si le contenu n'est pas réellement isolé par faction/département (directive §13, §16) | Confirmer que l'API restreint par appartenance réelle, pas juste par affichage conditionnel | **P0** |

## Compte / Identité

| Route | Type | Contexte | Risque | Action | Priorité |
|---|---|---|---|---|---|
| `/connexion`, `/bienvenue` | HRP | Auth réelle (déjà auditée cette session) | Aucun | Aucune | — |
| `/integration` | HYBRIDE | Quiz d'onboarding déguisé en mémo IC | Confusion joueur/personnage — trop bien caché | Bandeau explicite "ceci est un tutoriel" en haut | P2 |
| `/dashboard` | HYBRIDE | Fiche perso + vrais réglages de compte | Déjà séparé en sections d'après les tests de cette session, mais à confirmer qu'aucune donnée de compte (mdp, sessions) ne fuite dans une vue "personnage" publique | Confirmer la séparation stricte identité RP / activité RP / compte (directive §15) | P1 |
| `/actualites`, `/actualites/[id]` | HYBRIDE | Mélange patch notes réels et actus RP dans un flux non différencié | Confusion UX, pas sécurité | Séparer par tag/onglet (directive §20) | P1 |

## CORE — le plus gros chantier

| Route | Type | Contexte | Risque | Action | Priorité |
|---|---|---|---|---|---|
| `/core` (11 apps : Profil, Notifications, Rapports, Carte, Missions, Personnel, Équipes, Documents, Communications, Messagerie, OPHIS) | RP immersif | Regroupe rapports, messagerie, roster, missions, documents — recoupe largement Intranet et Dashboard | **Le plus large** — mêmes questions de cloisonnement faction/département/clearance qu'Intranet et Documents, mais à l'échelle de tout un OS simulé | Auditer chaque app CORE une par une pour la question "qui voit quoi" | **P0** (vu l'ampleur) |

## Staff — HRP, risque sécurité classique (pas RP)

| Route | Type | Contexte | Risque | Action | Priorité |
|---|---|---|---|---|---|
| `/staff/*` (30+ pages CRUD) | HRP | Déjà protégé par rôle (STAFF/ADMIN) | Aucun niveau RP ; risque sécurité classique si les guards ne sont pas réellement server-side | Alléger l'habillage RP (proposé précédemment) ; vérifier les guards | P1 (UX) / **P0** si les guards ne sont pas vraiment server-side — à vérifier |
| `/lore/cms`, `/lore/cms/[id]`, `/lore/cms/nouveau` | HRP | Hors `/staff/`, **pas de garde client** | Réel si l'API ne protège pas non plus | Vérifier le guard API ; déplacer sous `/staff/` pour cohérence | **P0** si le garde API est absent, P2 sinon (cosmétique) |

## Transversal (pas une route unique)

| Zone | Type | Contexte | Risque | Action | Priorité |
|---|---|---|---|---|---|
| Recherche globale + autocomplete | — | Interroge tout le contenu | **Critique** (directive §24) — une recherche interdite ne doit jamais retourner l'information | Auditer si la recherche respecte déjà les permissions ou retourne tout sans filtre | **P0** |
| Sanctions | — | Historique RP (rétrogradation) et HRP (ban/mute Discord) potentiellement dans un seul modèle/affichage | Mélange joueur/personnage si affiché comme un seul historique de personnage | Vérifier le modèle `Sanction` actuel : distingue-t-il déjà type RP vs HRP ? | P1 |

## Prochaine étape suggérée

Les lignes **P0** ci-dessus sont des hypothèses de risque, pas des fuites confirmées — chacune dit "à vérifier". La suite logique (Phase 4 de la Master Directive, "Audit des fuites API") serait de vérifier ces 6 points un par un :

1. Wiki — clearance sur les dossiers SCP classifiés
2. Documents classifiés — filtrage server-side réel
3. Factions/[id] — fuite d'organigramme/effectifs aux non-membres
4. Intranet — cloisonnement réel par faction/département
5. CORE — cloisonnement par app
6. Recherche globale — respect des permissions
7. Guards staff (`/staff/*` et `/lore/cms`) — réellement server-side

Le reste (P1/P2) est plus structurel/UX, pas des trous de sécurité.
