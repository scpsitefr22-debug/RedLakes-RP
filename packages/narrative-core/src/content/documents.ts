import type { GlobalNarrativeSave } from "../types/gns.js";
import { interpolateNarrativeText } from "../narrative/interpolate.js";

export type DocumentCategory = "rapport" | "protocole" | "scp" | "rh" | "note";

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  rapport: "Rapports",
  protocole: "Protocoles",
  scp: "SCP",
  rh: "RH",
  note: "Notes internes",
};

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  "rapport",
  "protocole",
  "scp",
  "rh",
  "note",
];

export interface TerminalDocument {
  id: string;
  title: string;
  clearance: number;
  category: DocumentCategory;
  content: string;
  unlockRequires?: {
    flag?: string;
    document?: string;
    sagaChoice?: { key: string; value: unknown };
  };
}

export type DocumentAccessState =
  | { access: "available" }
  | { access: "progress_locked" }
  | { access: "clearance_denied"; requiredClearance: number };

export const TERMINAL_DOCUMENTS: Record<string, TerminalDocument> = {
  "doc-manuel-recrue": {
    id: "doc-manuel-recrue",
    title: "MANUEL_RECRUE_S12.pdf",
    clearance: 1,
    category: "rh",
    content: `MANUEL D'INTÉGRATION — SITE-12
Classification : INTERNE — Clearance 1

Bienvenue, {player_name}.

Ce document résume vos obligations pendant la période d'intégration :
- Badge visible en permanence dans les couloirs Euclid.
- Messagerie inter-sites : canal officiel pour les consignes départementales.
- Toute anomalie observée doit être remontée via votre superviseur.

Dossier : {employee_id}
Grade : {player_role}

— Ressources Humaines, Site-12`,
  },
  "doc-protocole-com": {
    id: "doc-protocole-com",
    title: "PROTO_COM_INTERNE_v3.pdf",
    clearance: 1,
    category: "protocole",
    content: `PROTOCOLE DE COMMUNICATION INTERNE
Site-12 — Révision 2026-03

1. Messagerie inter-sites : usage professionnel uniquement.
2. Courrier interne : convocations et notifications administratives.
3. Interdiction formelle de relayer des rumeurs non confirmées.

Violation = notation dossier + possible rétrogradation clearance.

— Département Sécurité / Communications`,
  },
  "doc-protocole-evacuation": {
    id: "doc-protocole-evacuation",
    title: "PROTO_EVAC_NIVEAU1.pdf",
    clearance: 1,
    category: "protocole",
    unlockRequires: { flag: "ch1_left_director_office" },
    content: `PROCÉDURE D'ÉVACUATION — NIVEAU 1
Site-12 — Personnel clearance 1-2

En cas d'alerte confinement :
1. Retourner au poste de travail assigné.
2. Attendre consignes messagerie #alertes-site12.
3. Ne pas emprunter les couloirs Keter sans escorte FIM.

Dernière simulation : 12 juin 2026 — délai moyen 4 min 12 s.`,
  },
  "doc-briefing-convocation": {
    id: "doc-briefing-convocation",
    title: "CONVOC_BRIEFING_08h00.pdf",
    clearance: 1,
    category: "rh",
    unlockRequires: { flag: "ch1_directeur_resolved" },
    content: `CONVOCATION OFFICIELLE
Destinataire : {player_name} — {employee_id}

Objet : Briefing sécurité post-intégration
Date : Aujourd'hui
Heure : 08h00
Lieu : Salle de conférence B

Présence enregistrée par badge. Absence non justifiée = notation dossier.

— Administration Site-12`,
  },
  "doc-euclid7-logs": {
    id: "doc-euclid7-logs",
    title: "LOG_EUCLID-7_██.pdf",
    clearance: 1,
    category: "rapport",
    unlockRequires: { flag: "ch1_chen_logs_received" },
    content: `RAPPORT ANOMALIE — SECTEUR EUCLID-7
Site-12 — REDLAKES
Classification : INTERNE

Lecture 04h12 — Écart +12,4 % sur protocole standard.
Lecture 04h28 — Signal récurrent non répertorié.
Lecture 04h41 — Système de confinement : réponse lente (4,2s / seuil 2,0s).

Note personnelle (Dr. Chen) :
« Ce n'est pas une dérive instrumentale. Quelqu'un a modifié les seuils d'alerte. »

DESTINATAIRE : Personnel autorisé uniquement.
NE PAS TRANSMETTRE VIA CANAUX NON SÉCURISÉS.`,
  },
  "doc-scp-euclid-overview": {
    id: "doc-scp-euclid-overview",
    title: "FICHE_EUCLID-7_resume.pdf",
    clearance: 1,
    category: "scp",
    unlockRequires: { flag: "ch1_left_director_office" },
    content: `FICHE SCP — SECTEUR EUCLID-7 (RÉSUMÉ)
Classe : Euclid
Accès clearance 1 : lecture seule

Anomalie de confinement sous surveillance continue.
Dernière révision protocolaire : juin 2026.

Pour tests actifs et données brutes : clearance 2+ requise.`,
  },
  "doc-site-rumor": {
    id: "doc-site-rumor",
    title: "NOTE_RUMEUR_INTERNE.txt",
    clearance: 1,
    category: "note",
    unlockRequires: { flag: "ch1_site_rumor_spread" },
    content: `CIRCULATION INTERNE — NON OFFICIEL

Des agents prétendent qu'un inspecteur AEGIS a été aperçu dans l'aile administrative.
Aucune convocation publique. Aucun déploiement FIM.

« Quand AEGIS regarde, tout le monde ferme sa messagerie. »

— Source anonyme, cafétéria B`,
  },
  "doc-memo-cafeteria": {
    id: "doc-memo-cafeteria",
    title: "MEMO_CAFETERIA_B.txt",
    clearance: 1,
    category: "note",
    unlockRequires: { flag: "ch1_site_rumor_spread" },
    content: `MÉMO INFORMEL — Cafétéria B

Horaires étendus secteur recherche cette semaine.
Ne pas discuter des « lectures bizarres » Euclid-7 près des terminaux publics.

— Anonyme, affiché près des distributeurs`,
  },
  "doc-aegis-mention": {
    id: "doc-aegis-mention",
    title: "NOTE_AEGIS_brouillon.pdf",
    clearance: 2,
    category: "rapport",
    unlockRequires: { flag: "ch1_aegis_noted" },
    content: `BROUILLON — NON DIFFUSÉ
Objet : Mention AEGIS lors du briefing 08h00

Le Directeur a évoqué une « surveillance externe » sans préciser le mandat.
Archives complètes : clearance 2 minimum.

[CONTENU PARTIELLEMENT CENSURÉ]`,
  },
  "doc-audit-keter": {
    id: "doc-audit-keter",
    title: "SYNTHESE_BRECHE_K02.pdf",
    clearance: 1,
    category: "rapport",
    unlockRequires: { flag: "cassie_queried_incidents" },
    content: `SYNTHÈSE INCIDENT — SECTEUR KETER-02
Date : 15 juin 2026
Durée de brèche : 47 minutes
Statut : Contenu

Pertes Class-D documentées. Audit AEGIS niveau 3 en cours.
Accès détail opérationnel : clearance 2+.`,
  },
  "doc-personnel-restrictions": {
    id: "doc-personnel-restrictions",
    title: "AVIS_ENTRETIEN_SECURITE.pdf",
    clearance: 1,
    category: "rh",
    unlockRequires: { flag: "ch1_security_review" },
    content: `AVIS RH — ENTRETIEN OBLIGATOIRE
Destinataire : {player_name}

Suite à votre signalement d'anomalie, le Département Sécurité a programmé un entretien.
Objet : protocole de remontée d'incident.

Présence obligatoire. Contact : messagerie Sécurité.`,
  },
  "doc-protocole-class-d": {
    id: "doc-protocole-class-d",
    title: "PROTO_CLASS-D_visite.pdf",
    clearance: 1,
    category: "protocole",
    unlockRequires: { sagaChoice: { key: "ch1_briefing_response", value: "reluctant" } },
    content: `PROTOCOLE VISITE CHAMBRES CLASS-D
Site-12 — Personnel clearance 1

Accès encadré uniquement sous supervision Lt. Garrison.
Interdiction de communication directe non scriptée.

Ce protocole vous a été assigné suite à votre profil d'intégration.`,
  },
};

