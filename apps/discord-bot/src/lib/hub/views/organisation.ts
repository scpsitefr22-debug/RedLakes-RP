import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import {
  api,
  ApiError,
  type DepartmentSummary,
  type FactionSummary,
  type GradeInfo,
  type PlayerProfile,
} from "../../api.js";
import { COLORS, BRAND, parseHexColor } from "../../theme.js";
import { backRow, hubId, noticeView, type View } from "../navigation.js";
import { BRANCH_CHOICES, BRANCH_LABELS } from "../constants.js";

export function renderOrganisation(ownerId: string): View {
  const embed = new EmbedBuilder()
    .setColor(COLORS.redlake)
    .setTitle("🎖️ Organisation")
    .setDescription("Ta place dans la hiérarchie REDLAKES.")
    .setFooter({ text: BRAND.footer });
  const select = new StringSelectMenuBuilder()
    .setCustomId(hubId(ownerId, "orgnav"))
    .setPlaceholder("Choisis une section...")
    .addOptions(
      { label: "Ma faction", value: "faction", emoji: "🏛️" },
      { label: "Mon département", value: "departement", emoji: "🏢" },
      { label: "Ma team", value: "team", emoji: "👥" },
      { label: "Grades Site-12", value: "grades", emoji: "🎖️" },
    );
  return {
    embeds: [embed],
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select), backRow(ownerId, "menu")],
  };
}

async function fetchProfileSafe(ownerId: string): Promise<PlayerProfile | null> {
  try {
    return await api.getProfileByDiscord(ownerId);
  } catch {
    return null;
  }
}

export async function renderFaction(ownerId: string): Promise<View> {
  const profile = await fetchProfileSafe(ownerId);
  if (!profile?.factionInfo) {
    return noticeView(ownerId, "🏛️ Ma faction", "Aucune faction assignée pour l'instant.", "organisation");
  }
  try {
    const detail = await api.getFaction(profile.factionInfo.slug);
    const embed = new EmbedBuilder()
      .setColor(parseHexColor(detail.color))
      .setTitle(detail.name)
      .setDescription(
        [detail.tagline, detail.description].filter(Boolean).join("\n\n").slice(0, 4000) || null,
      )
      .addFields({
        name: "Départements",
        value: detail.departments.length
          ? detail.departments.map((d) => d.name).join("\n")
          : "Aucun département référencé.",
      })
      .setFooter({ text: BRAND.footer });
    return { embeds: [embed], components: [backRow(ownerId, "organisation")] };
  } catch {
    return noticeView(
      ownerId,
      "🏛️ Ma faction",
      `**${profile.factionInfo.name}** — détails indisponibles pour le moment.`,
      "organisation",
    );
  }
}

export async function renderDepartement(ownerId: string): Promise<View> {
  const profile = await fetchProfileSafe(ownerId);
  const ref = profile?.gradeInfo?.departmentRef;
  if (!ref) {
    return noticeView(ownerId, "🏢 Mon département", "Aucun département assigné pour l'instant.", "organisation");
  }
  try {
    const detail = await api.getDepartment(ref.slug);
    const grades = detail.grades
      .slice(0, 10)
      .map((g) => `${g.name}${g.pay != null ? ` — ${g.pay.toLocaleString("fr-FR")} $` : ""}`)
      .join("\n");
    const embed = new EmbedBuilder()
      .setColor(parseHexColor(detail.color))
      .setTitle(detail.name)
      .setDescription(detail.faction ? `**Faction :** ${detail.faction.name}` : null)
      .addFields(
        ...(grades.length ? [{ name: `Grades (${detail.grades.length})`, value: grades.slice(0, 1024) }] : []),
      )
      .setFooter({ text: BRAND.footer });
    return { embeds: [embed], components: [backRow(ownerId, "organisation")] };
  } catch {
    return noticeView(
      ownerId,
      "🏢 Mon département",
      `**${ref.name}** — détails indisponibles pour le moment.`,
      "organisation",
    );
  }
}

