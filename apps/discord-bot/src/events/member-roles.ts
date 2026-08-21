import { PermissionFlagsBits, type Guild, type GuildMember } from "discord.js";
import { api, ApiError } from "../lib/api.js";
import { resolveMemberRpGrade } from "../lib/member-grade.js";
import { config } from "../config.js";

/** Evite boucle Discord -> Site -> Discord apres sync bot */
const skipUntil = new Map<string, number>();

export function muteDiscordGradeSync(discordId: string, ms = 12_000): void {
  skipUntil.set(discordId, Date.now() + ms);
}

function isMuted(discordId: string): boolean {
  const until = skipUntil.get(discordId) ?? 0;
  if (Date.now() < until) return true;
  skipUntil.delete(discordId);
  return false;
}

/** Permissions Discord qui, sur N'IMPORTE QUEL role du membre, en font un "staff" */
const STAFF_PERMISSION_FLAGS = [
  PermissionFlagsBits.Administrator,
  PermissionFlagsBits.ManageGuild,
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.BanMembers,
  PermissionFlagsBits.KickMembers,
  PermissionFlagsBits.ModerateMembers,
];

const RANK_ROLE_IDS = [
  ...config.roleRankIds.SURVEILLANT,
  ...config.roleRankIds.OFFICIER,
  ...config.roleRankIds.COORDINATEUR_GENERAL,
  ...config.roleRankIds.FONDATEUR,
];

/**
 * Vrai si le membre a AU MOINS UN role donnant une permission staff reelle,
 * ou un role explicitement liste dans ROLE_STAFF (config.roleStaffIds), ou
 * un des 4 roles de rang nommes (Surveillant/Officier/Coordinateur Général/
 * Fondateur) — meme si ce role n'a pas de vraie permission Discord dessus.
 */
function memberHasStaffRole(member: GuildMember): boolean {
  return member.roles.cache.some(
    (role) =>
      config.roleStaffIds.includes(role.id) ||
      RANK_ROLE_IDS.includes(role.id) ||
      STAFF_PERMISSION_FLAGS.some((flag) => role.permissions.has(flag)),
  );
}

type StaffRank = "SURVEILLANT" | "OFFICIER" | "COORDINATEUR_GENERAL";

/**
 * Rang le plus eleve detecte parmi les roles nommes du membre (Fondateur,
 * Coordinateur Général, Officier, Surveillant) — le role Discord "Fondateur"
 * plafonne a COORDINATEUR_GENERAL cote site : ADMIN reste toujours decide a
 * la main (voir syncStaffRoleFromDiscord cote API).
 */
function detectStaffRank(member: GuildMember): StaffRank | undefined {
  const roleIds = member.roles.cache;
  if (
    config.roleRankIds.FONDATEUR.some((id) => roleIds.has(id)) ||
    config.roleRankIds.COORDINATEUR_GENERAL.some((id) => roleIds.has(id))
  ) {
    return "COORDINATEUR_GENERAL";
  }
  if (config.roleRankIds.OFFICIER.some((id) => roleIds.has(id))) return "OFFICIER";
  if (config.roleRankIds.SURVEILLANT.some((id) => roleIds.has(id))) return "SURVEILLANT";
  return undefined;
}

/** Appelle le sync staff pour un membre qui a (au moins) un role staff — no-op cote API sinon */
async function promoteIfStaff(member: GuildMember): Promise<boolean> {
  try {
    const result = await api.syncStaffRoleFromDiscord({
      discordId: member.id,
      hasStaffRole: true,
      staffRank: detectStaffRank(member),
    });
    return !result.unchanged;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return false;
    console.warn(`[sync] Discord -> Site (staff) echoue pour ${member.user.tag} :`, err);
    return false;
  }
}

/** Quand un role Discord "staff" est present, promeut le compte STAFF sur le site (jamais de retrogradation auto) */
async function syncStaffRole(newMember: GuildMember): Promise<void> {
  if (!memberHasStaffRole(newMember)) return;
  const promoted = await promoteIfStaff(newMember);
  if (promoted) {
    console.log(
      `[sync] Discord -> Site : ${newMember.user.tag} promu STAFF (role staff Discord détecté)`,
    );
  }
}

/**
 * Au demarrage du bot, rattrape TOUS les membres deja presents avec un role
 * staff — pas seulement ceux dont le role change apres coup. Idempotent
 * (no-op si deja STAFF/ADMIN cote site), donc sans risque a chaque redemarrage.
 */
export async function backfillStaffRoles(guild: Guild): Promise<void> {
  const members = await guild.members.fetch();
  let promoted = 0;
  for (const member of members.values()) {
    if (member.user.bot) continue;
    if (!memberHasStaffRole(member)) continue;
    if (await promoteIfStaff(member)) promoted++;
  }
  console.log(
    `[sync] Backfill staff au demarrage : ${promoted} compte(s) promu(s) STAFF sur ${members.size} membre(s) scanne(s).`,
  );
}

/** Quand un role RP Discord change, met a jour le grade sur le site */
export async function handleMemberRoleChange(
  oldMember: GuildMember,
  newMember: GuildMember,
): Promise<void> {
  if (oldMember.roles.cache.equals(newMember.roles.cache)) return;
  if (newMember.user.bot) return;

  await syncStaffRole(newMember);

  if (isMuted(newMember.id)) return;

  const detected = resolveMemberRpGrade(newMember);
  if (!detected) return;

  try {
    const profile = await api.getProfileByDiscord(newMember.id);
    if (profile.grade === detected.grade) return;

    await api.syncGradeFromDiscord({
      discordId: newMember.id,
      grade: detected.grade,
      discordRoleName: detected.roleName,
    });

    console.log(
      `[sync] Discord -> Site : ${newMember.user.tag} => ${detected.grade} (${detected.roleName})`,
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return;
    console.warn("[sync] Discord -> Site echoue :", err);
  }
}
