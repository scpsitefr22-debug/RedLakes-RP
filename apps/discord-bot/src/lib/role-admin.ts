import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
  ModalSubmitInteraction,
  Role,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
} from "discord.js";
import { PermissionFlagsBits } from "discord.js";
import {
  CATALOG_SEPARATOR_NAMES,
  DISCORD_FOUNDATION_GRADES,
  FACTION_GROUPS,
  FACTION_MEMBER_PING_ROLES,
  HONORARY_TITLES,
  type FactionGroupId,
  getFoundationGrades,
  roleNamesMatch,
  type FoundationGradeDef,
} from "./discord-role-catalog.js";
import { refreshRoleRegistry } from "./discord-role-registry.js";
import { organizeGuildRpRoles } from "./organize-rp-roles.js";
import {
  BRANCH_COLORS,
  getBranchColor,
  isLayoutSeparatorName,
  type BranchId,
} from "./role-layout.js";
import { inferRpRoleStyle } from "./role-style.js";
import { isStaffOrBaseRole } from "./rp-catalog.js";

export interface DeleteRolesResult {
  deleted: string[];
  blocked: Array<{ name: string; reason: string }>;
  errors: string[];
}

export interface BatchProgress {
  total: number;
  done: number;
  created: string[];
  skipped: string[];
  errors: string[];
}

export interface BatchResult {
  created: string[];
  skipped: string[];
  errors: string[];
}

const DEFAULT_DELAY_MS = 1200;

type StaffInteraction =
  | ChatInputCommandInteraction
  | ButtonInteraction
  | StringSelectMenuInteraction
  | UserSelectMenuInteraction
  | RoleSelectMenuInteraction
  | ModalSubmitInteraction;

export function assertStaff(interaction: StaffInteraction): boolean {
  if (!interaction.inCachedGuild()) return false;
  const member = interaction.member;
  if (!member || typeof member.permissions === "string") return false;
  return member.permissions.has(PermissionFlagsBits.ManageRoles);
}

export async function staffGuard(
  interaction: ChatInputCommandInteraction,
): Promise<boolean> {
  return staffGuardInteraction(interaction);
}

export async function staffGuardInteraction(
  interaction: StaffInteraction,
): Promise<boolean> {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Commande utilisable uniquement sur le serveur.",
      ephemeral: true,
    });
    return false;
  }
  if (!assertStaff(interaction)) {
    await interaction.reply({
      content: "Permission **Gérer les rôles** requise.",
      ephemeral: true,
    });
    return false;
  }
  const me = interaction.guild.members.me;
  if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await interaction.reply({
      content: "Le bot n'a pas la permission **Gérer les rôles**.",
      ephemeral: true,
    });
    return false;
  }
  return true;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function sleepRateLimit(err: unknown): Promise<void> {
  const retry = (err as { rawError?: { retry_after?: number } })?.rawError
    ?.retry_after;
  const ms = retry ? Math.ceil(retry * 1000) + 500 : 5000;
  await sleep(ms);
}

function findRoleByName(guild: Guild, name: string): Role | undefined {
  const exact = guild.roles.cache.find((r) => r.name === name);
  if (exact) return exact;
  return guild.roles.cache.find((r) => roleNamesMatch(r.name, name));
}

function findSeparator(guild: Guild, name: string): Role | undefined {
  const exact = guild.roles.cache.find((r) => r.name === name);
  if (exact) return exact;
  return guild.roles.cache.find(
    (r) =>
      isLayoutSeparatorName(r.name) &&
      (r.name.includes(name.slice(4, 20)) || roleNamesMatch(r.name, name)),
  );
}

async function createSeparatorRole(
  guild: Guild,
  name: string,
): Promise<"created" | "skipped" | "error"> {
  if (findSeparator(guild, name)) return "skipped";

  const base = inferRpRoleStyle(guild);
  try {
    await guild.roles.create({
      name: name.slice(0, 100),
      color: BRANCH_COLORS.separator,
      hoist: true,
      mentionable: false,
      permissions: 0n,
      reason: "Categorie roles RP REDLAKES (bot)",
    });
    return "created";
  } catch (err) {
    await sleepRateLimit(err);
    return "error";
  }
}

