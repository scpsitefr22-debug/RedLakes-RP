import type { Guild } from "discord.js";
import { config } from "../config.js";
import { refreshRoleRegistry } from "./discord-role-registry.js";
import {
  organizeRolesUnderParsedList,
  type OrganizeResult,
} from "./organize-rp-roles.js";
import {
  parseRoleListText,
  summarizeParsedList,
  describeRoleListParse,
  looksLikeRoleList,
  normalizeRoleListText,
  type ParsedRoleEntry,
} from "./role-list-parser.js";
import { roleNamesMatch, lookupCatalogRole } from "./discord-role-catalog.js";
import { getBranchColor, type BranchId } from "./role-layout.js";
import { inferRpRoleStyle, type RpRoleStyle } from "./role-style.js";
import { isLayoutSeparatorName } from "./role-layout.js";

const DISCORD_API = "https://discord.com/api/v10";
const CREATE_GAP_MS = 1500;

function formatWait(sec: number): string {
  if (sec >= 120) return `~${Math.ceil(sec / 60)} min`;
  return `~${Math.ceil(sec)} s`;
}

let importInProgress = false;

export interface ImportRolesResult {
  parsed: ParsedRoleEntry[];
  created: string[];
  skipped: string[];
  errors: string[];
  missing: string[];
  organized: OrganizeResult | null;
  createMode: boolean;
}

export interface ImportProgress {
  phase: "create" | "organize" | "done" | "rate-limit";
  total: number;
  done: number;
  created: number;
  skipped: number;
  errors: number;
  current?: string;
  rateLimitSec?: number;
}

export type ImportProgressCallback = (p: ImportProgress) => void | Promise<void>;

