/**
 * Catalogue de grades charge depuis l'API CORE (source de verite) au lieu
 * de RP_GRADE_NAMES, une liste figee de 85 noms generee un jour depuis un
 * fichier Excel. Le catalogue reel cote site (table Grade, gerable depuis
 * /staff/grades) contient aujourd'hui 142 grades — les grades ajoutes
 * depuis (ex. "Grand Maître", "Archimage" pour Main du Serpent) n'etaient
 * jamais reconnus cote Discord avec l'ancienne liste.
 *
 * isRpGradeName / getCanonicalGradeLabels (rp-catalog.ts) et donc TOUT ce
 * qui en depend — reconnaissance de role, ensure-rp-roles, organize-rp-
 * roles, wipe-rp-roles, run-role-rebuild, run-role-diagnostic — utilisent
 * desormais ce catalogue live des qu'il est charge, avec repli silencieux
 * sur RP_GRADE_NAMES si l'API est injoignable. Appeler refreshGradeCatalog()
 * au demarrage : deja fait dans index.ts (bot principal) et dans chaque
 * script autonome qui touche aux roles RP (run-role-rebuild.ts,
 * run-role-diagnostic.ts).
 */
import { api } from "./api.js";

let liveGradeNames: string[] = [];

export async function refreshGradeCatalog(): Promise<void> {
  try {
    const grades = await api.getGrades();
    const names = grades.map((g) => g.name).filter(Boolean);
    liveGradeNames = names;
    console.log(`[grades] Catalogue CORE charge : ${names.length} grade(s).`);
  } catch (err) {
    console.warn(
      "[grades] Echec chargement catalogue CORE — reconnaissance des grades limitee a la liste statique de secours :",
      err,
    );
  }
}

export function getLiveGradeNames(): readonly string[] {
  return liveGradeNames;
}