export interface ScpEntry {
  id: string;
  class: "Safe" | "Euclid" | "Keter";
  title: string;
  clearance: number;
  summary: string;
  detail?: string;
  unlockRequires?: TerminalDocument["unlockRequires"];
}

export const SCP_ENTRIES: ScpEntry[] = [
  {
    id: "scp-onboarding",
    class: "Safe",
    title: "Protocole d'intégration personnel",
    clearance: 1,
    summary: "Documentation standard pour nouveaux arrivants Site-12.",
    detail: "Tout personnel doit compléter la période d'intégration sous supervision RH.",
  },
  {
    id: "scp-euclid7",
    class: "Euclid",
    title: "SCP-████ — Secteur Euclid-7",
    clearance: 1,
    summary: "Anomalie de confinement — lectures hors protocole.",
    detail: "Dernière révision : juin 2026. Accès restreint clearance 2+ pour tests actifs.",
    unlockRequires: { document: "doc-euclid7-logs" },
  },
  {
    id: "scp-keter02",
    class: "Keter",
    title: "SCP-████ — Secteur Keter-02",
    clearance: 2,
    summary: "Brèche partielle documentée le 15 juin 2026.",
    detail: "Durée de brèche : 47 minutes. Pertes Class-D documentées. Audit AEGIS en cours.",
    unlockRequires: { flag: "cassie_queried_incidents" },
  },
];

