import { normalizeRoleLabel } from "./rp-catalog.js";

/** Retire emojis, cadres Discord et suffixes (F.I.M., A.I.T.) */
export function sanitizeDiscordRoleName(name: string): string {
  return name
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\u200D]/gu, "")
    .replace(/[〖〗〚〛╰┈➤【】[\]|]/g, " ")
    // Conserve les codes Oméga (O1)… — utilisés pour le matching des grades
    .replace(/\((?!\s*o-?\d+\s*\))[^)]*\)/gi, " ")
    .replace(/\bF\.?\s*I\.?\s*M\.?\b/gi, "")
    .replace(/\bA\.?\s*I\.?\s*T\.?\b/gi, "")
    .replace(/\bSGC\b/gi, "")
    .replace(/[:：]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Separateurs deja presents sur le serveur RedLakes */
export function isExistingBranchSeparator(name: string): boolean {
  const s = sanitizeDiscordRoleName(name).toLowerCase();
  return (
    /^branche\s/.test(s) ||
    /^membres des o5/.test(s) ||
    /^membres du conseil/.test(s) ||
    /^gerant rp/.test(s) ||
    /^branche administrative/.test(s) ||
    /^branche sgc/.test(s) ||
    /^main du serpent/.test(s) ||
    /^dark rp/.test(s)
  );
}

export function isFactionRole(name: string): boolean {
  const s = sanitizeDiscordRoleName(name).toLowerCase();
  return (
    /\bi\.?c\b/.test(s) ||
    /insurrection/.test(s) ||
    /serpent/.test(s) ||
    /dark\s*rp|darkrp/i.test(s) ||
    /scprp/.test(s) ||
    /^ia\b/.test(s) ||
    /intelligence artificiel/.test(s)
  );
}

/** Alias noms Discord RedLakes -> grade catalogue Site-12 */
export const DISCORD_ROLE_ALIASES: ReadonlyArray<{
  pattern: RegExp;
  grade: string;
}> = [
  { pattern: /(?:^|\s)o-?1\b/i, grade: "Président du Conseil (O1)" },
  { pattern: /(?:^|\s)o-?2\b/i, grade: "Adjoint-Directeur" },
  { pattern: /(?:^|\s)o-?3\b/i, grade: "Directeur Scientifique" },
  { pattern: /(?:^|\s)o-?4\b/i, grade: "Directeur Maintenance" },
  { pattern: /(?:^|\s)o-?5\b/i, grade: "Directeur Général" },
  { pattern: /(?:^|\s)o-?6\b/i, grade: "Superviseur Communication" },
  { pattern: /(?:^|\s)o-?10\b/i, grade: "Directeur du Site" },
  { pattern: /president du conseil/i, grade: "Président du Conseil (O1)" },
  { pattern: /membre securite/i, grade: "Soldat" },
  { pattern: /^soldat garde/i, grade: "Soldat Garde" },
  { pattern: /^soldat elite/i, grade: "Soldat Elite" },
  { pattern: /^soldat prestige/i, grade: "Soldat Prestige" },
  { pattern: /^soldat$/i, grade: "Soldat" },
  { pattern: /^sergent elite/i, grade: "Sergent Elite" },
  { pattern: /^sergent prestige/i, grade: "Sergent Prestige" },
  { pattern: /^sergent$/i, grade: "Sergent" },
  { pattern: /^caporal garde/i, grade: "Caporal Garde" },
  { pattern: /^caporal elite/i, grade: "Caporal Elite" },
  { pattern: /^caporal prestige/i, grade: "Caporal Prestige" },
  { pattern: /^caporal$/i, grade: "Caporal" },
  { pattern: /^lieutenant/i, grade: "Lieutenant de Terrain" },
  { pattern: /^recrue garde/i, grade: "Soldat Garde" },
  { pattern: /^ch\.e\b/i, grade: "Chercheur Expérimenteur" },
  { pattern: /^ch\.d\b/i, grade: "Chercheur" },
  { pattern: /^a\.n\b/i, grade: "Scientifique Novice" },
  { pattern: /membre scientifique/i, grade: "Scientifique" },
  { pattern: /responsable scientifique/i, grade: "Responsable" },
  { pattern: /responsable de maintenance/i, grade: "Directeur Maintenance" },
  { pattern: /responsable gestion/i, grade: "Directeur Général" },
  { pattern: /responsable de communication/i, grade: "Superviseur Communication" },
  { pattern: /responsable securite/i, grade: "Directeur Sécurité" },
  { pattern: /responsable garde/i, grade: "Responsable Garde D" },
  { pattern: /superviseur en chef/i, grade: "Superviseur" },
  { pattern: /agents de terrain/i, grade: "Médecin" },
  { pattern: /membre sgc/i, grade: "Class-D" },
  { pattern: /recrue garde/i, grade: "Soldat Garde" },
  { pattern: /recrue$/i, grade: "Recrue" },
  { pattern: /directeur du site/i, grade: "Directeur du Site" },
  { pattern: /directeur adjoint/i, grade: "Adjoint-Directeur" },
  { pattern: /directeur scientifique/i, grade: "Directeur Scientifique" },
  { pattern: /directeur de maintenance/i, grade: "Directeur Maintenance" },
  { pattern: /directeur general/i, grade: "Directeur Général" },
  { pattern: /directeur gestion/i, grade: "Directeur Général" },
  { pattern: /directeur communication/i, grade: "Superviseur Communication" },
  { pattern: /citoyens riches/i, grade: "Directeur du Site" },
  { pattern: /secretaire personnel/i, grade: "Secrétaire Admin." },
  { pattern: /secretaire en chef/i, grade: "Secrétaire Admin." },
];

/** Rôle Discord fusionné (ex. Directeur + Adjoint) — branche seulement, pas de grade précis */
export function isCombinedBroadDiscordRole(roleName: string): boolean {
  const clean = sanitizeDiscordRoleName(roleName);
  if (/\s*\+\s*/.test(roleName) || /\s*\+\s*/.test(clean)) return true;
  if (/directeur.*adjoint|adjoint.*directeur/i.test(clean)) return true;
  return false;
}

export function resolveAliasGrade(roleName: string): string | undefined {
  if (isCombinedBroadDiscordRole(roleName)) return undefined;
  const clean = sanitizeDiscordRoleName(roleName);
  const norm = normalizeRoleLabel(clean);
  for (const { pattern, grade } of DISCORD_ROLE_ALIASES) {
    if (pattern.test(clean) || pattern.test(norm)) {
      return grade;
    }
  }
  return undefined;
}
