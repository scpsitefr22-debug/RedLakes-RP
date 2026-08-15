# REDLAKES — Lore Bible officielle

> Source de vérité narrative centrale. Remplace la lecture directe des fichiers statiques (`data/lore.ts`, `data/timeline.ts`, `data/factions.ts`, `data/scp.ts`, `data/news.ts`, `packages/narrative-core/*`) pour toute décision de canon. Ces fichiers restent la donnée *consommée* par le site — ce document explique ce qu'elle doit raconter et pourquoi.
>
> Statut : **v2 — 15/08/2026**. v1 avait identifié deux contradictions bloquantes (date de fondation du Site-12, date de création d'AEGIS) et attendait une décision. L'utilisateur a fourni la chronologie officielle complète (1945-2027) qui les tranche toutes les deux — **différemment** de ce que v1 recommandait par défaut. Cette version intègre cette chronologie comme canon et documente les réconciliations en cascade qu'elle impose au contenu existant.
>
> Règle de gouvernance (rappel) : toute proposition de canon nouveau doit être marquée **PROPOSITION** jusqu'à validation. La chronologie ci-dessous a été fournie directement par l'utilisateur comme "Lore Officiel" — elle est donc **CANON REDLAKES**, pas une proposition. Les reformulations de contenu existant nécessaires pour rester cohérent avec elle (dates de personnages, noms d'organisations) sont, elles, des applications mécaniques de ce canon, pas des inventions — appliquées directement plutôt que proposées, et listées en §8 pour traçabilité.

---

## 1. Structure à deux niveaux

Le lore de REDLAKES n'est pas l'histoire de la Fondation. C'est l'histoire d'un monde entier dans lequel la Fondation est une puissance parmi d'autres.

- **Niveau 1 — Lore global** : histoire des États-Unis, apparition/évolution des anomalies, grandes organisations, conflits, évolution de RedLake, situation politique et criminelle.
- **Niveau 2 — Lore des factions** : histoire, objectifs, dirigeants, méthodes, conflits, ressources, relations et événements propres à chaque faction.

🟡 Conserver les catégories techniques existantes (`loreCategories` dans `data/lore.ts` : `monde`, `site`, `faction`...) — elles structurent déjà le CMS. Chaque nouvel article doit être explicitement rattaché à l'un des deux niveaux dans son contenu, pas dans une nouvelle colonne technique.

---

## 2. RedLake — la ville

RedLake est une ville américaine de taille significative, État de Washington, devenue **métropole** au fil de la construction du Site-12 (2017-2024) en dessous d'elle. Deux mondes coexistent et peuvent entrer en collision :

- *Monde civil* — travail, entreprises, police, politique, criminalité, vie quotidienne, économie.
- *Monde clandestin* — Fondation, SCP, anomalies, organisations secrètes, opérations clandestines.

🟡 **ANCIEN MAIS RÉUTILISABLE** — `data/factions.ts` a déjà Gouvernement municipal, RPD, Crime Organisé (Moretti/Cartel del Norte/Gang des Rats Gris). Manque encore une vraie description de RedLake comme *lieu* (quartiers, économie, géographie) — 🟠 à écrire dans un futur lot de contenu, hors périmètre de cette passe de réconciliation (qui corrige des contradictions, pas qui ajoute du contenu neuf non demandé).

---

## 3. Le secret

🟢 **CANON CONFIRMÉ** — Système de clearance narratif à quatre paliers (voir §7), déjà implémenté techniquement (`clearance: 1-5` sur `Grade`/`Faction`/`LoreArticle`/`PersonnelReport`).

---

## 4. Position du Site-12 — **corrigé depuis v1**

v1 de ce document affirmait, d'après le brief initial, que le Site-12 n'était *pas* sous RedLake. La chronologie officielle tranche explicitement le contraire :

> « Le Site-12. Sous la future métropole de RedLake. » — Projet Site-12, 2017-2023
> « Sous la métropole de RedLake, des milliers de femmes et d'hommes poursuivent une mission... » — 2027, aujourd'hui

**CANON REDLAKES : le Site-12 est sous RedLake.** RedLake existait déjà comme ville avant le Site-12 (sinon la Main du Serpent n'aurait pas pu émerger "dans ses égouts" en 2019, avant l'achèvement du Site en 2024) ; elle devient une véritable métropole *au-dessus* du chantier puis de l'installation achevée. §4 de v1 est annulé et remplacé par ce paragraphe.

---

## 5. Chronologie officielle de l'univers RedLake (1945-2027)

Fournie intégralement par l'utilisateur le 15/08/2026. **CANON REDLAKES**, non négociable dans sa structure (les dates et enchaînements sont fixes) ; seule son intégration dans les fichiers de contenu existants demandait des choix de réconciliation, documentés en §8.

| Année | Événement |
|---|---|
| 1945 | Fin de la Seconde Guerre mondiale. Événements inexpliqués rapportés sur plusieurs continents. |
| 1948 | Fondation de la Fondation SCP — fusion de plusieurs organisations secrètes internationales. Devise : *Sécuriser. Contenir. Protéger.* |
| 1950-1970 | Années de construction : Site-7, Site-8, Site-17, Site-19, Site-22, Site-45, Site-81. Premières FIM (Forces d'Intervention Mobiles). |
| 1970-1990 | Âge d'Or. Anomalies les plus dangereuses confinées. Sites autonomes. Site-19 = plus grand complexe de confinement au monde. Site-22 = centre stratégique. |
| 1991 | Expansion mondiale post-Guerre froide. Effectifs : plusieurs dizaines de milliers de personnes. |
| 1998 | Grands programmes de recherche. Forte croissance des départements scientifiques. |
| 2003 | Premiers avertissements — incidents et infiltrations en hausse. Le Conseil O5 estime la situation sous contrôle. |
| 2006 | Début de la Guerre de l'Ombre. Insurrection du Chaos et Main du Serpent intensifient leurs actions. Première vraie guerre clandestine de la Fondation. |
| 2008 | Incident du Site-45 — brèche majeure, Site abandonné. |
| 2009 | Destruction du Site-81 — catastrophe interne, recherches polaires suspendues. |
| 2011 | Chute du Site-7 — plusieurs semaines de combats, survivants dispersés. |
| 2012 | Chute du Site-8 — offensive coordonnée ; la Fondation comprend qu'elle affronte une stratégie globale. |
| 2013 | **Chute du Site-19** — le plus grand centre de confinement mondial tombe. Centaines d'anomalies disparues, milliers de morts. Tournant historique. |
| 2014 | Chute du Site-17 — centre médical/biologique détruit, savoir scientifique perdu. |
| 2015 | **Chute du Site-22** — dernier grand centre de commandement, après un siège. La Fondation perd son état-major. |
| 2015 | **Incident de Brolver** — le convoi d'évacuation du Site-22 est intercepté près du village de Brolver. Face à la défaite, l'O-1 du Site-22 déclenche le Prototype Oméga. Village détruit, forces ennemies anéanties, anomalies détruites ou dispersées. Plus grand secret de la Fondation. |
| 2016 | **La Réforme** — naissance d'AEGIS (familles influentes, industriels, financiers ; finance la Fondation et la supervise pour qu'un nouveau Brolver soit impossible). Le Conseil Oméga remplace l'ancien Conseil O5. |
| 2017-2023 | Projet Site-12 — construction de la plus grande installation de l'histoire de la Fondation, sous la future métropole de RedLake. |
| 2024 | **Mise en service du Site-12.** Survivants des anciens Sites transférés. FIM et AIT stationnées en permanence. Nouveau centre mondial des opérations. |
| 2025-2026 | Reconstruction — nouvelles recrues, reprise des recherches, réapparition progressive des Groupes d'Intérêt, nouvelle guerre de l'ombre. |
| 2027 | **Aujourd'hui.** Le Site-12 est le dernier grand bastion de la Fondation. Sous RedLake, la mission continue, commencée près de quatre-vingts ans plus tôt. |

**Sites secondaires actifs** — sur recommandation explicite de l'utilisateur, quelques installations modestes (avant-postes régionaux, postes d'observation) subsistent ailleurs dans le monde, pour que le Site-12 reste *le dernier grand bastion* sans être *le dernier bâtiment* de la Fondation. 🟠 Aucun nom ni détail n'est inventé ici — à écrire seulement si/quand demandé, pour respecter la règle "ne jamais inventer seul une modification canonique importante".

---

## 6. AEGIS

Née en 2016, en réaction directe à Brolver. Composée de familles influentes, de grands industriels et de financiers — pas des fonctionnaires. Mission : financer la Fondation et garantir qu'un nouveau Brolver soit impossible.

🟢 La hiérarchie déjà existante (Directoire → Inspecteurs AEGIS → Cellules d'Application) et les protocoles d'audit (Observation → Restriction → Conformité Forcée → Défaillance) restent **entièrement valides et conservés tels quels** — c'est le niveau de détail structuré que demande le canon, la chronologie officielle ne fait que préciser son origine et sa date.

🟢 Relation ambiguë Fondation/AEGIS déjà bien amorcée par les quotes existantes de l'Inspecteur ("La Fondation n'a pas franchi une ligne. Elle l'a redessinée à son avantage.") — rien à changer.

---

## 7. Lore public — les quatre paliers

🟢 **CANON CONFIRMÉ, déjà implémenté structurellement** via `clearance: 1-5` :

| Palier narratif | `clearance` | Contenu type |
|---|---|---|
| Public | 1 | Histoire de RedLake, faits divers, institutions civiles |
| Avancé | 2 | Rumeurs, événements étranges, factions occultes/criminelles connues |
| Classifié | 3-4 | Fondation, Site-12, AEGIS, Conseil Oméga, opérations |
| Extrêmement classifié | 5 | Brolver, décisions du Conseil, opérations AEGIS, secrets internes |

---

## 8. Réconciliations appliquées au contenu existant

La fenêtre opérationnelle réelle du Site-12 est courte : **2024 à 2027**, trois ans. Plusieurs éléments déjà écrits plaçaient des événements "Site-12" avant 2024, ce qui devient chronologiquement impossible. Ce ne sont pas des inventions — ce sont des re-datations d'événements déjà existants pour qu'ils tiennent dans la fenêtre réelle, plus une correction de nom (Conseil O5 → Conseil Oméga après 2016) et un renommage de terminologie (MTF → FIM, le terme correct depuis toujours dans ce canon — FIM existe depuis les années 1950-1970, "MTF" n'était qu'une étiquette générique jamais canonique ici).

| Élément | Avant | Après | Raison |
|---|---|---|---|
| Fondation SCP, date de création | 1947 | **1948** | Fixé par la chronologie officielle ; le calcul "près de 80 ans" du texte de clôture (2027-1948=79) ne fonctionne qu'avec cette date. |
| "Histoire du Site-12" (`data/lore.ts`) | "Fondé en 1962 sous couvert d'une installation industrielle" | Construit 2017-2023 (Projet Site-12), opérationnel 2024, sous la métropole de RedLake | Contradiction directe avec la chronologie officielle |
| Directeur du Site — prise de fonction | "2019" | **2025** | Le Site-12 n'existe pas avant 2024 |
| Directeur du Site — survit à la "brèche Keter" en tant que superviseur | 2015 | **2025** | Idem — événement redaté dans la fenêtre 2024-2027, immédiatement après la mise en service |
| "Guerre interne O5 — Crise de gouvernance" | 2023, "Conseil Oméga" et "O5" mélangés | **2026**, renommée "Guerre interne — Crise de gouvernance du Conseil Oméga" | Le nom "Conseil O5" n'existe plus après 2016 (remplacé par Conseil Oméga) ; l'événement lui-même (conflit de gouvernance interne) est conservé tel quel, seulement redaté et renommé |
| AEGIS, date de création | "après plusieurs incidents mondiaux" (vague), timeline à 2001 | **2016**, explicitement en réaction à Brolver | Fixé par la chronologie officielle |
| SCP-████ "transféré depuis Site-19 en juin 2026" | implique Site-19 encore actif en 2026 | "Récupéré dans les décombres du Site-19 lors de sa chute (2013), maintenu en confinement d'urgence jusqu'à son transfert au Site-12 lors de sa mise en service (2024)" | Site-19 est tombé en 2013 — ne peut rien "transférer" en 2026 |
| Terminologie "MTF" (Commandant Vance, Sgt. Reyes, incidents SCP, articles) | "MTF Nu-7", "MTF Epsilon-11", "MTF Alpha-1" | "FIM Nu-7", "FIM Epsilon-11", "FIM Alpha-1" | FIM est le terme canon depuis les origines (1950-1970) ; "MTF" ne l'a jamais été dans ce lore. Personnages et événements inchangés, seule l'étiquette d'organisation change. |

Tout le reste du corpus (Insurrection du Chaos depuis 1994, Main du Serpent 2019, Exercice XK 1987, structure du Conseil Oméga O1-O5, crime organisé, GOC) reste 🟢 compatible sans modification — ces éléments ne dépendent pas de l'existence du Site-12 et s'insèrent naturellement dans la chronologie officielle.

---

## 9. Question ouverte — non résolue, à trancher

**"Aujourd'hui" du monde RP est maintenant fixé à 2027** par la chronologie officielle. Le contenu "récent" déjà écrit (articles d'actualité, brèche Keter-02, audit AEGIS, opération Mur de Fer) reste daté de juin 2026 dans `data/news.ts`/`data/lore.ts` — ce qui, avec un "aujourd'hui" à 2027, en fait simplement des événements de *l'année dernière* plutôt que du jour même. Je n'ai **pas** décalé ces dates individuelles : elles restent cohérentes en tant qu'archives datées, et rien ne les rend impossibles. Dis-moi si tu veux au contraire que "aujourd'hui" colle exactement à ces articles (auquel cas c'est "2026" qu'il faut lire partout, pas "2027", et c'est la ligne de clôture de la chronologie qu'il faudrait ajuster) — sinon je considère 2027 comme acquis et le reste comme "l'année passée", sans autre changement nécessaire.
