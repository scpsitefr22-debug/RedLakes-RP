# REDLAKES — Lore Bible officielle

> Source de vérité narrative centrale. Remplace la lecture directe des fichiers statiques (`data/lore.ts`, `data/timeline.ts`, `data/factions.ts`, `data/scp.ts`, `data/news.ts`, `packages/narrative-core/*`) pour toute décision de canon. Ces fichiers restent la donnée *consommée* par le site — ce document explique ce qu'elle doit raconter et pourquoi.
>
> Statut : **v1 — 15/08/2026**. Construit à partir du canon officiel transmis par l'utilisateur le 15/08/2026, réconcilié avec l'audit du lore existant dans le dépôt. Les contradictions non résolues sont marquées `🔴 DÉCISION REQUISE` — rien n'a été tranché à leur place.
>
> Règle de gouvernance (rappel) : toute proposition de canon nouveau doit être marquée **PROPOSITION** jusqu'à validation par l'utilisateur. Une fois validée : **CANON REDLAKES**.

---

## 1. Structure à deux niveaux

Le lore de REDLAKES n'est pas l'histoire de la Fondation. C'est l'histoire d'un monde entier dans lequel la Fondation est une puissance parmi d'autres.

- **Niveau 1 — Lore global** : histoire des États-Unis, apparition/évolution des anomalies, grandes organisations, conflits, évolution de RedLake, situation politique et criminelle.
- **Niveau 2 — Lore des factions** : histoire, objectifs, dirigeants, méthodes, conflits, ressources, relations et événements propres à chaque faction.

Cette distinction n'existait pas clairement dans le lore actuel — `loreCategories` (`data/lore.ts`) mélange `monde`, `site` et `faction` sans hiérarchie explicite entre les deux niveaux. **CANON REDLAKES** : conserver ces catégories techniques (elles structurent déjà le CMS et les pages), mais chaque nouvel article doit être explicitement rattaché à l'un des deux niveaux dans son contenu.

---

## 2. RedLake — la ville

RedLake est une ville américaine de taille significative, État de Washington. Elle doit fonctionner comme un vrai décor DarkRP : quartiers résidentiels, centre-ville, zones commerciales, entreprises, administrations, police, hôpitaux, criminalité, zones industrielles, périphérie rurale.

**Deux mondes qui peuvent entrer en collision** :
- *Monde civil* — travail, entreprises, police, politique, criminalité, vie quotidienne, économie. C'est tout ce que voit un habitant normal.
- *Monde clandestin* — Fondation, SCP, anomalies, organisations secrètes, opérations clandestines, conflits entre factions.

🟡 **ANCIEN MAIS RÉUTILISABLE** — Le lore actuel a déjà un embryon de ce monde civil (`data/factions.ts` : Gouvernement municipal, RPD, Crime Organisé avec Moretti/Cartel del Norte/Gang des Rats Gris), mais rien ne documente RedLake comme *lieu* (quartiers, économie, géographie). C'est un vrai manque à combler, pas une contradiction.

**PROPOSITION** (pas encore de contenu à écrire tant que non demandé) : un article Niveau 1 dédié "RedLake — portrait d'une ville" dans `loreCategories.monde`, purement civil, zéro mention de la Fondation, pour incarner ce cloisonnement dès la lecture.

---

## 3. Le secret

La majorité des habitants de RedLake ignorent la vraie nature du monde. Ceci crée un système de clearance narratif à quatre niveaux (voir §11).

🟢 **CANON CONFIRMÉ** — Déjà le principe organisateur du site (`Badge variant="classified"`, système de clearance 1-5 déjà en place sur Grade/Faction/LoreArticle/PersonnelReport). Rien à changer structurellement, seulement à peupler.

---

## 4. Position de la Fondation

Le Site-12 **n'est pas sous RedLake**. Il est installé à distance, dans une zone isolée de l'État de Washington, sous couverture d'installation militaire/gouvernementale à accès restreint.

🟠 **À RÉÉCRIRE** — Le lore actuel ne contredit pas frontalement ce point (aucun texte ne dit "sous la ville"), mais reste flou : `data/factions.ts` dit seulement "Site-12 est la branche principale de REDLAKES" sans préciser la distance ni la couverture militaire. À enrichir, pas à corriger.

