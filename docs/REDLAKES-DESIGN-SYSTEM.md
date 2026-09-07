# REDLAKES — Référentiel de design

> Ce document **formalise** le design déjà en place — il n'en invente pas un nouveau. Toutes les valeurs citées ici existent déjà dans le code au moment de l'écriture (`apps/web/src/app/globals.css`, `apps/web/src/lib/faction-themes.ts`). Règle du projet : conserver → adapter → enrichir, jamais refaire.

## Pourquoi ce document

Le site a une direction artistique qui fonctionne (noir quasi-total, rouge institutionnel, mono pour les données) et neuf identités de faction distinctes, mais rien n'était écrit noir sur blanc avant ce document — chaque nouvelle page repartait des mêmes classes par copier-coller plutôt que par référence à une source unique. Objectif : que dans six mois, une page construite sans relire tout le code ressemble quand même immédiatement au reste du site.

Tailwind v4, config CSS-based — pas de `tailwind.config.ts`, tout part de `apps/web/src/app/globals.css`.

## Couleurs

Palette réelle (`globals.css:3-14`, exposée via `@theme inline`) :

| Token Tailwind | Variable CSS | Hex | Usage réel |
|---|---|---|---|
| `background` | `--background` | `#050505` | Fond de `<body>`, quasi-noir plutôt que noir pur |
| `foreground` | `--foreground` | `#e8e8e8` | Texte principal |
| `redlake` | `--redlake-red` | `#8b0a0a` | Accent institutionnel — bordures, boutons primaires |
| `redlake-dark` | `--redlake-red-dark` | `#5c0606` | Variante sombre, dégradés |
| `redlake-glow` | `--redlake-red-glow` | `#c41e1e` | Accent vif — hover, titres de section, liens actifs |
| `metal` | `--metal` | `#3a3a3a` | Bordures neutres (`hologram-border`, `panel-flat`) |
| `metal-light` | `--metal-light` | `#5c5c5c` | Rare, accents secondaires |
| `classified` | `--classified` | `#1a1a1a` | Fond "classifié" |
| `terminal` | `--terminal-green` | `#4ade80` | Statut "en ligne" |

`--hologram: rgba(139, 10, 10, 0.15)` existe aussi mais **n'est pas exposé comme classe Tailwind** — utilisé uniquement en dur dans `.hologram-border`/`.faction-card`. Ne pas inventer de `bg-hologram`.

**Gris de texte** (Tailwind par défaut, aucune surcharge) : `text-white`/`text-foreground` pour le contenu principal ; `text-gray-400` (`#9ca3af`), `text-gray-500` (`#6b7280`), `text-gray-600` (`#4b5563`) réservés aux labels/légendes/métadonnées — jamais au texte de lecture principal. `.prose-redlake p` utilise `#b0b0b0`, une valeur ponctuelle non liée à un token, pour le texte long. **Site en dark mode uniquement** — pas de light mode, pas de `next-themes`, pas de `prefers-color-scheme`. `color-scheme: dark` posé sur `:root` (Lot 39) pour que les contrôles natifs (listes déroulantes, scrollbars) suivent aussi le thème sombre plutôt que celui de l'OS/navigateur ; `select option` reçoit en plus une couleur explicite (`#0a0a0a`/`--foreground`) en filet de sécurité pour les moteurs qui ignorent l'héritage dans le popup natif.

### Couleurs de statut — la vraie échelle unifiée

Avant ce document, "archivé" changeait de couleur selon la page (jaune ici, gris là), et les sanctions n'avaient aucune palette formelle. Voici l'échelle réelle, désormais unifiée partout où elle existait déjà et alignée là où elle ne l'était pas :

| Sémantique | Couleur | Exemple d'usage réel |
|---|---|---|
| Neutre / inactif / archivé | `text-gray-500` / `border-metal` | `NEUTRE` (relations), `NORMAL` (alerte système), `ARCHIVED` (documents, lore) |
| En attente / en cours | `text-yellow-400` | `DRAFT` (documents, lore), `TENSION` (relations), `PENDING` (rapports), `VIGILANCE` (alerte) |
| Actif / approuvé / positif | `text-green-400` | `PUBLISHED`, `ALLIE`, `REVIEWED`, `ACTIF` |
| Avertissement | `text-orange-400` | `ALERTE` (alerte système) |
| Danger / hostile / critique | `text-red-400`/`text-red-500` | `HOSTILE`, `CRISE` |

Cette échelle à 5 niveaux (gris → jaune → vert / orange → rouge) est déjà celle d'`AlertLevelBadge.tsx` — c'est la référence à suivre pour tout nouveau statut, plutôt que d'inventer une nouvelle association couleur↔sens à chaque fois.

**Classe SCP** (Safe/Euclid/Keter/Thaumiel/Apollyon) — système séparé, déjà cohérent avant ce document, à ne pas confondre avec l'échelle de statut ci-dessus : vert/jaune/rouge/violet/orange, identique dans `data/scp.ts`, `ThreatIndicator.tsx`, `ThreatGauge.tsx`, `ClassificationStamp.tsx`.

## Typographie

Deux familles chargées globalement (`layout.tsx`, `next/font/google`) : **Geist Sans** (corps, titres par défaut) et **Geist Mono** (labels, badges, données, dates — le "ton institutionnel" du site).

Échelle réelle observée sur les fiches publiques :
- `text-4xl font-bold` — titre H1 de fiche (Faction, Grade, SCP, Événement)
- `text-3xl`/`text-2xl font-bold` — titres de page catalogue
- `text-xl font-bold` (souvent avec une icône) — titres de section (H2) à l'intérieur d'une fiche
- `text-lg font-bold` / base + `font-bold` — titres de carte (H3)
- `font-mono text-[10px]`/`text-xs uppercase tracking-wide(r/st)` — l'étiquette "kicker" récurrente (labels de stats, dates, badges)

