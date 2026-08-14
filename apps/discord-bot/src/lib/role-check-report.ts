/**
 * Rapport rôles manquants vs layout officiel Site-12.
 */
import type { Guild } from "discord.js";
import { getServerRoleLayoutEntries } from "./discord-server-layout.js";
import { roleNamesMatch } from "./discord-role-catalog.js";
import { getRoleStatus } from "./role-admin.js";
import { isLayoutSeparatorName } from "./role-layout.js";
import { isStaffOrBaseRole } from "./rp-catalog.js";

export interface RoleCheckReport {
  presentSeparators: number;
  presentGrades: number;
  missingSeparators: string[];
  missingGrades: Array<{ name: string; under: string }>;
  hubTotalMissing: number;
  extraRoles: string[];
}

function findOnServer(
  roles: Map<string, { name: string }>,
  catalogName: string,
): boolean {
  for (const r of roles.values()) {
    if (r.name === catalogName || roleNamesMatch(r.name, catalogName)) return true;
  }
  return false;
}

export async function buildRoleCheckReport(guild: Guild): Promise<RoleCheckReport> {
  await guild.roles.fetch();
  const layout = getServerRoleLayoutEntries();
  const status = await getRoleStatus(guild);
  const serverRoles = guild.roles.cache;

  const missingSeparators: string[] = [];
  const missingGrades: Array<{ name: string; under: string }> = [];
  let presentSeparators = 0;
  let presentGrades = 0;
  let currentSep = "";

  for (const entry of layout) {
    if (entry.kind === "separator") {
      currentSep = entry.name;
      if (findOnServer(serverRoles, entry.name)) presentSeparators += 1;
      else missingSeparators.push(entry.name);
    } else if (findOnServer(serverRoles, entry.name)) {
      presentGrades += 1;
    } else {
      missingGrades.push({ name: entry.name, under: currentSep });
    }
  }

  const layoutNames = new Set(layout.map((e) => e.name));
  const extraRoles = [...serverRoles.values()]
    .filter(
      (r) =>
        r.id !== guild.id &&
        !r.managed &&
        !isStaffOrBaseRole(r.name) &&
        !isLayoutSeparatorName(r.name) &&
        !/^nouveau r[oô]le$/i.test(r.name),
    )
    .filter(
      (r) =>
        !layout.some((e) => e.name === r.name || roleNamesMatch(r.name, e.name)),
    )
    .map((r) => r.name)
    .slice(0, 15);

  return {
    presentSeparators,
    presentGrades,
    missingSeparators,
    missingGrades,
    hubTotalMissing: status.totalMissing,
    extraRoles,
  };
}

export function formatRoleCheckReport(report: RoleCheckReport): string {
  const lines: string[] = [
    `✅ **${report.presentSeparators}** catégories · **${report.presentGrades}** grades présents`,
    `❌ **${report.missingSeparators.length}** catégories · **${report.missingGrades.length}** grades manquants`,
  ];

  if (report.missingSeparators.length) {
    lines.push("\n**Catégories à créer** (`/roles-organize` les crée) :");
    for (const n of report.missingSeparators.slice(0, 6)) {
      lines.push(`• ${n}`);
    }
    if (report.missingSeparators.length > 6) {
      lines.push(`… +${report.missingSeparators.length - 6}`);
    }
  }

  if (report.missingGrades.length) {
    lines.push("\n**Grades à créer à la main** (extraits) :");
    for (const g of report.missingGrades.slice(0, 8)) {
      lines.push(`• ${g.name}`);
    }
    if (report.missingGrades.length > 8) {
      lines.push(`… +${report.missingGrades.length - 8} autre(s)`);
    }
  }

  if (report.extraRoles.length) {
    lines.push(`\n**${report.extraRoles.length}+ rôle(s) hors catalogue** (custom/staff)`);
  }

  lines.push("\n💡 Lance `/roles-organize` après avoir créé les grades.");
  return lines.join("\n");
}