---

## 5. Chronologie mondiale — la refonte majeure

C'est ici que se trouvent les vraies contradictions. Comparaison ligne par ligne avec `data/timeline.ts` :

| Élément du nouveau canon | Présent dans `timeline.ts` ? | Classification |
|---|---|---|
| Fondation SCP créée après 1947 (reconstruction mondiale) | ✅ `foundation` — 1947 | 🟢 CANON CONFIRMÉ |
| Réseau mondial de Sites, certains « intouchables » puis affaiblis | ❌ absent | 🟠 À ÉCRIRE |
| Site-19 — ancien symbole de puissance, tombé | ❌ absent | 🟠 À ÉCRIRE |
| Site-22 — centre opérationnel majeur, tombé en 2012 (Insurrection du Chaos + Main du Serpent) | ❌ absent | 🟠 À ÉCRIRE |
| Site-17 — destination d'évacuation post-Site-22 | ❌ absent | 🟠 À ÉCRIRE |
| Brolver — village détruit, ordre O-1 nucléaire | ❌ absent | 🟠 À ÉCRIRE |
| Crise de confiance envers la Fondation post-Brolver | ❌ absent | 🟠 À ÉCRIRE |
| Création d'AEGIS **en réaction à Brolver** | `aegis-creation` — **2001** | 🔴 **DÉCISION REQUISE** — Brolver (2012 selon le canon, puisque Site-22 tombe en 2012) ne peut pas être suivi d'une AEGIS créée en 2001. Soit AEGIS est repoussée après 2012, soit AEGIS existait déjà sous une forme plus limitée avant Brolver et se renforce après. **Je recommande** : garder une AEGIS pré-existante mais discrète depuis 2001 (petite structure de veille), et faire de Brolver le moment où elle devient la puissance qu'on connaît aujourd'hui (financement massif, mandat élargi). Ça réconcilie les deux dates sans rien jeter. À valider. |
| Conseil Oméga mis en place | `site12` — 1962, "Hiérarchie Oméga établie" | 🔴 **DÉCISION REQUISE** — voir Site-12 ci-dessous, même problème de date |
| Création du Site-12 **comme dernier bastion, après les chutes** | `site12` — **1962**, "sous couvert d'une installation industrielle" | 🔴 **DÉCISION REQUISE** — C'est la contradiction la plus importante du corpus. Le canon est explicite : le Site-12 existe *parce que* Site-19, Site-22 et Brolver sont tombés (2012+). Un Site-12 fondé en 1962 ne peut pas être ce « dernier bastion ». **Je recommande** : soit (a) le Site-12 existait depuis 1962 comme site secondaire discret, et devient le centre stratégique principal seulement après 2012-2015 quand les autres tombent — ce qui préserve la date 1962 déjà utilisée partout (personnages, `data/lore.ts`, seed Prisma) sans rien renommer ; soit (b) on renomme complètement la fondation du Site-12 à une date post-2012. **(a) demande beaucoup moins de réécriture en cascade** (dates de personnages, d'incidents, de grades) — c'est mon option par défaut si tu ne tranches pas autrement. |
| Personnel Class-D historiquement présent | `data/scp.ts`, grades "classes" | 🟢 CANON CONFIRMÉ |
| Exercice XK simulé | `xk-drill` — 1987 | 🟢 CANON CONFIRMÉ (compatible, aucun conflit) |
| Insurrection du Chaos active depuis 1994 | `ci-arrival` — 1994 | 🟢 CANON CONFIRMÉ — et cohérent avec son rôle dans la chute du Site-22 en 2012 (18 ans d'existence avant l'attaque, plausible) |
| Main du Serpent émerge en 2019 | `serpent-rise` — 2019 | 🟢 CANON CONFIRMÉ |
| Brèche Keter Site-12, 2015 | `breach-keter` — 2015 | 🟡 dépend de la résolution de la date de fondation du Site-12 (option a : compatible, le Site-12 existe déjà en 2015 même s'il n'est pas encore *le* bastion principal) |
| Guerre interne O5 / crise de gouvernance, 2023 | `internal-war` — 2023 | 🟢 CANON CONFIRMÉ — cohérent avec "le Conseil n'est pas tout rose" (§8) |
| État actuel (2026) : Fondation affaiblie, surveillée, reconstruit | `redlakes-today` — 2026 | 🟢 CANON CONFIRMÉ |