export function isContentUnlocked(
  gns: GlobalNarrativeSave,
  requires?: TerminalDocument["unlockRequires"]
): boolean {
  if (!requires) return true;
  if (requires.flag && !gns.flags[requires.flag]) return false;
  if (requires.document && !gns.world.documentsRead.includes(requires.document)) return false;
  if (requires.sagaChoice) {
    if (gns.sagaChoices[requires.sagaChoice.key] !== requires.sagaChoice.value) return false;
  }
  return true;
}

export function getPlayerClearance(_gns: GlobalNarrativeSave): number {
  return 1;
}

export function getDocumentAccessState(
  gns: GlobalNarrativeSave,
  doc: TerminalDocument
): DocumentAccessState {
  if (!isContentUnlocked(gns, doc.unlockRequires)) {
    return { access: "progress_locked" };
  }
  const clearance = getPlayerClearance(gns);
  if (doc.clearance > clearance) {
    return { access: "clearance_denied", requiredClearance: doc.clearance };
  }
  return { access: "available" };
}

export function getAllTerminalDocuments(): TerminalDocument[] {
  return Object.values(TERMINAL_DOCUMENTS);
}

export function getDocumentsByCategory(category: DocumentCategory): TerminalDocument[] {
  return getAllTerminalDocuments().filter((doc) => doc.category === category);
}

export function getUnlockedDocuments(gns: GlobalNarrativeSave): TerminalDocument[] {
  return getAllTerminalDocuments().filter(
    (doc) => getDocumentAccessState(gns, doc).access === "available"
  );
}

export function getUnlockedScpEntries(gns: GlobalNarrativeSave): ScpEntry[] {
  return SCP_ENTRIES.filter((entry) => isContentUnlocked(gns, entry.unlockRequires));
}

export function getDocumentContent(doc: TerminalDocument, gns: GlobalNarrativeSave): string {
  return interpolateNarrativeText(doc.content, gns);
}

export interface IncidentEntry {
  id: string;
  date: string;
  title: string;
  status: string;
  detail: string;
  unlockRequires?: TerminalDocument["unlockRequires"];
}

export const INCIDENT_ENTRIES: IncidentEntry[] = [
  {
    id: "inc-keter02",
    date: "2026-06-15",
    title: "Brèche Secteur Keter-02",
    status: "Contenu",
    detail: "Brèche partielle — 47 minutes. Pertes Class-D documentées.",
  },
  {
    id: "inc-mur-de-fer",
    date: "2026-06-01",
    title: "Opération Mur de Fer",
    status: "Résolu",
    detail: "Déploiement FIM Nu-7. Zone industrielle sécurisée.",
  },
  {
    id: "inc-rituel",
    date: "2026-05-20",
    title: "Rituel intercepté — Égouts",
    status: "Incomplet",
    detail: "Cérémonie Main du Serpent détectée. Artefact non récupéré.",
    unlockRequires: { flag: "ch1_site_rumor_spread" },
  },
  {
    id: "inc-euclid7",
    date: "2026-06-22",
    title: "Anomalie lectures Euclid-7",
    status: "En cours",
    detail: "Écarts protocolaires signalés. Enquête interne non officielle.",
    unlockRequires: { document: "doc-euclid7-logs" },
  },
];

export function getUnlockedIncidents(gns: GlobalNarrativeSave): IncidentEntry[] {
  return INCIDENT_ENTRIES.filter((inc) => isContentUnlocked(gns, inc.unlockRequires));
}
