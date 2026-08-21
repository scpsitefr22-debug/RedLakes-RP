import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { COLORS, BRAND } from "../../theme.js";
import { backRow, closeButton, hubId, siteButton, type View } from "../navigation.js";

function buildPlayerMenu(ownerId: string, isStaff: boolean): StringSelectMenuBuilder {
  return new StringSelectMenuBuilder()
    .setCustomId(hubId(ownerId, "nav"))
    .setPlaceholder("Choisis une section...")
    .addOptions(
      { label: "Mon profil", value: "profil", emoji: "📋" },
      { label: "Mon identité RP", value: "identite", emoji: "🪪" },
      { label: "Organisation", value: "organisation", emoji: "🎖️" },
      { label: "Toutes les factions", value: "allfactions", emoji: "🌐" },
      { label: "Tous les départements", value: "alldepartments", emoji: "🏙️" },
      { label: "Statut serveur", value: "serveur", emoji: "🖥️" },
      { label: "Site & Wiki", value: "site", emoji: "📖" },
      { label: "Candidater", value: "candidater", emoji: "📜" },
      { label: "Lier mon compte", value: "link", emoji: "🔗" },
      { label: "Délier mon compte", value: "unlink", emoji: "🔓" },
      { label: "État du bot", value: "etat", emoji: "📶" },
      { label: "Mes candidatures", value: "soon:candidatures", emoji: "📄" },
      { label: "Mes sanctions", value: "soon:sanctions", emoji: "⚖️" },
      { label: "Mes missions", value: "soon:missions", emoji: "🎯" },
      { label: "Mes notifications", value: "soon:notifications", emoji: "🔔" },
      ...(isStaff ? [{ label: "Espace Staff", value: "staff", emoji: "🛡️" }] : []),
    );
}

function buildStaffMenu(ownerId: string): StringSelectMenuBuilder {
  return new StringSelectMenuBuilder()
    .setCustomId(hubId(ownerId, "navstaff"))
    .setPlaceholder("Choisis un outil staff...")
    .addOptions(
      { label: "Rapports RP", value: "rapports", emoji: "📑" },
      { label: "Rechercher un joueur", value: "joueurs", emoji: "👥" },
      { label: "Gestion des rôles", value: "roles", emoji: "🎖️" },
      { label: "Dernières transmissions", value: "transmissions", emoji: "📡" },
      { label: "Candidatures", value: "soon:candidatures_staff", emoji: "📋" },
      { label: "Notifications staff", value: "soon:notifications_staff", emoji: "🔔" },
      { label: "Outils administratifs", value: "soon:outils", emoji: "🛠️" },
    );
}

export function renderRootMenu(ownerId: string, isStaff: boolean): View {
  const embed = new EmbedBuilder()
    .setColor(COLORS.redlake)
    .setTitle("🤖 REDLAKES CORE — Hub")
    .setDescription(
      "Le centre de contrôle REDLAKES — tout ce que le bot sait faire est ici.\n" +
        "Choisis une section ci-dessous.",
    )
    .setFooter({ text: BRAND.footer });
  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(buildPlayerMenu(ownerId, isStaff)),
      new ActionRowBuilder<ButtonBuilder>().addComponents(siteButton(), closeButton(ownerId)),
    ],
  };
}

export function renderStaffMenu(ownerId: string): View {
  const embed = new EmbedBuilder()
    .setColor(COLORS.staff)
    .setTitle("🛡️ Espace Staff")
    .setDescription(
      "Accès réservé — permission Discord **Gérer les rôles / le serveur** requise.\n" +
        "⚠️ Validation basée sur les permissions Discord pour l'instant, pas encore sur le rôle CORE " +
        "(l'API ne renvoie pas encore le rôle du compte lié — voir rapport d'audit).",
    )
    .setFooter({ text: BRAND.footer });
  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(buildStaffMenu(ownerId)),
      backRow(ownerId, "menu"),
    ],
  };
}
