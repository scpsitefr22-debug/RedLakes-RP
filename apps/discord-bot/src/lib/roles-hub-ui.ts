import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
} from "discord.js";
import { COLORS, BRAND } from "./theme.js";
import type { RoleStatusReport } from "./role-admin.js";
import type { BranchId } from "./role-layout.js";
import type { FactionGroupId } from "./discord-role-catalog.js";

export const HUB_PREFIX = "rl:hub:";

export function hubId(...parts: string[]): string {
  return HUB_PREFIX + parts.join(":");
}

const BRANCH_OPTIONS: { label: string; value: BranchId | "all"; emoji: string }[] = [
  { label: "Toutes les branches", value: "all", emoji: "🏛️" },
  { label: "Conseil Oméga", value: "omega", emoji: "👑" },
  { label: "Direction", value: "direction", emoji: "📌" },
  { label: "Sécurité", value: "securite", emoji: "🔫" },
  { label: "Scientifique", value: "scientifique", emoji: "🔬" },
  { label: "Maintenance", value: "maintenance", emoji: "🔧" },
  { label: "Général", value: "general", emoji: "📋" },
  { label: "Personnel détenu", value: "classes", emoji: "⛓️" },
];

const FACTION_OPTIONS: { label: string; value: FactionGroupId | "all"; emoji: string }[] = [
  { label: "Toutes les factions", value: "all", emoji: "⚔️" },
  { label: "A.E.G.I.S.", value: "aegis", emoji: "🛡️" },
  { label: "Insurrection du Chaos", value: "chaos", emoji: "💚" },
  { label: "Main du Serpent", value: "serpent", emoji: "🐍" },
  { label: "Global Occult Coalition", value: "goc", emoji: "🌐" },
  { label: "Civil & Ville", value: "civil", emoji: "🏙️" },
  { label: "Gouvernement (USA)", value: "gouvernement", emoji: "🏛️" },
  { label: "REDLAKES PD", value: "police", emoji: "🚔" },
  { label: "Crime global", value: "illegal", emoji: "🌃" },
];

export function buildHubEmbed(status?: RoleStatusReport): EmbedBuilder {
  const missing = status?.totalMissing ?? null;
  const statusLine =
    missing === null
      ? "Clique sur un bouton ci-dessous pour commencer."
      : missing === 0
        ? "✅ **Catalogue complet** — tous les rôles sont sur Discord."
        : `⚠️ **${missing}** élément(s) manquant(s) — utilise **Installation complète** ou les boutons un par un.`;

  return new EmbedBuilder()
    .setColor(COLORS.redlake)
    .setTitle("🎛️ Hub Rôles — REDLAKES RP")
    .setDescription(
      "Panneau staff pour gérer les rôles Discord du serveur.\n" +
        "Style **un clic** — pas besoin de retenir les commandes.\n\n" +
        statusLine,
    )
    .addFields(
      {
        name: "📁 Création",
        value:
          "**Catégories** — séparateurs avec emojis\n" +
          "**Grades** — Site-12 (~75 rôles, sans Elite/Prestige)\n" +
          "**Titres** — 🏅 Elite & ⭐ Prestige (cumulables)\n" +
          "**Factions** — AEGIS, Chaos, Civil, Gouvernement, PD, Crime\n" +
          "**Ping & réunions** — @Membre · / @Réunion …",
        inline: true,
      },
      {
        name: "🌃 & 👤 Gestion",
        value:
          "**Crime global** — grades gang/mafia/MC/cartel (pas par org)\n" +
          "**Attribuer** — choisis un joueur en bas\n" +
          "**Supprimer** — liste **tous** les rôles gérables par le bot (paginé)\n" +
          "**Doublons vides** — nettoie les rôles en double",
        inline: true,
      },
      {
        name: "⚡ Raccourci",
        value:
          "**Coller liste** — envoie une section du guide MD\n" +
          "**Installation complète** crée tout d'un coup\n" +
          "(plusieurs minutes, rate limit Discord)",
        inline: false,
      },
    )
    .setFooter({ text: `${BRAND.footer} · Staff uniquement` });
}

