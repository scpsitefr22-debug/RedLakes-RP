import type { Guild, Role } from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from "discord.js";
import { assessRoleDeletion } from "./role-admin.js";
import { isLayoutSeparatorName } from "./role-layout.js";
import { hubId } from "./roles-hub-ui.js";

const PAGE_SIZE = 25;

export type RolePickerMode = "delete" | "assign";

export type RolePickerFilter = "all" | "separators" | "empty";

export interface RolePickerPage {
  content: string;
  components: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[];
  totalPages: number;
  page: number;
  totalRoles: number;
}

function listBotManageableRoles(guild: Guild): Role[] {
  const me = guild.members.me;
  if (!me) return [];
  const botTop = me.roles.highest.position;

  return [...guild.roles.cache.values()]
    .filter((r) => r.id !== guild.id && !r.managed && r.position < botTop)
    .sort((a, b) => b.position - a.position);
}

export function listRolesForPicker(
  guild: Guild,
  mode: RolePickerMode,
  filter: RolePickerFilter = "all",
): Role[] {
  let roles = listBotManageableRoles(guild);

  if (mode === "delete") {
    roles = roles.filter((r) => assessRoleDeletion(guild, r).ok);
  }

  if (filter === "separators") {
    roles = roles.filter((r) => isLayoutSeparatorName(r.name) || /^━━━/.test(r.name));
  } else if (filter === "empty") {
    roles = roles.filter((r) => r.members.size === 0);
  }

  return roles;
}

function truncateLabel(name: string, max = 100): string {
  const clean = name.trim() || "?";
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}

export function buildRolePickerPage(
  guild: Guild,
  mode: RolePickerMode,
  page: number,
  options?: { filter?: RolePickerFilter; userId?: string },
): RolePickerPage {
  const filter = options?.filter ?? "all";
  const roles = listRolesForPicker(guild, mode, filter);
  const totalPages = Math.max(1, Math.ceil(roles.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const slice = roles.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const me = guild.members.me;
  const botRole = me?.roles.highest.name ?? "bot";

  const modeLabel = mode === "delete" ? "supprimer" : "attribuer";
  const filterLabel =
    filter === "separators"
      ? " · séparateurs"
      : filter === "empty"
        ? " · vides uniquement"
        : "";

  const content =
    `**${roles.length}** rôle(s) que le bot peut ${modeLabel}` +
    ` (rôle bot : **${botRole}**${filterLabel})\n` +
    `Page **${safePage + 1}** / **${totalPages}** — sélectionne jusqu'à **${PAGE_SIZE}** rôles.`;

  const components: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] =
    [];

  if (slice.length > 0) {
    const selectId =
      mode === "delete"
        ? hubId("sel", "del-pick", String(safePage), filter)
        : hubId("sel", "assign-pick", options?.userId ?? "x", String(safePage));

    const select = new StringSelectMenuBuilder()
      .setCustomId(selectId)
      .setPlaceholder(
        mode === "delete"
          ? "Rôles à supprimer sur cette page…"
          : "Rôle à attribuer sur cette page…",
      )
      .setMinValues(1)
      .setMaxValues(mode === "delete" ? PAGE_SIZE : 1)
      .addOptions(
        slice.map((r) => ({
          label: truncateLabel(r.name),
          value: r.id,
          description: truncateLabel(
            `${r.members.size} membre(s) · pos ${r.position}`,
            100,
          ),
        })),
      );

    components.push(
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select),
    );
  } else {
    components.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("rl:hub:noop")
          .setLabel("Aucun rôle sur cette page")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
      ),
    );
  }

  const nav = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(
        hubId(
          "btn",
          mode === "delete" ? "del-nav" : "assign-nav",
          String(Math.max(0, safePage - 1)),
          filter,
          options?.userId ?? "",
        ),
      )
      .setLabel("◀ Page préc.")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safePage <= 0),
    new ButtonBuilder()
      .setCustomId(
        hubId(
          "btn",
          mode === "delete" ? "del-nav" : "assign-nav",
          String(Math.min(totalPages - 1, safePage + 1)),
          filter,
          options?.userId ?? "",
        ),
      )
      .setLabel("Page suiv. ▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safePage >= totalPages - 1),
  );

  if (mode === "delete") {
    nav.addComponents(
      new ButtonBuilder()
        .setCustomId(hubId("btn", "del-filter", "separators", String(safePage)))
        .setLabel("Séparateurs")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("📁"),
      new ButtonBuilder()
        .setCustomId(hubId("btn", "del-filter", "empty", String(safePage)))
        .setLabel("Vides")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🧹"),
      new ButtonBuilder()
        .setCustomId(hubId("btn", "del-filter", "all", "0"))
        .setLabel("Tous")
        .setStyle(ButtonStyle.Primary),
    );
  }

  components.push(nav);

  return {
    content,
    components,
    totalPages,
    page: safePage,
    totalRoles: roles.length,
  };
}

export function getRolesByIds(guild: Guild, ids: string[]): Role[] {
  return ids
    .map((id) => guild.roles.cache.get(id))
    .filter((r): r is Role => Boolean(r));
}