async function createColoredRole(
  guild: Guild,
  displayName: string,
  branch: BranchId,
  options?: { mentionable?: boolean },
): Promise<"created" | "skipped" | "error"> {
  if (findRoleByName(guild, displayName)) return "skipped";

  const base = inferRpRoleStyle(guild);
  const color = getBranchColor(branch);

  try {
    await guild.roles.create({
      name: displayName.slice(0, 100),
      colors: { primaryColor: color },
      hoist: base.hoist,
      mentionable: options?.mentionable ?? base.mentionable,
      permissions: base.permissions,
      reason: "Role RP REDLAKES (bot)",
    });
    return "created";
  } catch (err) {
    await sleepRateLimit(err);
    return "error";
  }
}

/** Rôle @mentionnable pour ping une faction entière */
async function createMemberPingRole(
  guild: Guild,
  displayName: string,
  branch: BranchId,
): Promise<"created" | "skipped" | "error"> {
  return createColoredRole(guild, displayName, branch, { mentionable: true });
}

async function runBatch(
  guild: Guild,
  items: Array<{ name: string; branch: BranchId; create: () => Promise<"created" | "skipped" | "error"> }>,
  delayMs: number,
  onProgress?: (p: BatchProgress) => Promise<void>,
): Promise<BatchResult> {
  const result: BatchResult = { created: [], skipped: [], errors: [] };

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const status = await item.create();
    if (status === "created") result.created.push(item.name);
    else if (status === "skipped") result.skipped.push(item.name);
    else result.errors.push(item.name);

    if (onProgress) {
      await onProgress({
        total: items.length,
        done: i + 1,
        ...result,
      });
    }

    if (i < items.length - 1) await sleep(delayMs);
  }

  return result;
}

export async function createCategories(
  guild: Guild,
  onProgress?: (p: BatchProgress) => Promise<void>,
): Promise<BatchResult> {
  await guild.roles.fetch();
  const items = CATALOG_SEPARATOR_NAMES.map((name) => ({
    name,
    branch: "separator" as BranchId,
    create: () => createSeparatorRole(guild, name),
  }));
  return runBatch(guild, items, DEFAULT_DELAY_MS, onProgress);
}

export async function createFoundationGrades(
  guild: Guild,
  options?: { branch?: BranchId; onProgress?: (p: BatchProgress) => Promise<void> },
): Promise<BatchResult> {
  await guild.roles.fetch();
  let grades = getFoundationGrades();
  if (options?.branch) {
    grades = grades.filter((g) => g.branch === options.branch);
  }

  const items = grades.map((g: FoundationGradeDef) => ({
    name: g.displayName,
    branch: g.branch,
    create: () => createColoredRole(guild, g.displayName, g.branch),
  }));

  return runBatch(guild, items, DEFAULT_DELAY_MS, options?.onProgress);
}

export async function createHonoraryTitles(
  guild: Guild,
  onProgress?: (p: BatchProgress) => Promise<void>,
): Promise<BatchResult> {
  await guild.roles.fetch();
  const items = HONORARY_TITLES.map((t) => ({
    name: t.displayName,
    branch: "general" as BranchId,
    create: () => createColoredRole(guild, t.displayName, "general"),
  }));
  return runBatch(guild, items, DEFAULT_DELAY_MS, onProgress);
}

export async function createFactionRoles(
  guild: Guild,
  factionId?: FactionGroupId,
  onProgress?: (p: BatchProgress) => Promise<void>,
): Promise<BatchResult> {
  await guild.roles.fetch();
  const groups = factionId
    ? FACTION_GROUPS.filter((g) => g.id === factionId)
    : FACTION_GROUPS;

  const items: Array<{
    name: string;
    branch: BranchId;
    create: () => Promise<"created" | "skipped" | "error">;
  }> = [];

  for (const group of groups) {
    for (const r of group.roles) {
      items.push({
        name: r.displayName,
        branch: r.branch,
        create: () => createColoredRole(guild, r.displayName, r.branch),
      });
    }
  }

  return runBatch(guild, items, DEFAULT_DELAY_MS, onProgress);
}

/** Crée les rôles « 👥 Membre · … » (mentionnables) pour @toute une faction */
export async function createMemberPingRoles(
  guild: Guild,
  onProgress?: (p: BatchProgress) => Promise<void>,
): Promise<BatchResult> {
  await guild.roles.fetch();
  const items = FACTION_MEMBER_PING_ROLES.map((r) => ({
    name: r.displayName,
    branch: r.branch,
    create: () => createMemberPingRole(guild, r.displayName, r.branch),
  }));
  return runBatch(guild, items, DEFAULT_DELAY_MS, onProgress);
}

