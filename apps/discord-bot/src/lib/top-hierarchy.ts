/**
 * Rangement du HAUT de la hierarchie : roles bot puis roles staff, dans cet
 * ordre, avant le bloc RP (categories + grades) deja gere par organize-rp-roles.ts.
 * Le bloc RP n'est pas touche ici — on repositionne seulement bots + staff,
 * puis on relance le rangement RP existant qui detecte automatiquement le
 * nouveau plancher staff.
 */
import type { Guild, Role } from "discord.js";
import { normalizeRoleLabel } from "./rp-catalog.js";

const BASE_TIER_PATTERNS = [
  /^membre$/i,
  /^joueur$/i,
  /^visiteur$/i,
  /^civil$/i,
  /^nouveau/i,
  /^invite/i,
  /verified|verifi/i,
  /muted/i,
  /\bping\b/i,
  /announcement/i,
  /donateur/i,
  /donator/i,
  /\bvip\b/i,
];

/** Volontairement plus etroit que STAFF_ROLE_PATTERNS (rp-catalog.ts) — exclut
 * les roles de base (Membre/Joueur/...) qui ne doivent pas bouger ici. */
const STAFF_ONLY_PATTERNS = [
  /\bstaff\b/i,
  /\badmin\b/i,
  /\bmod(erat(eur|ion)?)?\b/i,
  /\bowner\b/i,
  /fondateur/i,
  /co-?fondateur/i,
  /d[ée]veloppeur/i,
  /developer/i,
  /\bdev\b/i,
  /helper/i,
  /support/i,
  /animateur/i,
  /b[ée]n[ée]vole/i,
  /gerant/i,
  /gérant/i,
  /gestionnaire/i,
  /community/i,
  /redlake\s*team/i,
  /chef\s*(?:du\s*)?serveur/i,
  /super-?admin/i,
  /technique\s*staff/i,
  /gestion\s*staff/i,
];

function isBaseTier(role: Role): boolean {
  return BASE_TIER_PATTERNS.some((p) => p.test(role.name));
}

function isStaffOnlyRole(role: Role): boolean {
  if (role.managed) return false;
  if (isBaseTier(role)) return false;
  return STAFF_ONLY_PATTERNS.some((p) => p.test(role.name));
}

function isIaPrincipalRole(role: Role): boolean {
  const n = normalizeRoleLabel(role.name);
  return n.includes("ia") && n.includes("principal");
}

export interface TopHierarchyPlan {
  botOrder: Role[];
  staffOrder: Role[];
  redlakeRole: Role | null;
  iaRole: Role | null;
}

/** Calcule l'ordre cible sans rien modifier — a afficher en apercu avant confirmation */
export async function computeTopHierarchyPlan(guild: Guild): Promise<TopHierarchyPlan> {
  await guild.roles.fetch();

  const redlakeRole =
    guild.roles.cache.find((r) => r.tags?.botId === guild.client.user?.id) ?? null;

  const iaRole = guild.roles.cache.find(
    (r) => isIaPrincipalRole(r) && r.id !== redlakeRole?.id,
  ) ?? null;

  const otherBots = [...guild.roles.cache.values()]
    .filter((r) => r.managed && r.id !== redlakeRole?.id && r.id !== iaRole?.id)
    .sort((a, b) => b.position - a.position);

  const botOrder = [redlakeRole, iaRole, ...otherBots].filter(
    (r): r is Role => r !== null,
  );

  const staffOrder = [...guild.roles.cache.values()]
    .filter((r) => isStaffOnlyRole(r) && r.id !== iaRole?.id)
    .sort((a, b) => b.position - a.position);

  return { botOrder, staffOrder, redlakeRole, iaRole };
}

/** Applique le plan calcule par computeTopHierarchyPlan — bots puis staff, tout en haut */
export async function applyTopHierarchyPlan(guild: Guild, plan: TopHierarchyPlan): Promise<void> {
  const ordered = [...plan.botOrder, ...plan.staffOrder];
  if (!ordered.length) return;

  const highestPosition = Math.max(...guild.roles.cache.map((r) => r.position));
  const rolePositions = ordered.map((role, index) => ({
    role: role.id,
    position: highestPosition - index,
  }));

  try {
    await guild.roles.setPositions(rolePositions);
  } catch (err) {
    console.warn("[top-hierarchy] setPositions batch echoue, un par un…", err);
    for (const item of rolePositions) {
      const role = guild.roles.cache.get(item.role);
      await role
        ?.setPosition(item.position, { reason: "Rangement hierarchie REDLAKES (bots+staff)" })
        .catch(() => undefined);
    }
  }
}

export function formatTopHierarchyPreview(plan: TopHierarchyPlan): string {
  const lines: string[] = [];
  lines.push("**Rôles bot** (tout en haut) :");
  lines.push(
    plan.botOrder.length
      ? plan.botOrder.map((r, i) => `${i + 1}. ${r.name}`).join("\n")
      : "_aucun détecté_",
  );
  lines.push("");
  lines.push("**Rôles staff** (juste après) :");
  lines.push(
    plan.staffOrder.length
      ? plan.staffOrder.map((r, i) => `${i + 1}. ${r.name}`).join("\n")
      : "_aucun détecté_",
  );
  lines.push("");
  lines.push(
    "Ensuite : les catégories RP + grades correspondants sont rangés dessous " +
      "(même logique que le bouton **Organiser**). Tout le reste (Membre, Joueur, " +
      "boosts, rôles inconnus…) reste où il est.",
  );
  return lines.join("\n");
}
