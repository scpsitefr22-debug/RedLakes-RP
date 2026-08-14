# Chapitre I — Intégration

## Synopsis

Premier jour au Site-12. Le joueur reçoit son terminal sécurisé, est briefé par le Directeur, et est contacté en secret par la Dr. Mei Chen qui détecte une anomalie dans le secteur Euclid-7.

## Structure en 4 actes

### Acte I — Activation
- Scène immersive : bureau du Directeur
- Choix saga `ch1_briefing_response` : professionnel / curieux / réticent
- Débloque contacts conditionnels (MTF, chercheur junior, Class-D)

### Acte II — Anomalie (pivot saga)
- Dr. Chen — choix structurant `ch1_dr_chen_fate` :
  - **Sauver** → logs Euclid-7, confiance, suivi Acte III
  - **Signaler** → conformité, convocation sécurité Acte IV
  - **Ignorer** → message supprimé, profil passif, écho RH Acte IV

### Acte III — Le Site respire
- Exploration libre : CASSIE, documents, personnel, incidents
- Événements session (timers) :
  - ~90 s : rumeur AEGIS
  - ~120 s : suivi Chen (si logs reçus)
  - ~150 s : nudge email briefing (si Chen + Directeur résolus)
- Fil RH « exploration » entre Chen et briefing

### Acte IV — Briefing & clôture
- Rappel RH → briefing live Salle B (`ch1_briefing_conduct`)
- Branche post-briefing selon Chen (saved / reported / ignored)
- Clôture RH + `completeChapter`

## Conséquences saga

| Choix Ch.I | Ch.III | Ch.VII | Ch.IX |
|------------|--------|--------|-------|
| Chen sauvée | Promotion directeur adjoint | Protège le joueur | Son fils au Site |
| Chen signalée | Transférée / surveillée | N'intervient pas | Absente |
| Chen ignorée | Disparaît des radars | — | Épilogue amer |

## Flags critiques

`ch1_left_director_office` → `ch1_chen_resolved` → `ch1_briefing_reminder_sent` → `ch1_briefing_attended` → `ch1_branch_followup_seen` → `ch1_complete`
