import { isLayoutSeparatorName } from "./role-layout.js";
import type { BranchId } from "./role-layout.js";

export interface ParsedRoleEntry {
  kind: "separator" | "grade";
  name: string;
  branch?: BranchId;
  mentionable?: boolean;
}

const SKIP_LINE =
  /^(#{1,3}\s|[-|]{3,}|\||responsable \(grade\)|équipe|composition|organigramme|pas des rôles|colonnes excel|les team|seuls les grades|crime organisé$|rôles globaux|les joueurs fondent|voir excel|\(grade\)|\(livraison\)|rôles ping|mentionnables|to[iu] seul|rejeter le message|clique pour voir)/i;

const ORG_SECTION =
  /^[🔫🔬🩺🔧📋🌃👥].*(—|patrouilles|expériences|équipes|secrétariat|équipes mobiles)/i;

function cleanLine(raw: string): string {
  return raw
    .trim()
    .replace(/^[-*•]\s+/, "")
    .replace(/^`+/, "")
    .replace(/`+$/, "")
    .trim();
}

/** Rétablit les sauts de ligne quand Discord / le collage les a supprimés */
export function normalizeRoleListText(text: string): string {
  let out = text.replace(/\r\n/g, "\n").trim();

  // Séparateurs collés au texte précédent
  out = out.replace(/([^\n])(╰┈➤)/g, "$1\n$2");
  out = out.replace(/([^\n])(━━━)/g, "$1\n$2");

  // Nouvelle ligne avant chaque emoji de rôle (liste sur une seule ligne)
  out = out.replace(
    /(?<=[^\n])\s*(?=[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}〚〖])/gu,
    "\n",
  );

  return out;
}

function isSeparatorLine(line: string): boolean {
  const t = cleanLine(line);
  if (!t) return false;
  if (isLayoutSeparatorName(t)) return true;
  return /^[━╰┈➤【]/.test(t) || /^━━━/.test(t);
}

function shouldSkip(line: string): boolean {
  const t = cleanLine(line);
  if (!t) return true;
  if (SKIP_LINE.test(t)) return true;
  if (ORG_SECTION.test(t)) return true;
  if (/^>\s/.test(t)) return true;
  return false;
}

function inferBranchFromSeparator(name: string): BranchId {
  if (name.includes("OMEGA")) return "omega";
  if (name.includes("DIRECTION")) return "direction";
  if (name.includes("Sécurité") || name.includes("Securite")) return "securite";
  if (name.includes("Scientifique")) return "scientifique";
  if (name.includes("Maintenance")) return "maintenance";
  if (name.includes("Générale") || name.includes("Generale")) return "general";
  if (name.includes("HONORIFIQUES") || name.includes("TITRES")) return "general";
  if (name.includes("DÉTENU") || name.includes("DETENU")) return "classes";
  return "general";
}

/**
 * Parse une liste collée (guide MD, Discord, etc.).
 * Séparateurs = catégories déjà sur le serveur ; le reste = grades à créer/ranger.
 */
export function parseRoleListText(text: string): ParsedRoleEntry[] {
  const entries: ParsedRoleEntry[] = [];
  let currentBranch: BranchId = "general";

  for (const rawLine of normalizeRoleListText(text).split(/\n/)) {
    const line = cleanLine(rawLine);
    if (!line || shouldSkip(line)) continue;

    if (isSeparatorLine(line)) {
      currentBranch = inferBranchFromSeparator(line);
      entries.push({ kind: "separator", name: line, branch: currentBranch });
      continue;
    }

    entries.push({
      kind: "grade",
      name: line,
      branch: currentBranch,
    });
  }

  return dedupeParsedEntries(entries);
}

function dedupeParsedEntries(entries: ParsedRoleEntry[]): ParsedRoleEntry[] {
  const seen = new Set<string>();
  const out: ParsedRoleEntry[] = [];

  for (const entry of entries) {
    const key = `${entry.kind}:${entry.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
  }

  return out;
}

export function summarizeParsedList(entries: ParsedRoleEntry[]): {
  separators: number;
  grades: number;
} {
  return {
    separators: entries.filter((e) => e.kind === "separator").length,
    grades: entries.filter((e) => e.kind === "grade").length,
  };
}

/** Valide une liste collée — accepte avec ou sans séparateurs, une ou plusieurs lignes */
export function looksLikeRoleList(text: string): boolean {
  const normalized = normalizeRoleListText(text);
  const parsed = parseRoleListText(normalized);
  return parsed.filter((e) => e.kind === "grade").length >= 1;
}

export function describeRoleListParse(text: string): string {
  const normalized = normalizeRoleListText(text);
  const lines = normalized.split(/\n/).filter((l) => l.trim()).length;
  const parsed = parseRoleListText(normalized);
  const summary = summarizeParsedList(parsed);
  return `${lines} ligne(s) · ${summary.grades} grade(s) · ${summary.separators} catégorie(s)`;
}