Exception délibérée : le H1 de la page d'accueil (`HeroBanner.tsx`) utilise `font-mono` avec un tracking large et l'animation `.glitch` — réservé au masthead, jamais à réutiliser sur une fiche de contenu.

## Thèmes de faction

`apps/web/src/lib/faction-themes.ts` — chaque faction a un objet `FactionTheme` complet : couleurs (`primary`/`secondary`/`accent`/`glow`), `rgba` pré-calculées, police de titre dédiée (huit Google Fonts différentes, **réservées aux titres, jamais au texte courant**), un `motif` visuel (`redacted`/`clinical`/`stencil`/`occult`/`tactical`/`letterhead`/`badge`/`neon`) et un `motion` (`reveal`/`scan`/`glitch`/`ceremonial`/`siren`/`flicker`/`formal`).

Ce système est complet et ne doit pas être dupliqué : toute nouvelle page à l'intérieur d'un `FactionThemeScope` utilise les classes `.faction-card`/`.faction-heading`/`.faction-accent`/`.faction-kicker`, jamais des couleurs en dur.

## Composants CSS existants — à réutiliser, pas à redéfinir

| Classe | Où | Rôle |
|---|---|---|
| `.hologram-border` | 132 occurrences, 75 fichiers | Carte par défaut hors contexte faction — bordure/dégradé rouge institutionnel |
| `.faction-card` / `.faction-heading` / `.faction-accent` / `.faction-kicker` | Pages sous `FactionThemeScope` | Équivalents theme-aware de `.hologram-border` — **mutuellement exclusifs** avec lui, jamais les deux sur la même carte |
| `.panel-flat` / `.panel-elevated` | Dashboard, métriques, staff/console | Hiérarchie à 3 niveaux (secondaire/standard/élevé), plus récente que `.hologram-border`, pas encore adoptée sur les fiches publiques |
| `.prose-redlake` | Contenu long (Faction, Wiki, Actualités, Lore, Documents) | Typographie de lecture (h2 souligné, paragraphes `#b0b0b0`) |
| `.classified-stamp` | Tuiles de nav dashboard/staff | Tampon mono, letter-spacing large |
| `.glitch` | Masthead, tampons de classification | Animation de hover courte |

**Layout des fiches** : conteneur `mx-auto max-w-4xl px-4 py-12` (fiches denses) ou `max-w-3xl` (fiches plus courtes) ; catalogues en `max-w-6xl`/`max-w-7xl`. Bloc d'en-tête en `p-8`, sections de contenu en `p-6`, tuiles de stats en `p-4 text-center`. Espacement entre sections : `space-y-6` à `space-y-8`. Rayon de bordure : `rounded-lg` partout par défaut (les motifs de faction `clinical`/`stencil` le remplacent volontairement par des angles nets/coupés).

## Mobile & accessibilité — état réel, pas une checklist théorique

Cet audit (mené en préparant ce document) a permis de corriger plusieurs bugs réels, déjà appliqués :

- **Menu principal inaccessible au clavier** (`Header.tsx`) — le menu déroulant ne s'ouvrait qu'à la souris (`onMouseEnter`/`onMouseLeave`). Corrigé : ouverture au focus (`onFocus`), fermeture à l'Échap et à la perte de focus, `aria-haspopup`/`aria-expanded`. Vérifié en direct : Tab ouvre le menu, Tab suivant entre dans les sous-liens, Échap referme.
- **Deux animations en boucle infinie sans respect de `prefers-reduced-motion`** — `.pulse-glow` (posé sur *tous* les boutons primaires du site via `Button.tsx`) et `.map-radar-ring` (carte). Corrigé, aligné sur le motif déjà appliqué à CORE et aux thèmes de faction.
- **Grille de stats à 3 colonnes fixes sur la fiche Wiki SCP** — cassait sur mobile (aucune classe responsive dans tout le fichier). Corrigé en `grid-cols-1 sm:grid-cols-3`.
- **Formulaires staff à colonnes fixes** (`grid-cols-[1fr_2fr_auto]` etc. sur la fiche joueur et le panneau de relations diplomatiques) — écrasaient littéralement les champs sur mobile plutôt que de simplement déborder. Corrigé en empilement à 1 colonne sous `sm:`.

**Ce qui est déjà solide, à ne pas retoucher** : la navigation responsive du header (vrai bascule desktop/mobile), `DataTable.tsx` (scroll horizontal + colonnes masquables), la hiérarchie de titres (h1→h2 propre, `<main>`/`<nav>`/`<article>` utilisés correctement), la gestion clavier de `EditableText`/`CharacterSwitcher`.

**Ce qui reste identifié mais non traité** (volontairement, hors scope de cette passe) : les ~15 formulaires CMS staff à grille fixe non responsive (usage desktop quasi-exclusif en pratique, mais un vrai gap si un jour le staff édite depuis un téléphone) ; la modale de recherche globale (`GlobalSearch.tsx`) sans sémantique de dialogue ni piège de focus ni label accessible sur le champ ; le contraste des petits libellés gris (`text-gray-500`/`600` en `text-[10px]`/`text-xs`) jamais passé dans un vérificateur de contraste réel.

## Ce que ce document ne fait pas

Il ne redessine rien. Il ne propose pas de nouvelle palette, de nouvelle police, ni de nouveaux composants visuels. Toute nouvelle fonctionnalité doit d'abord chercher ici avant d'introduire une couleur, une classe ou un espacement qui n'existe pas déjà.
