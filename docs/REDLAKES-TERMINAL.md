# REDLAKES TERMINAL — Document de design

> Saga narrative immersive en 9 chapitres. Terminal sécurisé Site-12. Sauvegarde globale partagée.

## Vision

Le joueur n'est pas un héros — c'est un employé. Le monde continue avec ou sans lui. L'expérience doit donner l'impression d'utiliser un véritable système informatique de la Fondation, pas un visual novel.

## Structure

| Chapitre | Titre | Sous-titre | Statut |
|----------|-------|------------|--------|
| I | REDLAKES TERMINAL I | Intégration | Prototype jouable |
| II | REDLAKES TERMINAL II | Protocoles | Planifié |
| III | REDLAKES TERMINAL III | Surface | Planifié |
| IV | REDLAKES TERMINAL IV | Égouts | Planifié |
| V | REDLAKES TERMINAL V | Audit | Planifié |
| VI | REDLAKES TERMINAL VI | Silence | Planifié |
| VII | REDLAKES TERMINAL VII | Brèche | Planifié |
| VIII | REDLAKES TERMINAL VIII | Corruption | Planifié |
| IX | REDLAKES TERMINAL IX | Héritage | Planifié |

Chaque chapitre est jouable seul. La **Global Narrative Save (GNS)** relie toutes les décisions.

## Global Narrative Save

Fichier local immuable côté joueur. Schéma versionné dans `packages/narrative-core`.

### Données mémorisées

- Personnages rencontrés, morts, promus
- Choix saga (`sagaChoices`) — traversent les 9 chapitres
- Mémoire par personnage (confiance narrative, pas jauge visible)
- Documents lus, vidéos vues, SCP rencontrés
- Événements offline (monde continue sans le joueur)
- Progression par chapitre

### Règles

1. **Chapitre IX sans historique** → le Site traite le joueur comme un inconnu
2. **8 chapitres terminés** → personnages se souviennent, branches débloquées
3. **Choix Ch.I** (ex. sauver Dr. Chen) → impact Ch.III, VII, IX

## Architecture technique

```
packages/narrative-core/     Moteur GNS + contenu narratif
apps/terminal/               Prototype UI (Vite + React)
apps/web/                    Extension web future (Phase 2)
```

### Moteur narratif

- Nœuds de dialogue avec conditions contextuelles
- Templates de réponses selon mémoire / flags / chapitres complétés
- Événements offline programmés (`triggerAfterSeconds`)
- Pas de LLM requis en v1

### Applications terminal

| App | Ch.I | Rôle |
|-----|------|------|
| Messagerie | ✅ | Cœur narratif |
| Courrier | ✅ | Formel, convocations |
| Base SCP | ✅ | Fiches débloquables |
| Personnel | ✅ | Organigramme dynamique (GNS) |
| CASSIE | ✅ | IA contextuelle |
| Journal incidents | ✅ | Timeline lore |
| Protocoles confinement | Ch.II | — |
| Base AEGIS | Ch.V | — |
| Serveur corrompu | Ch.VIII | — |

## Chapitre I — Intrigue

**Acte** : Premier jour au Site-12.

**Personnages** : RH Terminal, Directeur, Dr. Mei Chen, CASSIE.

**Choix structurant saga** :

| Clé | Valeurs | Impact futur |
|-----|---------|--------------|
| `ch1_briefing_response` | professional / curious / reluctant | Ton Directeur |
| `ch1_dr_chen_fate` | saved / reported / ignored | Promotion Ch.III, protection Ch.VII, fils Ch.IX |

## Monétisation

- **100 % gratuit** — même histoire pour tous
- Bouton « Soutenir le projet » (don libre)
- Pub **optionnelle** → cosmétiques uniquement (thèmes terminal)
- **Jamais** de pub obligatoire ni contenu narratif payant

## Plateformes

| Phase | Plateforme | Sauvegarde |
|-------|------------|------------|
| 1 (actuelle) | Web prototype (`apps/terminal`) | localStorage |
| 2 | Windows .exe (Tauri/Electron) | Fichier local `%APPDATA%` |
| 3 | Web intégré (`redlakes-rp`) | Import GNS PC + sync cloud optionnelle |

## Lancer le prototype

```powershell
cd C:\Users\flech\Projects\redlakes-rp
npm install
npm run dev:terminal
# → http://localhost:3020
```

## Prochaines étapes

1. Compléter le fil narratif Ch.I (fin d'acte, marquer chapitre terminé)
2. Sons ambiants (ventilation, clavier, alertes)
3. Wrapper Tauri pour build Windows offline
4. Chapitre II — protocoles + Commandant Nu-7
5. Import GNS dans `apps/web` (route `/terminal`)