export async function renderTeam(ownerId: string): Promise<View> {
  const profile = await fetchProfileSafe(ownerId);
  if (!profile?.teamName) {
    return noticeView(ownerId, "👥 Ma team", "Aucune équipe assignée pour l'instant.", "organisation");
  }
  const embed = new EmbedBuilder()
    .setColor(COLORS.redlake)
    .setTitle(`👥 ${profile.teamName}`)
    .setDescription(
      "Détail complet (composition, quota, chef d'équipe) pas encore disponible ici.\n\n" +
        "🚧 API GAP — `GET /teams/:id` n'existe pas encore côté CORE.",
    )
    .setFooter({ text: BRAND.footer });
  return { embeds: [embed], components: [backRow(ownerId, "organisation")] };
}

function formatGradeLine(g: GradeInfo): string {
  const pay = g.pay != null ? `${g.pay.toLocaleString("fr-FR")} $` : "—";
  const quota = g.quota != null ? `×${g.quota}` : "";
  return `${g.name} — ${pay} ${quota}`.trim();
}

function buildGradeSelect(ownerId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(hubId(ownerId, "gradesel"))
      .setPlaceholder("Filtrer par branche...")
      .addOptions(...BRANCH_CHOICES),
  );
}

export async function renderGrades(ownerId: string, branch?: string): Promise<View> {
  let catalog: GradeInfo[];
  try {
    catalog = await api.getGrades();
  } catch (err) {
    return noticeView(
      ownerId,
      "🎖️ Grades Site-12",
      err instanceof ApiError ? err.message : "Catalogue de grades indisponible.",
      "organisation",
    );
  }

  const components = [buildGradeSelect(ownerId), backRow(ownerId, "organisation")];

  if (!branch || branch === "all") {
    const omega = catalog
      .filter((g) => g.branch === "omega")
      .sort((a, b) => b.clearance - a.clearance || (b.pay ?? 0) - (a.pay ?? 0));
    const totalPayroll = catalog.reduce((sum, g) => sum + (g.pay ?? 0), 0);
    const branchCounts = BRANCH_CHOICES.filter((b) => b.value !== "all")
      .map((b) => `**${b.label}** — ${catalog.filter((g) => g.branch === b.value).length} grades`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(COLORS.redlake)
      .setTitle("🎖️ Site-12 — Hiérarchie")
      .setDescription("Choisis une branche dans le menu pour le détail.")
      .addFields(
        { name: "Conseil Oméga", value: omega.map(formatGradeLine).join("\n") || "—" },
        { name: "Branches", value: branchCounts },
        { name: "Masse salariale de référence / semaine", value: `${totalPayroll.toLocaleString("fr-FR")} $` },
      )
      .setFooter({ text: `${BRAND.footer} — ${catalog.length} grades référencés` });
    return { embeds: [embed], components };
  }

  const branchGrades = catalog
    .filter((g) => g.branch === branch)
    .sort((a, b) => b.clearance - a.clearance || (b.pay ?? 0) - (a.pay ?? 0));

  if (!branchGrades.length) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle(BRANCH_LABELS[branch] ?? branch)
      .setDescription("Aucun grade référencé pour cette branche.")
      .setFooter({ text: BRAND.footer });
    return { embeds: [embed], components };
  }

  const department = branchGrades.find((g) => g.departmentRef)?.departmentRef;
  const embed = new EmbedBuilder()
    .setColor(COLORS.redlakeGlow)
    .setTitle(BRANCH_LABELS[branch] ?? branch)
    .setDescription(department ? `**Département :** ${department.name}` : null)
    .addFields({
      name: `Grades (paye / quota) — ${branchGrades.length}`,
      value: branchGrades.map(formatGradeLine).join("\n").slice(0, 1024),
    })
    .setFooter({ text: `${BRAND.footer} — équipes/chambres personnalisables in-game` });
  return { embeds: [embed], components };
}

function buildFactionPickSelect(
  ownerId: string,
  list: FactionSummary[],
): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(hubId(ownerId, "factionpick"))
      .setPlaceholder("Choisis une faction...")
      .addOptions(
        list.slice(0, 25).map((f) => ({
          label: f.name,
          value: f.slug,
          description: f.tagline?.slice(0, 100),
        })),
      ),
  );
}

