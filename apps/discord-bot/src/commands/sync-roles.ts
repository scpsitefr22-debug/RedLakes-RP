import {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "./types.js";
import { api, ApiError } from "../lib/api.js";
import { COLORS, BRAND } from "../lib/theme.js";
import { applyMemberRoles } from "../lib/roles.js";
import { formatRpNickname } from "../lib/format-rp-nickname.js";
import {
  getRoleRegistry,
  logRegistrySummary,
  refreshRoleRegistry,
  resolveGradeRoleId,
} from "../lib/discord-role-registry.js";
import { ensureMissingRpRoles } from "../lib/ensure-rp-roles.js";
import { removeEmptyBotDuplicates } from "../lib/dedupe-rp-roles.js";
import { matchExistingRolesToGrades } from "../lib/role-matcher.js";
import {
  describeGradeSource,
  isDefaultSiteGrade,
  pickGradeForRoleApply,
} from "../lib/grade-sync.js";
import { resolveMemberRpGrade } from "../lib/member-grade.js";

export const syncRoles: Command = {
  data: new SlashCommandBuilder()
    .setName("sync-roles")
    .setDescription(
      "Synchronise ton grade in-game avec les roles RP Discord (staff non touche)",
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inCachedGuild()) {
      await interaction.editReply("Commande utilisable uniquement sur le serveur.");
      return;
    }

    try {
      await refreshRoleRegistry(interaction.guild, {
        ensureMissing: false,
        organize: false,
      });

      let profile = await api.getProfileByDiscord(interaction.user.id);
      const detected = resolveMemberRpGrade(interaction.member);

      if (detected && isDefaultSiteGrade(profile.grade)) {
        await api.syncGradeFromDiscord({
          discordId: interaction.user.id,
          grade: detected.grade,
          discordRoleName: detected.roleName,
        });
        profile = await api.getProfileByDiscord(interaction.user.id);
      } else if (detected && profile.grade !== detected.grade) {
        await api.syncGradeFromDiscord({
          discordId: interaction.user.id,
          grade: detected.grade,
          discordRoleName: detected.roleName,
        });
        profile = await api.getProfileByDiscord(interaction.user.id);
      }

      const applyResult = await applyMemberRoles(interaction.member, profile);

      const gradeForDisplay = detected
        ? pickGradeForRoleApply(profile.grade, detected.grade)
        : profile.grade;
      const roleId =
        (detected?.roleId && interaction.member.roles.cache.has(detected.roleId)
          ? detected.roleId
          : undefined) ?? resolveGradeRoleId(gradeForDisplay);
      const registry = getRoleRegistry();
      const roleName = roleId
        ? registry.roleNames.get(roleId) ?? detected?.roleName ?? roleId
        : detected
          ? `${detected.roleName} (non indexé — /roles-scan)`
          : "non trouvé";

      const nick = formatRpNickname({
        ...profile,
        grade: gradeForDisplay,
      });

      let warnings = "";
      if (applyResult.roleApplyError) {
        warnings += `\n\n⚠️ **Rôles** : ${applyResult.roleApplyError}`;
      }
      if (applyResult.nicknameError) {
        warnings += `\n⚠️ **Pseudo** : ${applyResult.nicknameError}`;
      }
      if (!detected && isDefaultSiteGrade(profile.grade)) {
        warnings +=
          "\n\n💡 Assigne-toi un **rôle RP** sur Discord (ex. Sergent, Soldat), pas seulement Civil — puis relance `/sync-roles`.";
      }

      const embed = new EmbedBuilder()
        .setColor(roleId ? COLORS.success : COLORS.redlake)
        .setTitle("Synchronisation terminée")
        .setDescription(
          `**Grade** (site) : ${profile.grade}\n` +
            `**Grade appliqué** : ${gradeForDisplay}\n` +
            `**Rôle Discord** : ${roleName}\n` +
            `**Pseudo** : ${nick}\n\n` +
            describeGradeSource(profile.grade, detected) +
            "\nPas de nom RP ? Utilise `/identite prenom nom`." +
            warnings,
        )
        .setFooter({ text: BRAND.footer });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Impossible de synchroniser les roles.";
      await interaction.editReply(msg);
    }
  },
};

export const syncRolesAdmin: Command = {
  data: new SlashCommandBuilder()
    .setName("roles-scan")
    .setDescription(
      "[Staff] Re-scanne, adapte aux roles existants, supprime doublons bot",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (!interaction.inCachedGuild()) return;

    await refreshRoleRegistry(interaction.guild, { ensureMissing: false });

    const eligible = [...interaction.guild.roles.cache.values()].filter(
      (r) => r.id !== interaction.guild.id && !r.managed,
    );
    const matches = matchExistingRolesToGrades(
      eligible.map((r) => ({ id: r.id, name: r.name, position: r.position })),
    );
    const removed = await removeEmptyBotDuplicates(interaction.guild, matches);
    const { created } = await ensureMissingRpRoles(interaction.guild);
    await refreshRoleRegistry(interaction.guild, { ensureMissing: false });
    logRegistrySummary();

    const registry = getRoleRegistry();
    const lines = [...registry.gradeToRoleId.entries()]
      .slice(0, 25)
      .map(
        ([g, id]) =>
          `• ${g} → ${registry.roleNames.get(id) ?? id}`,
      )
      .join("\n");

    const createdLine = created.length
      ? `\n**${created.length}** role(s) cree(s).`
      : "";
    const removedLine = removed.length
      ? `\n**${removed.length}** doublon(s) supprime(s) : ${removed.slice(0, 5).join(", ")}${removed.length > 5 ? "…" : ""}`
      : "";

    await interaction.editReply(
      `**${registry.managedRoleIds.size}** roles RP detectes.${createdLine}${removedLine}\n\n${lines || "Aucun mapping."}`,
    );
  },
};
