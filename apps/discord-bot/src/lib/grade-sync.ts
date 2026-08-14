import { normalizeRoleLabel } from "./rp-catalog.js";
import { resolveGradeRoleId } from "./discord-role-registry.js";

/** Grade par défaut côté site / Minecraft — pas de rôle RP Discord dédié */
export function isDefaultSiteGrade(grade: string | null | undefined): boolean {
  if (!grade?.trim()) return true;
  const n = normalizeRoleLabel(grade);
  return (
    n === "civil" ||
    n === "joueur" ||
    n === "visiteur" ||
    n === "recrue" ||
    n === "nouveau"
  );
}

export function pickGradeForRoleApply(
  siteGrade: string,
  discordGrade: string | undefined,
): string {
  if (
    discordGrade &&
    (isDefaultSiteGrade(siteGrade) || !resolveGradeRoleId(siteGrade))
  ) {
    return discordGrade;
  }
  return siteGrade;
}

export type MemberGradeHint = {
  grade: string;
  roleName: string;
  roleId: string;
};

export function describeGradeSource(
  siteGrade: string,
  detected: MemberGradeHint | null,
): string {
  if (detected && isDefaultSiteGrade(siteGrade)) {
    return (
      `Grade détecté sur Discord : **${detected.grade}** (rôle « ${detected.roleName} ») — synchronisé avec le site.`
    );
  }
  if (isDefaultSiteGrade(siteGrade) && !detected) {
    return (
      "Grade **Civil** par défaut — promotion in-game (plugin Minecraft) ou ajoute un **rôle RP** sur Discord puis relance `/sync-roles`.\n" +
      "Staff : `/roles-scan` pour indexer les nouveaux rôles du serveur."
    );
  }
  return "Le grade précis vient du serveur Minecraft / site. Les rôles staff ne sont pas modifiés.";
}