export async function createAllRoles(
  guild: Guild,
  onProgress?: (label: string, p: BatchProgress) => Promise<void>,
): Promise<{
  categories: BatchResult;
  grades: BatchResult;
  titres: BatchResult;
  factions: BatchResult;
  membres: BatchResult;
}> {
  const wrap =
    (label: string) => async (p: BatchProgress) => {
      if (onProgress) await onProgress(label, p);
    };

  const categories = await createCategories(guild, wrap("Catégories"));
  const grades = await createFoundationGrades(guild, {
    onProgress: wrap("Grades Site-12"),
  });
  const titres = await createHonoraryTitles(guild, wrap("Titres"));
  const factions = await createFactionRoles(guild, undefined, wrap("Factions"));
  const membres = await createMemberPingRoles(guild, wrap("Membres ping"));

  await refreshRoleRegistry(guild, { ensureMissing: false });
  await organizeGuildRpRoles(guild, { force: true });

  return { categories, grades, titres, factions, membres };
}

export async function forceOrganize(guild: Guild): Promise<string> {
  await refreshRoleRegistry(guild, { ensureMissing: false, organize: false });
  const { getServerRoleLayoutEntries } = await import("./discord-server-layout.js");
  const { organizeRolesFromUserList } = await import("./role-organize-catalog.js");
  const r = await organizeRolesFromUserList(guild, getServerRoleLayoutEntries());
  await refreshRoleRegistry(guild, { ensureMissing: false, organize: false });
  return (
    `Hiérarchie Site-12 appliquée : **${r.positioned}** rôles repositionnés ` +
    `(${r.newSeparators.length} catégories créées, ${r.colorsUpdated} couleurs).`
  );
}

export interface RoleStatusReport {
  missingCategories: string[];
  missingGrades: string[];
  missingTitres: string[];
  missingFactions: string[];
  missingMemberPings: string[];
  totalMissing: number;
}

export async function getRoleStatus(guild: Guild): Promise<RoleStatusReport> {
  await guild.roles.fetch();

  const missingCategories = CATALOG_SEPARATOR_NAMES.filter(
    (n) => !findSeparator(guild, n),
  );

  const missingGrades = DISCORD_FOUNDATION_GRADES.filter(
    (g) => !findRoleByName(guild, g.displayName),
  ).map((g) => g.displayName);

  const missingTitres = HONORARY_TITLES.filter(
    (t) => !findRoleByName(guild, t.displayName),
  ).map((t) => t.displayName);

  const missingFactions: string[] = [];
  for (const group of FACTION_GROUPS) {
    for (const r of group.roles) {
      if (!findRoleByName(guild, r.displayName)) {
        missingFactions.push(r.displayName);
      }
    }
  }

  const missingMemberPings = FACTION_MEMBER_PING_ROLES.filter(
    (r) => !findRoleByName(guild, r.displayName),
  ).map((r) => r.displayName);

  return {
    missingCategories: [...missingCategories],
    missingGrades,
    missingTitres,
    missingFactions,
    missingMemberPings,
    totalMissing:
      missingCategories.length +
      missingGrades.length +
      missingTitres.length +
      missingFactions.length +
      missingMemberPings.length,
  };
}

export async function giveRole(
  member: GuildMember,
  role: Role,
): Promise<string> {
  if (member.roles.cache.has(role.id)) {
    return `${member} a déjà le rôle **${role.name}**.`;
  }
  const me = member.guild.members.me;
  if (!me || role.position >= me.roles.highest.position) {
    return "Le bot ne peut pas attribuer ce rôle (hiérarchie trop haute).";
  }
  await member.roles.add(role, "Attribution staff REDLAKES");
  return `**${role.name}** attribué à ${member}.`;
}

export async function removeRole(
  member: GuildMember,
  role: Role,
): Promise<string> {
  if (!member.roles.cache.has(role.id)) {
    return `${member} n'a pas le rôle **${role.name}**.`;
  }
  const me = member.guild.members.me;
  if (!me || role.position >= me.roles.highest.position) {
    return "Le bot ne peut pas retirer ce rôle (hiérarchie trop haute).";
  }
  await member.roles.remove(role, "Retrait staff REDLAKES");
  return `**${role.name}** retiré de ${member}.`;
}

/** Vérifie si le bot peut supprimer ce rôle Discord */
export function assessRoleDeletion(
  guild: Guild,
  role: Role,
): { ok: boolean; reason?: string } {
  if (role.id === guild.id) {
    return { ok: false, reason: "@everyone" };
  }
  if (role.managed) {
    return { ok: false, reason: "rôle géré (bot / intégration)" };
  }
  if (isStaffOrBaseRole(role.name)) {
    return { ok: false, reason: "rôle staff ou joueur de base protégé" };
  }
  const me = guild.members.me;
  if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
    return { ok: false, reason: "le bot n'a pas Gérer les rôles" };
  }
  if (role.position >= me.roles.highest.position) {
    return { ok: false, reason: "rôle au-dessus du bot dans la hiérarchie" };
  }
  return { ok: true };
}