export function buildHubComponents() {
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(hubId("btn", "categories"))
      .setLabel("Catégories")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("📁"),
    new ButtonBuilder()
      .setCustomId(hubId("btn", "grades"))
      .setLabel("Grades")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🏛️"),
    new ButtonBuilder()
      .setCustomId(hubId("btn", "titres"))
      .setLabel("Titres")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🏅"),
    new ButtonBuilder()
      .setCustomId(hubId("btn", "factions"))
      .setLabel("Factions")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("⚔️"),
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(hubId("btn", "org"))
      .setLabel("Crime global")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🌃"),
    new ButtonBuilder()
      .setCustomId(hubId("btn", "statut"))
      .setLabel("Statut")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("📊"),
    new ButtonBuilder()
      .setCustomId(hubId("btn", "organiser"))
      .setLabel("Organiser")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🔧"),
    new ButtonBuilder()
      .setCustomId(hubId("btn", "refresh"))
      .setLabel("Actualiser")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🔄"),
  );

  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(hubId("btn", "import"))
      .setLabel("Coller liste")
      .setStyle(ButtonStyle.Success)
      .setEmoji("📋"),
    new ButtonBuilder()
      .setCustomId(hubId("btn", "tout"))
      .setLabel("Installation complète")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("✅"),
    new ButtonBuilder()
      .setCustomId(hubId("btn", "delete"))
      .setLabel("Supprimer rôles")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🗑️"),
    new ButtonBuilder()
      .setCustomId(hubId("btn", "dupes"))
      .setLabel("Doublons vides")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🧹"),
    new ButtonBuilder()
      .setCustomId(hubId("btn", "membres"))
      .setLabel("Membres ping")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("👥"),
  );

  const row4 = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId(hubId("user", "pick"))
      .setPlaceholder("👤 Choisir un joueur pour lui attribuer un rôle…")
      .setMinValues(1)
      .setMaxValues(1),
  );

  return [row1, row2, row3, row4];
}

export function buildGradeSelectMenu() {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(hubId("sel", "grades"))
      .setPlaceholder("Quelle branche Site-12 créer ?")
      .addOptions(
        BRANCH_OPTIONS.map((o) => ({
          label: o.label,
          value: o.value,
          emoji: o.emoji,
        })),
      ),
  );
}

export function buildFactionSelectMenu() {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(hubId("sel", "factions"))
      .setPlaceholder("Quelle faction créer ?")
      .addOptions(
        FACTION_OPTIONS.map((o) => ({
          label: o.label,
          value: o.value,
          emoji: o.emoji,
        })),
      ),
  );
}

export function buildConfirmAllRow() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(hubId("btn", "confirm-tout"))
      .setLabel("Oui, tout installer")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("✅"),
    new ButtonBuilder()
      .setCustomId(hubId("btn", "cancel"))
      .setLabel("Annuler")
      .setStyle(ButtonStyle.Secondary),
  );
}

export function buildConfirmDeleteRow(token: string) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(hubId("btn", "confirm-del", token))
      .setLabel("Oui, supprimer définitivement")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🗑️"),
    new ButtonBuilder()
      .setCustomId(hubId("btn", "cancel"))
      .setLabel("Annuler")
      .setStyle(ButtonStyle.Secondary),
  );
}

export function buildGiveRemoveRow(userId: string, roleId: string) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(hubId("btn", "give", userId, roleId))
      .setLabel("Attribuer")
      .setStyle(ButtonStyle.Success)
      .setEmoji("➕"),
    new ButtonBuilder()
      .setCustomId(hubId("btn", "remove", userId, roleId))
      .setLabel("Retirer")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("➖"),
  );
}

export function buildImportModal(): ModalBuilder {
  const field = (id: string, label: string, placeholder: string) =>
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId(id)
        .setLabel(label)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(id === "part1")
        .setMaxLength(4000)
        .setPlaceholder(placeholder),
    );

  return new ModalBuilder()
    .setCustomId(hubId("modal", "import"))
    .setTitle("Coller liste de rôles")
    .addComponents(
      field("part1", "Partie 1 (obligatoire)", "🧹 Responsable d'Entretien…"),
      field("part2", "Partie 2 (optionnel)", "╰┈➤ 📋 Branche Générale…"),
      field("part3", "Partie 3 (optionnel)", "━━━ 🛡️ A.E.G.I.S. ━━━…"),
      field("part4", "Partie 4 (optionnel)", "👥 Membre · … / 📢 Réunion …"),
    );
}

export function buildStatusEmbed(status: RoleStatusReport): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(status.totalMissing ? COLORS.warning : COLORS.success)
    .setTitle("📊 Statut du catalogue")
    .setDescription(
      status.totalMissing === 0
        ? "✅ Tout est en place sur Discord."
        : `⚠️ **${status.totalMissing}** élément(s) manquant(s).`,
    )
    .addFields(
      {
        name: "Catégories",
        value: String(status.missingCategories.length),
        inline: true,
      },
      {
        name: "Grades Site-12",
        value: String(status.missingGrades.length),
        inline: true,
      },
      {
        name: "Titres",
        value: String(status.missingTitres.length),
        inline: true,
      },
      {
        name: "Factions",
        value: String(status.missingFactions.length),
        inline: true,
      },
      {
        name: "Membres ping",
        value: String(status.missingMemberPings.length),
        inline: true,
      },
    )
    .setFooter({ text: BRAND.footer });
}