---

## 6. AEGIS — précisions sur la nature du financement

Le canon précise qu'AEGIS n'est pas un simple aréopage de fonctionnaires : ce sont des individus extrêmement riches capables d'influencer gouvernements, marchés, infrastructures.

🟠 **À RÉÉCRIRE** — `data/factions.ts` ("Née après plusieurs incidents mondiaux quand certains États ont compris que la Fondation n'est ni élue ni responsable devant les peuples.") et `data/lore.ts` (mandat, hiérarchie, protocoles d'audit) restent globalement compatibles — rien ne contredit un financement privé, mais rien ne le précise non plus. La hiérarchie existante (Directoire → Inspecteurs → Cellules d'Application) est solide et **doit être conservée telle quelle** : c'est exactement le niveau de détail structuré que demande le canon.

**Relation ambiguë Fondation/AEGIS** (§14 du canon : "AEGIS n'est pas nécessairement gentille") — 🟢 déjà bien amorcé par les quotes existantes de l'Inspecteur AEGIS ("La Fondation n'a pas franchi une ligne. Elle l'a redessinée à son avantage.") et par le ton clinique/froid du personnage. Rien à changer.

---

## 7. Site-12 — Conseil Oméga, Directeurs, forces d'élite

🟢 **CANON CONFIRMÉ, à haute valeur** — La structure existante est en fait remarquablement alignée avec le nouveau canon :
- Conseil Oméga O1-O5 avec rôles précis, salaires, effectifs → déjà granulaire, déjà en base (`Grade`/`Department` CORE, résolu au Lot 9).
- Directeur du Site, Directeur Sécurité avec autorité sur toute la sécurité (agents, unités spécialisées, procédures, discipline) → **déjà exactement la structure demandée au §22-23 du canon**, y compris dans le schéma CORE (`Department.directorGradeName`).
- "Le Conseil n'est pas tout rose" → déjà là (Guerre interne O5 2023, ton clinique des quotes du Directeur : "Les pertes sont acceptables dans le cadre du protocole.").

**FIM / AIT** — 🔴 **absents du lore actuel sous ce nom**, mais c'est une convergence heureuse avec le travail déjà fait : le Lot 10 vient de retirer "MTF Nu-7" comme structure active (candidature, Discord, pages web) précisément parce que ce n'était qu'une redite du département Sécurité. Le canon demande exactement ce remplacement : *"les forces d'élite ne sont pas envoyées depuis un autre Site, elles sont directement stationnées au Site-12"*, dirigées par le Directeur de la Sécurité. **PROPOSITION** : FIM et AIT devraient être les futures `Team` génériques du département Sécurité (le modèle CORE que je comptais construire ensuite) plutôt que des factions à part — exactement le principe déjà retenu ("Team ne doit pas être un simple reskin de MTF").

Les personnages narratifs liés à "MTF Nu-7" (`commandant-nu7`/Commandant Vance, `liaison-mtf-junior`/Sgt. Reyes dans `packages/narrative-core`) ne sont pas supprimés (Lore préservé), mais leur `faction: "MTF Nu-7"` devient incohérente avec le nouveau canon. **PROPOSITION, pas encore appliquée** : rattacher ces deux personnages à "FIM Site-12" ou "AIT Site-12" plutôt que "MTF Nu-7" — reformulation, pas suppression de leur histoire.

---

## 8. Le Conseil Oméga n'est pas parfaitement moral