export async function renderAllFactions(ownerId: string): Promise<View> {
  let list: FactionSummary[];
  try {
    list = await api.getFactions();
  } catch (err) {
    return noticeView(ownerId, "🌐 Factions", err instanceof ApiError ? err.message : "Indisponible.");
  }
  const embed = new EmbedBuilder()
    .setColor(COLORS.redlake)
    .setTitle("🌐 REDLAKES — Factions")
    .setDescription("Choisis une faction dans le menu pour le détail.")
    .addFields(list.slice(0, 25).map((f) => ({ name: f.name, value: f.tagline ?? "—", inline: true })))
    .setFooter({ text: `${BRAND.footer} — ${list.length} factions` });
  return { embeds: [embed], components: [buildFactionPickSelect(ownerId, list), backRow(ownerId, "menu")] };
}

export async function renderFactionDetail(ownerId: string, slug: string): Promise<View> {
  try {
    const detail = await api.getFaction(slug);
    const embed = new EmbedBuilder()
      .setColor(parseHexColor(detail.color))
      .setTitle(detail.name)
      .setDescription(
        [detail.tagline, detail.description].filter(Boolean).join("\n\n").slice(0, 4000) || null,
      )
      .addFields({
        name: "Départements",
        value: detail.departments.length
          ? detail.departments.map((d) => d.name).join("\n")
          : "Aucun département référencé.",
      })
      .setFooter({ text: BRAND.footer });
    return { embeds: [embed], components: [backRow(ownerId, "allfactions")] };
  } catch (err) {
    return noticeView(
      ownerId,
      "🌐 Factions",
      err instanceof ApiError ? err.message : "Faction introuvable.",
      "allfactions",
    );
  }
}

function buildDeptPickSelect(
  ownerId: string,
  list: DepartmentSummary[],
): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(hubId(ownerId, "deptpick"))
      .setPlaceholder("Choisis un département...")
      .addOptions(
        list.slice(0, 25).map((d) => ({
          label: d.name,
          value: d.slug,
          description: d.faction?.name?.slice(0, 100),
        })),
      ),
  );
}

export async function renderAllDepartments(ownerId: string): Promise<View> {
  let list: DepartmentSummary[];
  try {
    list = await api.getDepartments();
  } catch (err) {
    return noticeView(ownerId, "🏙️ Départements", err instanceof ApiError ? err.message : "Indisponible.");
  }
  const embed = new EmbedBuilder()
    .setColor(COLORS.redlake)
    .setTitle("🏙️ REDLAKES — Départements")
    .setDescription("Choisis un département dans le menu pour le détail.")
    .addFields(
      list.slice(0, 25).map((d) => ({ name: d.name, value: d.faction ? d.faction.name : "—", inline: true })),
    )
    .setFooter({ text: `${BRAND.footer} — ${list.length} départements` });
  return { embeds: [embed], components: [buildDeptPickSelect(ownerId, list), backRow(ownerId, "menu")] };
}

export async function renderDepartmentDetail(ownerId: string, slug: string): Promise<View> {
  try {
    const detail = await api.getDepartment(slug);
    const grades = detail.grades
      .slice(0, 10)
      .map((g) => `${g.name}${g.pay != null ? ` — ${g.pay.toLocaleString("fr-FR")} $` : ""}`)
      .join("\n");
    const embed = new EmbedBuilder()
      .setColor(parseHexColor(detail.color))
      .setTitle(detail.name)
      .setDescription(detail.faction ? `**Faction :** ${detail.faction.name}` : null)
      .addFields(
        ...(grades.length ? [{ name: `Grades (${detail.grades.length})`, value: grades.slice(0, 1024) }] : []),
      )
      .setFooter({ text: BRAND.footer });
    return { embeds: [embed], components: [backRow(ownerId, "alldepartments")] };
  } catch (err) {
    return noticeView(
      ownerId,
      "🏙️ Départements",
      err instanceof ApiError ? err.message : "Département introuvable.",
      "alldepartments",
    );
  }
}
