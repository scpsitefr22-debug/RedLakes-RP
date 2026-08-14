import type { GuildMember } from "discord.js";
import { api, ApiError } from "../lib/api.js";
import { resolveMemberRpGrade } from "../lib/member-grade.js";

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

/** Quand un role RP Discord change, met a jour le grade sur le site */
export async function handleMemberRoleChange(
  oldMember: GuildMember,
  newMember: GuildMember,
): Promise<void> {
  if (oldMember.roles.cache.equals(newMember.roles.cache)) return;
  if (newMember.user.bot) return;
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