🟢 **CANON CONFIRMÉ** — Déjà présent et cohérent : "Guerre Interne O5" (2023, abus d'autorité, absence de conséquences internes, site devenu "intouchable"), les quotes du Directeur ("pertes acceptables dans le cadre du protocole"), le ton général de zone grise. Aucune réécriture nécessaire ici — c'est le point le mieux aligné de tout le corpus existant.

---

## 9. RedLake et l'illégalité

🟢 **CANON CONFIRMÉ, base solide** — `data/factions.ts` (Famille Moretti, Cartel del Norte, Gang des Rats Gris) et le personnage Vincent Moretti ("Entretient des relations tendues avec la police et une ignorance feinte de la Fondation.") vont déjà dans le sens du canon. Manque encore : les mécanismes explicites de collusion Conseil Oméga ↔ crime (sociétés écrans, intermédiaires, corruption) évoqués au §17. 🟠 **À ÉCRIRE**, sans rien contredire de l'existant.

---

## 10. Groupes d'intérêt — état des lieux par faction

| Faction | Canon demande | État actuel | Classe |
|---|---|---|---|
| Insurrection du Chaos | menace militaire/politique/idéologique majeure | ✅ déjà ça (`objectives: ["Détruire la Fondation", "Libérer les SCP", "Rallier les masses"]`, cellules nommées) | 🟢 |
| Main du Serpent | ambiguë, pas juste "méchante", conviction propre sur liberté/anomalies | ✅ déjà exactement ce ton ("Les secrets anciens ont un prix", pas d'hostilité explicite envers la Fondation) | 🟢 |
| GOC | vision internationale propre, coopère parfois avec la Fondation tout en s'opposant à ses méthodes | ⚠️ actuel : "Organisation rivale... Tension permanente avec la Fondation" — pas de mention de coopération ponctuelle | 🟠 À ENRICHIR |
| Crime organisé | relie le monde civil au monde clandestin | ✅ déjà le principe (Moretti "ignorance feinte de la Fondation") | 🟢 |

---

## 11. Lore public — les quatre paliers

Le canon demande une découverte progressive : Public → Avancé → Classifié → Extrêmement classifié.

🟢 **CANON CONFIRMÉ, déjà implémenté structurellement** — Le système `clearance: 1-5` sur `LoreArticle`, `Grade`, `PersonnelReport`, etc. fait déjà ce travail. La correspondance proposée par le canon (public / avancé / classifié / extrêmement classifié) mappe proprement sur clearance 1 / 2 / 3-4 / 5, déjà utilisé partout dans le code. **Rien à construire, juste à documenter cette correspondance explicitement** — voir §13.

---

## 12. Chronologie — petits moments

Le canon demande des micro-événements (disparition d'un chercheur, changement de directeur, incident diplomatique...) en plus des grandes guerres. 🟠 **À ÉCRIRE** — le lore actuel n'a que des événements majeurs (`gameEvents`, `timelineEvents`), rien de mineur. Pas une contradiction, un vrai manque à combler dans un futur lot de contenu.

---

## 13. Correspondance clearance narrative ↔ technique

| Palier narratif (canon) | `clearance` | Contenu type déjà en base |
|---|---|---|
| Public | 1 | Histoire de RedLake, faits divers, institutions civiles |
| Avancé | 2 | Rumeurs, événements étranges, factions occultes/criminelles connues |
| Classifié | 3-4 | Fondation, Site-12, AEGIS, Conseil Oméga, opérations |
| Extrêmement classifié | 5 | Brolver, décisions du Conseil, opérations AEGIS, secrets internes |

---

## 14. Audit récapitulatif — tous les éléments existants

| Élément | Fichier | Classe |
|---|---|---|
| Fondation SCP 1947 | `timeline.ts` | 🟢 CANON CONFIRMÉ |
| Site-12 activé 1962 | `timeline.ts`, `data/lore.ts` | 🔴 CONTRADICTOIRE — voir §5, décision requise |
| Exercice XK 1987 | `timeline.ts` | 🟢 CANON CONFIRMÉ |
| Insurrection du Chaos depuis 1994 | `timeline.ts`, `data/factions.ts` | 🟢 CANON CONFIRMÉ |
| AEGIS créée 2001 | `timeline.ts` | 🔴 CONTRADICTOIRE — voir §5, décision requise |
| Brèche Keter 2015 | `timeline.ts`, `data/lore.ts`, `data/scp.ts` | 🟡 dépend de §5 |
| Main du Serpent 2019 | `timeline.ts`, `data/factions.ts` | 🟢 CANON CONFIRMÉ |
| Guerre interne O5 2023 | `timeline.ts`, `data/lore.ts` | 🟢 CANON CONFIRMÉ |
| Conseil Oméga (structure O1-O5) | `data/lore.ts`, CORE `Department` | 🟢 CANON CONFIRMÉ |
| AEGIS (mandat, hiérarchie, protocoles) | `data/lore.ts`, `data/factions.ts` | 🟢 CANON CONFIRMÉ |
| Main du Serpent (ambiguïté, bases, artefacts) | `data/factions.ts` | 🟢 CANON CONFIRMÉ |
| Insurrection du Chaos (objectifs, cellules) | `data/factions.ts` | 🟢 CANON CONFIRMÉ |
| GOC | `data/factions.ts` | 🟠 À ENRICHIR (coopération ponctuelle absente) |
| Crime organisé RedLake | `data/factions.ts` | 🟢 CANON CONFIRMÉ |
| Gouvernement / Police RedLake | `data/factions.ts` | 🟡 réutilisable, à enrichir en détail de ville (§2) |
| SCP-████ "transféré depuis Site-19 en juin 2026" | `data/scp.ts` | 🔴 CONTRADICTOIRE — implique Site-19 opérationnel en 2026, alors que le canon dit Site-19 tombé historiquement. **PROPOSITION** : "récupéré dans les décombres du Site-19 après sa chute" plutôt que "transféré depuis Site-19" |
| Personnages Fondation (Directeur, Dr. Chen, CASSIE, RH, sécurité, etc.) | `data/lore.ts`, `narrative-core/characters.ts` | 🟡 réutilisables tels quels, dates à recaler seulement si §5 option (b) est retenue |
| Commandant Vance / Sgt. Reyes — faction "MTF Nu-7" | `narrative-core/characters.ts`, `data/lore.ts` | 🟠 À RÉÉCRIRE — rattacher à FIM/AIT plutôt qu'à une faction MTF qui n'existe plus (voir §7). Histoire du personnage inchangée. |
| Vincent Moretti / crime organisé | `data/lore.ts` | 🟢 CANON CONFIRMÉ |
| Initié Main du Serpent | `data/lore.ts` | 🟢 CANON CONFIRMÉ |
| SCP-173, 049, 096, 500 | `data/scp.ts` | 🟢 CANON CONFIRMÉ (génériques, aucun conflit) |
| Site-19, Site-22, Site-17, Brolver, ordre O-1 nucléaire | — | 🟠 ABSENTS — à écrire, aucun conflit puisqu'inexistants actuellement |
| FIM / AIT nommément | — | 🟠 ABSENTS — voir §7, forte convergence avec le retrait des MTF déjà fait |
| RedLake comme ville détaillée (quartiers, économie) | — | 🟠 ABSENT |
| Micro-événements historiques | — | 🟠 ABSENTS |

---

## 15. Décisions requises avant toute réécriture de contenu

Je n'ai encore rien réécrit dans les fichiers de données — uniquement construit ce document de référence, conformément à la règle "auditer puis seulement commencer la réécriture".

**🔴 Deux décisions bloquent la suite :**

1. **Date de fondation du Site-12.** Je recommande de garder 1962 comme date de fondation d'un site secondaire discret, qui ne devient "le dernier bastion" qu'après 2012-2015 (quand Site-19/Site-22/Brolver tombent) — ça évite de recaler toutes les dates de personnages et d'événements déjà écrits. L'alternative est de déplacer entièrement la fondation après 2012, ce qui implique de réécrire les biographies existantes (le Directeur, la brèche Keter 2015, etc.).
2. **Date de création d'AEGIS.** Même logique : je recommande une AEGIS discrète depuis 2001 qui devient la puissance actuelle après Brolver, plutôt que de déplacer sa création après 2012.

Si tu valides ces deux recommandations (ou proposes autre chose), je peux ensuite :
- Écrire les nouveaux articles Niveau 1 (Site-19, Site-22, Site-17, Brolver, RedLake ville) dans `data/lore.ts`/CMS.
- Corriger la ligne SCP-████ (Site-19).
- Reformuler `faction: "MTF Nu-7"` → FIM/AIT sur les 2 personnages narratifs concernés.
- Mettre à jour `timeline.ts` avec les nouveaux jalons (Site-22 2012, Brolver 2012, création/renforcement AEGIS).

Rien de tout ça n'est fait — j'attends ta validation avant de toucher aux fichiers de contenu.