/** Supprime des rôles sélectionnés (avec délai anti rate-limit) */
export async function deleteRoles(
  guild: Guild,
  roleIds: string[],
): Promise<DeleteRolesResult> {
  await guild.roles.fetch();
  const result: DeleteRolesResult = { deleted: [], blocked: [], errors: [] };

  for (let i = 0; i < roleIds.length; i++) {
    const roleId = roleIds[i]!;
    const role = guild.roles.cache.get(roleId);
    if (!role) {
      result.errors.push(roleId);
      continue;
    }

    const check = assessRoleDeletion(guild, role);
    if (!check.ok) {
      result.blocked.push({ name: role.name, reason: check.reason ?? "refusé" });
      continue;
    }

    try {
      await role.delete("Suppression staff REDLAKES (hub rôles)");
      result.deleted.push(role.name);
    } catch (err) {
      result.errors.push(role.name);
      await sleepRateLimit(err);
    }

    if (i < roleIds.length - 1) await sleep(800);
  }

  return result;
}

export function formatDeleteResult(r: DeleteRolesResult): string {
  const lines: string[] = [];
  if (r.deleted.length) {
    lines.push(`🗑️ **${r.deleted.length}** supprimé(s) : ${r.deleted.slice(0, 8).join(", ")}${r.deleted.length > 8 ? "…" : ""}`);
  }
  if (r.blocked.length) {
    lines.push(
      `⛔ **${r.blocked.length}** protégé(s) : ${r.blocked
        .slice(0, 3)
        .map((b) => `${b.name} (${b.reason})`)
        .join("; ")}${r.blocked.length > 3 ? "…" : ""}`,
    );
  }
  if (r.errors.length) {
    lines.push(`❌ **${r.errors.length}** erreur(s) — réessaie ou vérifie la hiérarchie du bot.`);
  }
  return lines.length ? lines.join("\n") : "Aucun rôle supprimé.";
}

export async function purgeEmptyDuplicates(guild: Guild): Promise<string> {
  const { refreshRoleRegistry } = await import("./discord-role-registry.js");
  const { matchExistingRolesToGrades } = await import("./role-matcher.js");
  const { removeEmptyBotDuplicates } = await import("./dedupe-rp-roles.js");

  await guild.roles.fetch();
  const eligible = [...guild.roles.cache.values()].filter(
    (r) => r.id !== guild.id && !r.managed,
  );
  const matches = matchExistingRolesToGrades(
    eligible.map((r) => ({ id: r.id, name: r.name, position: r.position })),
  );
  const removed = await removeEmptyBotDuplicates(guild, matches);
  await refreshRoleRegistry(guild, { ensureMissing: false });

  if (!removed.length) {
    return "Aucun doublon vide détecté.";
  }
  return `🧹 **${removed.length}** doublon(s) supprimé(s) : ${removed.slice(0, 10).join(", ")}${removed.length > 10 ? "…" : ""}`;
}

export function formatBatchResult(label: string, r: BatchResult): string {
  return (
    `**${label}** — ${r.created.length} créé(s), ${r.skipped.length} déjà là, ${r.errors.length} erreur(s)`
  );
}

export function summarizeStatus(s: RoleStatusReport): string {
  if (s.totalMissing === 0) {
    return "✅ Catalogue complet — tous les rôles du bot sont présents sur Discord.";
  }
  const lines: string[] = [
    `⚠️ **${s.totalMissing}** élément(s) manquant(s) :`,
  ];
  if (s.missingCategories.length) {
    lines.push(`• Catégories : **${s.missingCategories.length}**`);
  }
  if (s.missingGrades.length) {
    lines.push(`• Grades Site-12 : **${s.missingGrades.length}**`);
  }
  if (s.missingTitres.length) {
    lines.push(`• Titres : **${s.missingTitres.length}**`);
  }
  if (s.missingFactions.length) {
    lines.push(`• Factions : **${s.missingFactions.length}**`);
  }
  if (s.missingMemberPings.length) {
    lines.push(`• Membres ping : **${s.missingMemberPings.length}**`);
  }
  lines.push("\nOuvre le **Hub Rôles** avec `/hub-roles` pour compléter.");
  return lines.join("\n");
}
