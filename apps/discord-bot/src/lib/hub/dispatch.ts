import {
  EmbedBuilder,
  MessageFlags,
  type ChatInputCommandInteraction,
  type ModalSubmitInteraction,
} from "discord.js";
import { assertStaff } from "../role-admin.js";
import { COLORS, BRAND } from "../theme.js";
import { HUB_PREFIX } from "./constants.js";
import { type NavInteraction, type View, viewPayload } from "./navigation.js";
import { renderRootMenu, renderStaffMenu } from "./views/home.js";
import { renderProfil, buildIdentiteModal, handleIdentiteModalSubmit } from "./views/profile.js";
import {
  renderOrganisation,
  renderFaction,
  renderDepartement,
  renderTeam,
  renderGrades,
  renderAllFactions,
  renderFactionDetail,
  renderAllDepartments,
  renderDepartmentDetail,
} from "./views/organisation.js";
import {
  buildLinkModal,
  handleLinkModalSubmit,
  renderUnlinkConfirm,
  handleUnlinkConfirm,
  handleResync,
} from "./views/account.js";
import {
  renderServeur,
  renderSiteOverview,
  renderSiteSection,
  renderCandidater,
  renderEtat,
} from "./views/site.js";
import {
  renderRapports,
  renderTransmissions,
  buildPlayerSearchModal,
  handlePlayerSearchModalSubmit,
  handleRolesEntry,
} from "./views/staff.js";
import { renderSoon } from "./views/soon.js";

export { isMainHubInteraction } from "./navigation.js";

const MENU_SELECTS = new Set(["nav", "navstaff", "orgnav"]);

async function buildPageView(
  interaction: NavInteraction,
  ownerId: string,
  page: string,
): Promise<View> {
  const isStaffMember = interaction.inCachedGuild() && assertStaff(interaction);

  if (page === "menu") return renderRootMenu(ownerId, isStaffMember);
  if (page.startsWith("soon:")) {
    return renderSoon(ownerId, page.slice("soon:".length), isStaffMember ? "staff" : "menu");
  }
  if (page === "profil") {
    return renderProfil(ownerId, interaction.inCachedGuild() ? interaction.guild : null);
  }
  if (page === "organisation") return renderOrganisation(ownerId);
  if (page === "faction") return renderFaction(ownerId);
  if (page === "departement") return renderDepartement(ownerId);
  if (page === "team") return renderTeam(ownerId);
  if (page === "grades") return renderGrades(ownerId);
  if (page === "allfactions") return renderAllFactions(ownerId);
  if (page === "alldepartments") return renderAllDepartments(ownerId);
  if (page === "serveur") return renderServeur(ownerId);
  if (page === "site") return renderSiteOverview(ownerId);
  if (page === "candidater") return renderCandidater(ownerId);
  if (page === "etat") return renderEtat(ownerId, interaction.client);
  if (page === "unlink") return renderUnlinkConfirm(ownerId);

  if (page === "staff") {
    return isStaffMember ? renderStaffMenu(ownerId) : renderRootMenu(ownerId, isStaffMember);
  }
  if (!isStaffMember) return renderRootMenu(ownerId, isStaffMember);

  if (page === "rapports") return renderRapports(ownerId);
  if (page === "transmissions") return renderTransmissions(ownerId);

  return renderStaffMenu(ownerId);
}

async function routeToPage(interaction: NavInteraction, ownerId: string, page: string): Promise<void> {
  if (page === "identite") {
    await interaction.showModal(buildIdentiteModal(ownerId));
    return;
  }
  if (page === "link") {
    await interaction.showModal(buildLinkModal(ownerId));
    return;
  }
  if (page === "joueurs") {
    if (!interaction.inCachedGuild() || !assertStaff(interaction)) {
      await interaction.reply({
        content: "Permission **Gérer les rôles** requise.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await interaction.showModal(buildPlayerSearchModal(ownerId));
    return;
  }
  if (page === "roles") {
    await handleRolesEntry(interaction);
    return;
  }
  if (page === "resync") {
    await handleResync(interaction, ownerId);
    return;
  }
  if (page === "unlinkconfirm") {
    await handleUnlinkConfirm(interaction, ownerId);
    return;
  }

  await interaction.deferUpdate();
  const view = await buildPageView(interaction, ownerId, page);
  await interaction.editReply(viewPayload(view));
}

export async function handleMainHubComponent(interaction: NavInteraction): Promise<void> {
  const rest = interaction.customId.slice(HUB_PREFIX.length);
  const [ownerId, action, sub] = rest.split(":");

  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: "Ce hub appartient à quelqu'un d'autre — lance `/hub` pour le tien.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.isStringSelectMenu()) {
    const value = interaction.values[0];
    if (MENU_SELECTS.has(action)) {
      await routeToPage(interaction, ownerId, value);
      return;
    }
    if (action === "gradesel") {
      await interaction.deferUpdate();
      await interaction.editReply(viewPayload(await renderGrades(ownerId, value === "all" ? undefined : value)));
      return;
    }
    if (action === "factionpick") {
      await interaction.deferUpdate();
      await interaction.editReply(viewPayload(await renderFactionDetail(ownerId, value)));
      return;
    }
    if (action === "deptpick") {
      await interaction.deferUpdate();
      await interaction.editReply(viewPayload(await renderDepartmentDetail(ownerId, value)));
      return;
    }
    if (action === "sitesel") {
      await interaction.deferUpdate();
      await interaction.editReply(viewPayload(renderSiteSection(ownerId, value)));
      return;
    }
    return;
  }

  if (action === "close") {
    await handleClose(interaction);
    return;
  }
  if (action === "refresh") {
    await interaction.deferUpdate();
    const view = await buildPageView(interaction, ownerId, sub);
    await interaction.editReply(viewPayload(view));
    return;
  }

  const page = action === "goto" ? sub : action;
  await routeToPage(interaction, ownerId, page);
}

async function handleClose(interaction: NavInteraction): Promise<void> {
  await interaction.deferUpdate();
  try {
    await interaction.deleteReply();
  } catch {
    await interaction
      .editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.redlake)
            .setDescription("Hub fermé. Relance `/hub` pour rouvrir.")
            .setFooter({ text: BRAND.footer }),
        ],
        components: [],
      })
      .catch(() => undefined);
  }
}

export async function handleMainHubModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const rest = interaction.customId.slice(HUB_PREFIX.length);
  const [ownerId, kind, sub] = rest.split(":");

  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: "Ce hub appartient à quelqu'un d'autre.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (kind !== "modal") return;

  if (sub === "identite") {
    await handleIdentiteModalSubmit(interaction, ownerId);
    return;
  }
  if (sub === "link") {
    await handleLinkModalSubmit(interaction, ownerId);
    return;
  }
  if (sub === "joueurs") {
    await handlePlayerSearchModalSubmit(interaction);
    return;
  }
}

export async function postMainHub(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Commande utilisable uniquement sur le serveur.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const isStaff = assertStaff(interaction);
  const view = renderRootMenu(interaction.user.id, isStaff);
  await interaction.reply({ ...viewPayload(view), flags: MessageFlags.Ephemeral });
}