export function enrichParsedEntries(entries: ParsedRoleEntry[]): ParsedRoleEntry[] {
  return entries.map((entry) => {
    if (entry.kind !== "grade") return entry;
    const catalog = lookupCatalogRole(entry.name);
    if (!catalog) return entry;
    return {
      ...entry,
      name: catalog.displayName,
      branch: catalog.branch,
      mentionable: catalog.mentionable,
    };
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function findRoleByName(guild: Guild, name: string) {
  const exact = guild.roles.cache.find((r) => r.name === name);
  if (exact) return exact;
  return guild.roles.cache.find((r) => roleNamesMatch(r.name, name));
}

async function createRoleViaApi(
  guildId: string,
  displayName: string,
  color: number,
  style: RpRoleStyle,
  mentionable?: boolean,
  onRateLimit?: (sec: number) => void | Promise<void>,
): Promise<boolean> {
  const body = {
    name: displayName.slice(0, 100),
    color,
    hoist: style.hoist,
    mentionable: mentionable ?? style.mentionable,
    permissions: "0",
  };

  for (let attempt = 0; attempt < 25; attempt++) {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/roles`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      const data = (await res.json().catch(() => ({}))) as {
        retry_after?: number;
      };
      const sec = data.retry_after ?? 2;
      const wait = Math.ceil(sec * 1000) + 300;
      console.log(
        `[roles-import] Rate limit Discord — pause ${formatWait(sec)} (${Math.round(wait / 1000)}s)`,
      );
      if (onRateLimit) await onRateLimit(sec);
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(
        `[roles-import] API ${res.status} "${displayName}" : ${errText.slice(0, 120)}`,
      );
      return false;
    }

    return true;
  }

  return false;
}

function countMissingGrades(
  guild: Guild,
  parsed: ParsedRoleEntry[],
): number {
  return parsed.filter(
    (e) => e.kind === "grade" && !findRoleByName(guild, e.name),
  ).length;
}

/**
 * Crée les grades manquants depuis une liste collée, puis les range
 * sous les catégories DÉJÀ présentes (sans déplacer les séparateurs).
 */
export async function importRolesFromText(
  guild: Guild,
  text: string,
  options?: {
    organize?: boolean;
    create?: boolean;
    onProgress?: ImportProgressCallback;
  },
): Promise<ImportRolesResult> {
  if (importInProgress) {
    throw new Error(
      "Un import est déjà en cours — attends qu'il se termine avant de relancer.",
    );
  }

  importInProgress = true;

  try {
    await guild.roles.fetch();

    const parsed = enrichParsedEntries(parseRoleListText(normalizeRoleListText(text)));
    const summary = summarizeParsedList(parsed);
    const grades = parsed.filter((e) => e.kind === "grade");
    const created: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];
    const missingRoles: string[] = [];
    const style = inferRpRoleStyle(guild);
    const shouldCreate = options?.create === true;

    const missing = countMissingGrades(guild, parsed);
    console.log(
      `[roles-import] ${summary.grades} grade(s), ${summary.separators} séparateur(s), ${missing} manquant(s)` +
        (shouldCreate ? " [création API]" : " [rangement seul]"),
    );

    const report = async (partial: Partial<ImportProgress>) => {
      if (!options?.onProgress) return;
      await options.onProgress({
        phase: "create",
        total: grades.length,
        done: created.length + skipped.length + errors.length + missingRoles.length,
        created: created.length,
        skipped: skipped.length,
        errors: errors.length,
        ...partial,
      });
    };

    if (shouldCreate) {
      await report({ phase: "create", done: 0, current: "démarrage…" });

      const onRateLimit = async (sec: number) => {
        await report({
          phase: "rate-limit",
          done: created.length + skipped.length + errors.length,
          current: `pause Discord ${formatWait(sec)}`,
          rateLimitSec: sec,
        });
      };

      for (let i = 0; i < grades.length; i++) {
        const entry = grades[i]!;

        if (findRoleByName(guild, entry.name)) {
          skipped.push(entry.name);
        } else {
          const ok = await createRoleViaApi(
            guild.id,
            entry.name,
            getBranchColor(entry.branch ?? "general"),
            style,
            entry.mentionable,
            onRateLimit,
          );

          if (ok) {
            created.push(entry.name);
            console.log(`[roles-import] ${created.length}/${missing} créé : ${entry.name}`);
            await sleep(CREATE_GAP_MS);
            if (created.length % 5 === 0) {
              await guild.roles.fetch().catch(() => undefined);
            }
          } else {
            errors.push(entry.name);
          }
        }

        await report({ done: i + 1, current: entry.name });
      }
    } else {
      for (const entry of grades) {
        if (findRoleByName(guild, entry.name)) {
          skipped.push(entry.name);
        } else {
          missingRoles.push(entry.name);
        }
      }
      console.log(
        `[roles-import] Rangement seul — ${skipped.length} trouvé(s), ${missingRoles.length} absent(s)`,
      );
    }

    await guild.roles.fetch();
    await refreshRoleRegistry(guild, {
      ensureMissing: false,
      organize: false,
    });

    let organized: OrganizeResult | null = null;
    if (options?.organize !== false && parsed.length) {
      await report({ phase: "organize", done: grades.length, current: "rangement…" });
      organized = await organizeRolesUnderParsedList(guild, parsed);
    }

    await report({ phase: "done", done: grades.length });

    return {
      parsed,
      created,
      skipped,
      errors,
      missing: missingRoles,
      organized,
      createMode: shouldCreate,
    };
  } finally {
    importInProgress = false;
  }
}

export function formatImportPreview(
  parsed: ParsedRoleEntry[],
  missing: number,
  createMode: boolean,
): string {
  const summary = summarizeParsedList(parsed);
  if (!createMode) {
    return (
      `**Mode rapide** — rangement seul (pas de création API)\n` +
      `**${summary.grades}** grade(s) · **${missing}** absent(s) du serveur · **${summary.separators}** catégorie(s)\n` +
      `⏳ Quelques secondes…`
    );
  }
  const etaMin = Math.max(1, Math.ceil((missing * 1) / 60));
  return (
    `**${summary.grades}** grade(s) · **${missing}** à créer via API · **${summary.separators}** catégorie(s)\n` +
    `⏳ ~${etaMin} min+ (rate limit Discord) — préfère créer à la main sans \`creer:true\``
  );
}

export function formatImportProgress(p: ImportProgress): string {
  if (p.phase === "rate-limit") {
    const wait = p.rateLimitSec ? formatWait(p.rateLimitSec) : "quelques minutes";
    return (
      `⏸️ **Pause Discord** (rate limit) — attente ${wait}\n` +
      `Progression : ${p.done}/${p.total} · ✅ ${p.created} créé(s)\n` +
      `💡 Normal après beaucoup de créations — le bot reprend tout seul.`
    );
  }
  if (p.phase === "organize") {
    return (
      `⏳ **Rangement** sous tes catégories…\n` +
      `✅ ${p.created} créé(s) · ⏭️ ${p.skipped} déjà là · ❌ ${p.errors} erreur(s)`
    );
  }
  if (p.phase === "done") return "⏳ Finalisation…";

  const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
  return (
    `⏳ **Import** — ${p.done}/${p.total} (${pct}%)\n` +
    `✅ ${p.created} créé(s) · ⏭️ ${p.skipped} déjà là · ❌ ${p.errors} erreur(s)` +
    (p.current ? `\n📌 ${p.current}` : "")
  );
}

export function formatImportResult(result: ImportRolesResult): string {
  const { parsed, created, skipped, errors, missing, organized, createMode } =
    result;
  const summary = summarizeParsedList(parsed);

  const lines: string[] = [];

  if (!createMode) {
    lines.push(`✅ **Rangement terminé** — ${summary.grades} grade(s) traités.`);
    lines.push(`🔗 **${skipped.length}** rôle(s) rangé(s) sous tes catégories.`);
    if (missing.length) {
      lines.push(
        `📝 **${missing.length}** pas encore sur le serveur — crée-les **à la main** dans Discord, puis relance sans \`creer\`.`,
      );
      lines.push(`Ex. manquants : ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? "…" : ""}`);
    }
    if (organized) {
      lines.push(`🔧 Positions mises à jour : **${organized.positioned}** rôle(s).`);
      if (organized.newSeparators.length) {
        lines.push(
          `🆕 Catégories créées : ${organized.newSeparators.slice(0, 4).join(", ")}${organized.newSeparators.length > 4 ? "…" : ""}`,
        );
      }
    }
    return lines.join("\n");
  }

  lines.push(`✅ **Import terminé** — ${summary.grades} grade(s) traités.`);
  lines.push(
    created.length
      ? `🆕 **${created.length}** créé(s) : ${created.slice(0, 6).join(", ")}${created.length > 6 ? ` (+${created.length - 6})` : ""}`
      : "🆕 Aucun nouveau rôle (tout existait déjà).",
  );

  if (skipped.length) {
    lines.push(`⏭️ **${skipped.length}** déjà présent(s).`);
  }
  if (errors.length) {
    lines.push(
      `❌ **${errors.length}** échec(s) : ${errors.slice(0, 4).join(", ")}${errors.length > 4 ? "…" : ""}`,
    );
    lines.push(
      "💡 Place le rôle **Redlake** au-dessus des grades RP dans la hiérarchie.",
    );
  }
  if (organized) {
    lines.push(
      `🔧 **${organized.positioned}** rôle(s) rangé(s) sous tes catégories.`,
    );
    if (organized.newSeparators.length) {
      lines.push(
        `🆕 **${organized.newSeparators.length}** catégorie(s) créée(s).`,
      );
    }
  }

  return lines.join("\n");
}

export function previewImportList(
  guild: Guild,
  text: string,
): { parsed: ParsedRoleEntry[]; missing: number } {
  const parsed = enrichParsedEntries(parseRoleListText(normalizeRoleListText(text)));
  return { parsed, missing: countMissingGrades(guild, parsed) };
}

export function mergeModalParts(
  fields: Record<string, string | undefined>,
): string {
  return ["part1", "part2", "part3", "part4"]
    .map((k) => fields[k]?.trim() ?? "")
    .filter(Boolean)
    .join("\n");
}

export { looksLikeRoleList, describeRoleListParse } from "./role-list-parser.js";
