import { type GuildMember } from "discord.js";
import { config } from "../config.js";
import type { PlayerProfile } from "./api.js";
import { ensureGradeRole } from "./ensure-rp-roles.js";
import {
  getManagedRoleIds,
  resolveGradeRoleId,
} from "./discord-role-registry.js";
import { muteDiscordGradeSync } from "../events/member-roles.js";

import { formatRpNickname } from "./format-rp-nickname.js";
import { isRecognizedMemberRpRole, resolveMemberRpGrade } from "./member-grade.js";
import { pickGradeForRoleApply, isDefaultSiteGrade } from "./grade-sync.js";

export type ApplyMemberRolesResult = {
  roleApplyError?: string;
  nicknameError?: string;
};

/** Applique pseudo + role RP (grade in-game) sans toucher staff / joueur de base */
export async function applyMemberRoles(
  member: GuildMember,
  profile: Pick<
    PlayerProfile,
    | "grade"
    | "faction"
    | "teamName"
    | "minecraftUsername"
    | "rpFirstName"
    | "rpLastName"
  >,
): Promise<ApplyMemberRolesResult> {
  const managed = getManagedRoleIds();
  const detected = resolveMemberRpGrade(member);
  const gradeForRoles = detected
    ? pickGradeForRoleApply(profile.grade, detected.grade)
    : profile.grade;

  const target = new Set(
    [...member.roles.cache.keys()].filter((id) => !managed.has(id)),
  );

  let primaryRole =
    (detected?.roleId && member.roles.cache.has(detected.roleId)
      ? detected.roleId
      : undefined) ?? resolveGradeRoleId(gradeForRoles);

  if (!primaryRole && config.roles.autoCreate && !isDefaultSiteGrade(gradeForRoles)) {
    primaryRole = await ensureGradeRole(member.guild, gradeForRoles);
  }

  if (primaryRole) {
    target.add(primaryRole);
  } else {
    for (const role of member.roles.cache.values()) {
      if (!managed.has(role.id)) continue;
      if (isRecognizedMemberRpRole(role.name)) target.add(role.id);
    }
  }

  if (config.roleVerified) target.add(config.roleVerified);

  muteDiscordGradeSync(member.id);

  const result: ApplyMemberRolesResult = {};

  try {
    await member.roles.set([...target], "Sync grade RP REDLAKES");
  } catch (err) {
    result.roleApplyError =
      err instanceof Error
        ? err.message
        : "Permissions insuffisantes ou rôle plus haut que le bot.";
  }

  const nick = formatRpNickname({
    ...profile,
    grade: gradeForRoles,
  });

  try {
    await member.setNickname(nick, "Sync grade RP REDLAKES");
  } catch (err) {
    result.nicknameError =
      err instanceof Error ? err.message : "Impossible de changer le pseudo.";
  }

  return result;
}

/** Retire uniquement les roles RP geres (a la deliaison) */
export async function removeManagedRoles(member: GuildMember): Promise<void> {
  const managed = getManagedRoleIds();
  const keep = [...member.roles.cache.keys()].filter((id) => !managed.has(id));
  await member.roles.set(keep, "Deliaison REDLAKES").catch(() => undefined);
}

export async function logToChannel(
  client: import("discord.js").Client,
  message: string,
): Promise<void> {
  const { TextChannel } = await import("discord.js");
  if (!config.channels.logs) return;

  try {
    const channel = await client.channels.fetch(config.channels.logs);
    if (channel instanceof TextChannel) {
      await channel.send(message);
    }
  } catch {
    /* salon de logs introuvable */
  }
}
