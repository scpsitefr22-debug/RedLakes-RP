"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  GripVertical,
  RotateCcw,
  Save,
  Undo2,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { accessZones } from "@/data/site12";
import { SITE_SECTION_LABELS } from "@/lib/grade-access";
import { CLEARANCE_LABELS, clearanceBadgeClass } from "@/lib/clearance";
import { BRANCH_LABELS, BRANCH_ORDER, type ApiGrade } from "@/lib/grade-labels";

type Grade = ApiGrade & {
  updatedAt: string;
  sortOrder: number;
  archivedAt: string | null;
  _count?: { players: number };
};

interface Draft {
  accessZones: string[];
  siteSections: string[];
  utilities: string[];
  clearanceLevel: number;
  pay: number | null;
  quota: number | null;
  branch: string;
  sortOrder: number;
  archived: boolean;
}

type ListField = "accessZones" | "siteSections";
type View = "hierarchie" | "zones" | "sections" | "fiche";

interface Column {
  id: string;
  label: string;
  title: string;
}

const ZONE_COLUMNS: Column[] = accessZones.map((z) => ({
  id: z.id,
  label: z.label,
  title: `${z.label} — ${z.description}`,
}));
const SECTION_COLUMNS: Column[] = Object.entries(SITE_SECTION_LABELS).map(([id, label]) => ({
  id,
  label,
  title: label,
}));
const ZONE_IDS = ZONE_COLUMNS.map((c) => c.id);
const SECTION_IDS = SECTION_COLUMNS.map((c) => c.id);
const ZONE_LABEL = new Map(ZONE_COLUMNS.map((c) => [c.id, c.label]));
const SECTION_LABEL = new Map(SECTION_COLUMNS.map((c) => [c.id, c.label]));

// Anciennes saisies libres ("O5", "W.H.") ramenées au code de leur colonne.
const ZONE_ALIASES = new Map<string, string>(
  accessZones.flatMap((z) => [
    [z.id, z.id],
    [z.label.toLowerCase(), z.id],
  ]),
);

const VIEWS: { id: View; label: string; help: string }[] = [
  {
    id: "hierarchie",
    label: "Hiérarchie & métiers",
    help: "Glisse un grade, ou utilise les flèches, pour changer sa place : le plus haut est le plus gradé. « Déplacer vers… » l'envoie dans une autre branche, avec le département de celle-ci. « Retirer » enlève un métier du site sans rien effacer : tu peux le remettre quand tu veux.",
  },
  {
    id: "zones",
    label: "Zones du site",
    help: "La référence de qui entre où sur le Site-12 (les colonnes de ton tableau, de W.H. à Maint.). Affichées sur le site et envoyées au serveur Minecraft. En jeu, les portes restent gérées par les cartes d'accès du mod SCP.",
  },
  {
    id: "sections",
    label: "Sections du site",
    help: "Les onglets de l'intranet que le joueur voit avec ce grade.",
  },
  {
    id: "fiche",
    label: "Habilitation, salaire & domaines",
    help: "L'habilitation (1 à 5) décide quels documents et rapports classifiés le joueur peut lire, et la couleur de son nom en jeu. Les domaines (ex. Nuke) s'affichent sur la fiche du grade.",
  },
];

function normalizeCodes(codes: string[], ids: string[], aliases?: Map<string, string>): string[] {
  const wanted = new Set(codes.map((c) => aliases?.get(c.trim().toLowerCase()) ?? c.trim()));
  return ids.filter((id) => wanted.has(id));
}

function baselineOf(g: Grade): Draft {
  return {
    accessZones: normalizeCodes(g.accessZones, ZONE_IDS, ZONE_ALIASES),
    siteSections: normalizeCodes(g.siteSections, SECTION_IDS),
    utilities: g.utilities,
    clearanceLevel: g.clearanceLevel,
    pay: g.pay,
    quota: g.quota,
    branch: g.branch,
    sortOrder: g.sortOrder,
    archived: Boolean(g.archivedAt),
  };
}

function listDiff(label: string, before: string[], after: string[], names?: Map<string, string>) {
  const added = after.filter((x) => !before.includes(x));
  const removed = before.filter((x) => !after.includes(x));
  if (!added.length && !removed.length) return null;
  const name = (x: string) => names?.get(x) ?? x;
  return `${label} : ${[...added.map((x) => `+${name(x)}`), ...removed.map((x) => `−${name(x)}`)].join(", ")}`;
}

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

/** Le grade a-t-il quelque chose à enregistrer (y compris sa place) ? */
function differs(a: Draft, b: Draft): boolean {
  return (
    !sameList(a.accessZones, b.accessZones) ||
    !sameList(a.siteSections, b.siteSections) ||
    !sameSet(a.utilities, b.utilities) ||
    a.clearanceLevel !== b.clearanceLevel ||
    a.pay !== b.pay ||
    a.quota !== b.quota ||
    a.branch !== b.branch ||
    a.sortOrder !== b.sortOrder ||
    a.archived !== b.archived
  );
}

/**
 * Grades vraiment déplacés entre deux ordres : ceux qui sortent de la plus
 * longue suite restée dans le même ordre (même règle que le journal côté API).
 */
function movedInOrder(before: string[], after: string[]): string[] {
  const common = after.filter((id) => before.includes(id));
  const positions = common.map((id) => before.indexOf(id));
  const length = positions.map(() => 1);
  const previous = positions.map(() => -1);
  for (let i = 0; i < positions.length; i++) {
    for (let j = 0; j < i; j++) {
      if (positions[j] < positions[i] && length[j] + 1 > length[i]) {
        length[i] = length[j] + 1;
        previous[i] = j;
      }
    }
  }
  const kept = new Set<string>();
  let k = length.indexOf(Math.max(0, ...length));
  while (k !== -1) {
    kept.add(common[k]);
    k = previous[k];
  }
  return common.filter((id) => !kept.has(id));
}

const rank = (n: number) => (n === 1 ? "1er" : `${n}e`);
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;
// Espace fine insécable de toLocaleString remplacée par une espace insécable classique,
// que toutes les polices du site affichent.
const formatPay = (n: number) => n.toLocaleString("fr-FR").replace(/\u202f/g, "\u00a0");
const holdersLabel = (n: number) => (n === 0 ? "aucun personnage" : plural(n, "personnage"));

function withCode(list: string[], code: string, ids: string[], on: boolean): string[] {
  if (list.includes(code) === on) return list;
  return on ? ids.filter((id) => id === code || list.includes(id)) : list.filter((c) => c !== code);
}

function parseAmount(raw: string): number | null | undefined {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
}

const inputClass =
  "rounded border border-metal bg-black px-2 py-1.5 text-sm text-white outline-none focus:border-redlake";
const iconButton =
  "flex h-8 w-8 items-center justify-center rounded border border-metal/60 text-gray-400 hover:border-gray-400 hover:text-white disabled:opacity-30";

/** Le grade tel qu'on le lit dans toutes les vues : rang dans la branche, nom, niveau d'habilitation. */
function RowLabel({ grade, position, clearance }: { grade: Grade; position: number; clearance: number }) {
  return (
    <span className="flex items-center gap-2">
      <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-gray-500">{rank(position)}</span>
      <span className="min-w-0 flex-1 text-sm font-medium leading-tight text-white">
        {grade.name}
        <Link
          href={`/staff/grades/${grade.id}`}
          target="_blank"
          title="Ouvrir la fiche complète (nom, description, missions) dans un nouvel onglet"
          className="ml-1.5 inline-block align-middle text-gray-600 hover:text-redlake-glow"
        >
          <ExternalLink className="h-3 w-3" />
        </Link>
      </span>
      <span
        className={`shrink-0 rounded border px-1.5 py-px font-mono text-[10px] ${clearanceBadgeClass(clearance)}`}
        title={CLEARANCE_LABELS[Math.min(5, Math.max(1, clearance)) as keyof typeof CLEARANCE_LABELS]}
      >
        Hab. {clearance}
      </span>
    </span>
  );
}

/**
 * Grille grade × colonne. Les titres de colonnes et les noms de grades
 * restent visibles pendant le défilement (le tableau défile dans son propre
 * cadre), une ligne sur deux est teintée comme dans le tableau Excel, et la
 * ligne et la colonne survolées s'éclairent pour suivre une case du regard.
 */
function AccessMatrix({
  rows,
  columns,
  vertical,
  clearanceOf,
  isOn,
  isChanged,
  onToggle,
  onToggleColumn,
}: {
  rows: Grade[];
  columns: Column[];
  vertical?: boolean;
  clearanceOf: (g: Grade) => number;
  isOn: (g: Grade, col: string) => boolean;
  isChanged: (g: Grade, col: string) => boolean;
  onToggle: (g: Grade, col: string) => void;
  onToggleColumn: (col: string) => void;
}) {
  const [hoverCol, setHoverCol] = useState<string | null>(null);
  return (
    <div
      className="max-h-[72vh] overflow-auto rounded-lg border border-metal/60"
      onMouseLeave={() => setHoverCol(null)}
    >
      <table className="border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-30 min-w-72 border-b border-r border-metal/60 bg-background px-3 py-2 text-left align-bottom font-mono text-[11px] font-normal uppercase tracking-widest text-gray-400">
              Grade
            </th>
            {columns.map((col) => (
              <th
                key={col.id}
                className={`sticky top-0 z-20 border-b border-r border-metal/40 p-0 align-bottom ${
                  hoverCol === col.id ? "bg-[#1a1a1d]" : "bg-background"
                } ${vertical ? "h-40" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => onToggleColumn(col.id)}
                  onMouseEnter={() => setHoverCol(col.id)}
                  title={`${col.title} — cliquer pour donner ou retirer à toute la branche`}
                  className={`flex h-full w-full items-end justify-center px-1.5 py-2 font-mono text-xs hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-redlake-glow ${
                    hoverCol === col.id ? "text-white" : "text-gray-300"
                  }`}
                >
                  <span
                    className="whitespace-nowrap"
                    style={vertical ? { writingMode: "vertical-rl", transform: "rotate(180deg)" } : undefined}
                  >
                    {col.label}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((g, index) => {
            const striped = index % 2 === 1;
            return (
              <tr key={g.id} className="group">
                <th
                  scope="row"
                  className={`sticky left-0 z-10 border-b border-r border-metal/60 px-2 py-1.5 text-left font-normal group-hover:bg-[#1a1a1d] ${
                    striped ? "bg-[#111114]" : "bg-background"
                  }`}
                >
                  <RowLabel grade={g} position={index + 1} clearance={clearanceOf(g)} />
                </th>
                {columns.map((col) => {
                  const on = isOn(g, col.id);
                  const changed = isChanged(g, col.id);
                  const lit = hoverCol === col.id;
                  return (
                    <td
                      key={col.id}
                      className="border-b border-r border-metal/30 p-0"
                      onMouseEnter={() => setHoverCol(col.id)}
                    >
                      <button
                        type="button"
                        aria-pressed={on}
                        aria-label={`${g.name} — ${col.label} : ${on ? "accès" : "pas d'accès"}`}
                        title={`${g.name} — ${col.title} : ${on ? "accès" : "pas d'accès"}${changed ? " (modifié, pas encore enregistré)" : ""}`}
                        onClick={() => onToggle(g, col.id)}
                        className={`flex h-9 w-full min-w-10 items-center justify-center transition-[filter,background-color] group-hover:brightness-150 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-redlake-glow ${
                          on
                            ? `${striped ? "bg-emerald-500/25" : "bg-emerald-500/20"} text-emerald-300`
                            : striped
                              ? "bg-red-950/45"
                              : "bg-red-950/25"
                        } ${lit ? "brightness-150" : ""} ${changed ? "ring-2 ring-inset ring-amber-400" : ""}`}
                      >
                        {on && <Check className="h-4 w-4" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DomainsEditor({
  value,
  onChange,
  changed,
  label,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  changed: boolean;
  label: string;
}) {
  const [text, setText] = useState("");
  const add = () => {
    const v = text.trim().slice(0, 40);
    if (v && !value.includes(v) && value.length < 20) onChange([...value, v]);
    setText("");
  };
  return (
    <div className={`flex flex-wrap items-center gap-1.5 rounded p-1 ${changed ? "ring-2 ring-amber-400" : ""}`}>
      {value.map((u) => (
        <span
          key={u}
          className="inline-flex items-center gap-1 rounded border border-metal/60 bg-white/5 px-2 py-0.5 text-xs text-gray-200"
        >
          {u}
          <button
            type="button"
            onClick={() => onChange(value.filter((x) => x !== u))}
            aria-label={`Retirer ${u} des domaines de ${label}`}
            className="text-gray-500 hover:text-red-400"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={text}
        list="domaines-connus"
        maxLength={40}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder="Ajouter…"
        aria-label={`Ajouter un domaine à ${label}`}
        className="w-28 bg-transparent px-1 py-0.5 text-xs text-white outline-none placeholder:text-gray-600"
      />
    </div>
  );
}

export default function GradeAccessGridPage() {
  const [grades, setGrades] = useState<Grade[] | null>(null);
  const [factionNames, setFactionNames] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [branch, setBranch] = useState("securite");
  const [view, setView] = useState<View>("hierarchie");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [copyFrom, setCopyFrom] = useState("");
  const [copyTo, setCopyTo] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, factions] = await Promise.all([
        apiFetch<Grade[]>("/grades/manage"),
        apiFetch<{ slug: string; name: string }[]>("/factions").catch(() => []),
      ]);
      setLoadError("");
      setGrades(list);
      setFactionNames(Object.fromEntries(factions.map((f) => [f.slug, f.name])));
      setDrafts({});
    } catch (err) {
      setLoadError(
        err instanceof Error && /refus|rang|autoris/i.test(err.message)
          ? `${err.message} — cette page est réservée au Fondateur et aux Coordinateurs généraux.`
          : "Impossible de charger les grades : l'API ne répond pas. Réessaie dans quelques secondes.",
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const branchLabel = useCallback(
    (b: string) => BRANCH_LABELS[b] ?? factionNames[b] ?? b.charAt(0).toUpperCase() + b.slice(1),
    [factionNames],
  );

  const byId = useMemo(() => new Map((grades ?? []).map((g) => [g.id, g])), [grades]);
  const baselines = useMemo(
    () => new Map((grades ?? []).map((g) => [g.id, baselineOf(g)])),
    [grades],
  );
  const current = useCallback(
    (g: Grade): Draft => drafts[g.id] ?? baselines.get(g.id) ?? baselineOf(g),
    [drafts, baselines],
  );
  const edit = useCallback(
    (g: Grade, change: (d: Draft) => Draft) =>
      setDrafts((prev) => ({ ...prev, [g.id]: change(prev[g.id] ?? baselines.get(g.id) ?? baselineOf(g)) })),
    [baselines],
  );

  /** Grades en service d'une branche, du plus haut au plus bas (version enregistrée ou en cours). */
  const sequence = useCallback(
    (b: string, state: "saved" | "draft"): Grade[] =>
      (grades ?? [])
        .map((g) => ({ g, d: state === "saved" ? baselines.get(g.id)! : current(g) }))
        .filter(({ d }) => d.branch === b && !d.archived)
        .sort((x, y) => x.d.sortOrder - y.d.sortOrder || x.g.name.localeCompare(y.g.name, "fr"))
        .map(({ g }) => g),
    [grades, baselines, current],
  );

  const allBranches = useMemo(() => {
    const present = new Set<string>();
    for (const g of grades ?? []) present.add(current(g).branch);
    const site = BRANCH_ORDER.filter((b) => present.has(b));
    const others = [...present]
      .filter((b) => !BRANCH_ORDER.includes(b))
      .sort((a, b) => branchLabel(a).localeCompare(branchLabel(b), "fr"));
    return { site, others, all: [...site, ...others] };
  }, [grades, current, branchLabel]);

  const rows = useMemo(() => sequence(branch, "draft"), [sequence, branch]);
  const retiredRows = useMemo(
    () => (grades ?? []).filter((g) => current(g).branch === branch && current(g).archived),
    [grades, current, branch],
  );
  const activeCount = useCallback((b: string) => sequence(b, "draft").length, [sequence]);

  // Ce qui partira à l'enregistrement, et sa lecture en clair.
  const dirty = useMemo(
    () => (grades ?? []).filter((g) => drafts[g.id] && differs(baselines.get(g.id)!, drafts[g.id])),
    [grades, drafts, baselines],
  );
  const pendingLines = useMemo(() => {
    const lines: { key: string; branch: string; title: string; text: string }[] = [];
    for (const g of dirty) {
      const before = baselines.get(g.id)!;
      const after = current(g);
      const holders = g._count?.players ?? 0;
      const amount = (v: number | null) => (v === null ? "aucun" : formatPay(v));
      const parts = [
        !before.archived && after.archived
          ? `Retiré du site${holders ? ` (${plural(holders, "personnage")} le ${holders > 1 ? "gardent" : "garde"})` : ""}`
          : null,
        before.archived && !after.archived ? "Remis sur le site" : null,
        before.branch !== after.branch
          ? `Branche : ${branchLabel(before.branch)} → ${branchLabel(after.branch)}`
          : null,
        listDiff("Zones", before.accessZones, after.accessZones, ZONE_LABEL),
        listDiff("Sections", before.siteSections, after.siteSections, SECTION_LABEL),
        listDiff("Domaines", before.utilities, after.utilities),
        before.clearanceLevel !== after.clearanceLevel
          ? `Habilitation : ${before.clearanceLevel} → ${after.clearanceLevel}`
          : null,
        before.pay !== after.pay ? `Salaire : ${amount(before.pay)} → ${amount(after.pay)}` : null,
        before.quota !== after.quota ? `Quota : ${amount(before.quota)} → ${amount(after.quota)}` : null,
      ].filter((p): p is string => p !== null);
      if (parts.length) {
        lines.push({ key: g.id, branch: after.branch, title: g.name, text: parts.join(" ; ") });
      }
    }
    for (const b of allBranches.all) {
      const before = sequence(b, "saved").map((g) => g.id);
      const after = sequence(b, "draft").map((g) => g.id);
      for (const id of movedInOrder(before, after)) {
        lines.push({
          key: `${b}:${id}`,
          branch: b,
          title: `Hiérarchie ${branchLabel(b)}`,
          text: `${byId.get(id)!.name} : ${rank(before.indexOf(id) + 1)} → ${rank(after.indexOf(id) + 1)}`,
        });
      }
    }
    return lines;
  }, [dirty, baselines, current, branchLabel, allBranches, sequence, byId]);
  const pendingBranches = useMemo(() => new Set(pendingLines.map((l) => l.branch)), [pendingLines]);
  const movedHere = useMemo(() => {
    const before = sequence(branch, "saved").map((g) => g.id);
    return new Set(movedInOrder(before, rows.map((g) => g.id)));
  }, [sequence, branch, rows]);

  /** Un grade qui gagne plus que celui placé juste au-dessus de lui : souvent un oubli ou une erreur d'import. */
  const payNotes = useMemo(() => {
    const notes = new Map<string, string>();
    let above: { name: string; pay: number } | null = null;
    for (const g of rows) {
      const pay = current(g).pay;
      if (pay === null) continue;
      if (above && pay > above.pay) {
        notes.set(g.id, `Gagne plus que ${above.name} (${formatPay(above.pay)}), placé au-dessus`);
      }
      above = { name: g.name, pay };
    }
    return notes;
  }, [rows, current]);

  useEffect(() => {
    if (!dirty.length) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty.length]);

  // ── Hiérarchie ────────────────────────────────────────────────────────
  const applyOrder = (b: string, ids: string[]) => {
    const saved = sequence(b, "saved").map((g) => g.id);
    const backToSaved = sameList(ids, saved);
    setDrafts((prev) => {
      const next = { ...prev };
      ids.forEach((id, i) => {
        const base = baselines.get(id)!;
        const d = next[id] ?? base;
        next[id] = { ...d, sortOrder: backToSaved ? base.sortOrder : i + 1 };
      });
      return next;
    });
  };

  /** Place le grade `id` à l'index `target` de la liste actuelle (avant retrait). */
  const moveTo = (id: string, target: number) => {
    const ids = rows.map((g) => g.id);
    const from = ids.indexOf(id);
    if (from === -1) return;
    ids.splice(from, 1);
    const at = Math.max(0, Math.min(ids.length, target > from ? target - 1 : target));
    ids.splice(at, 0, id);
    applyOrder(branch, ids);
  };

  const bottomOf = (b: string) =>
    Math.max(0, ...sequence(b, "draft").map((g) => current(g).sortOrder)) + 1;

  const moveToBranch = (g: Grade, target: string) => {
    if (!target) return;
    const base = baselines.get(g.id)!;
    edit(g, (d) => ({
      ...d,
      branch: target,
      sortOrder: target === base.branch && !base.archived ? base.sortOrder : bottomOf(target),
    }));
  };

  const retire = (g: Grade) => edit(g, (d) => ({ ...d, archived: true }));
  const restore = (g: Grade) => {
    const base = baselines.get(g.id)!;
    edit(g, (d) => ({
      ...d,
      archived: false,
      sortOrder: !base.archived && d.branch === base.branch ? base.sortOrder : bottomOf(d.branch),
    }));
  };

  // ── Grilles ───────────────────────────────────────────────────────────
  const field: ListField = view === "sections" ? "siteSections" : "accessZones";
  const ids = field === "accessZones" ? ZONE_IDS : SECTION_IDS;

  const toggle = (g: Grade, code: string) =>
    edit(g, (d) => ({ ...d, [field]: withCode(d[field], code, ids, !d[field].includes(code)) }));

  const toggleColumn = (code: string) => {
    const giveAll = !rows.every((g) => current(g)[field].includes(code));
    for (const g of rows) edit(g, (d) => ({ ...d, [field]: withCode(d[field], code, ids, giveAll) }));
  };

  const copy = () => {
    const source = grades?.find((g) => g.id === copyFrom);
    const target = rows.find((g) => g.id === copyTo);
    if (!source || !target || source.id === target.id) return;
    const codes = [...current(source)[field]];
    edit(target, (d) => ({ ...d, [field]: codes }));
  };

  const save = async () => {
    setSaving(true);
    setNotice(null);
    // Une place changée renumérote toute la branche : on annonce les changements, pas les lignes écrites.
    const changeCount = Math.max(pendingLines.length, 1);
    try {
      const updated = await apiFetch<Grade[]>("/grades/access", {
        method: "PATCH",
        body: JSON.stringify({
          changes: dirty.map((g) => ({ id: g.id, updatedAt: g.updatedAt, ...current(g) })),
        }),
      });
      const fresh = new Map(updated.map((g) => [g.id, g]));
      setGrades((prev) => prev?.map((g) => (fresh.has(g.id) ? { ...g, ...fresh.get(g.id)! } : g)) ?? prev);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const g of updated) delete next[g.id];
        return next;
      });
      setShowDetail(false);
      setNotice({
        ok: true,
        text: `Enregistré : ${plural(changeCount, "changement")}. Les joueurs les voient dès leur prochain chargement de page.`,
      });
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : "L'enregistrement a échoué." });
    } finally {
      setSaving(false);
    }
  };

  const discardAll = () => {
    if (confirm("Annuler tous les changements non enregistrés ?")) setDrafts({});
  };

  const knownDomains = useMemo(
    () => [...new Set((grades ?? []).flatMap((g) => g.utilities))].sort((a, b) => a.localeCompare(b, "fr")),
    [grades],
  );

  const activeView = VIEWS.find((v) => v.id === view)!;
  const tabClass = (active: boolean) =>
    `rounded border px-3 py-1.5 font-mono text-xs transition-colors ${
      active ? "border-redlake bg-redlake/15 text-white" : "border-metal/60 text-gray-400 hover:border-metal hover:text-white"
    }`;

  const branchTab = (b: string) => (
    <button key={b} type="button" aria-pressed={branch === b} onClick={() => setBranch(b)} className={tabClass(branch === b)}>
      {branchLabel(b)} <span className="text-gray-500">({activeCount(b)})</span>
      {pendingBranches.has(b) && (
        <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-400 align-middle" title="Changements non enregistrés" />
      )}
    </button>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-40 pt-20">
      <Link
        href="/staff/grades"
        onClick={(e) => {
          if (dirty.length && !confirm("Tes changements non enregistrés seront perdus. Quitter quand même ?")) {
            e.preventDefault();
          }
        }}
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Gestion des grades
      </Link>

      <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">ADMINISTRATION SITE-12 — HIÉRARCHIE ET ACCÈS</p>
      <h1 className="text-4xl font-bold text-white">Grades &amp; accès</h1>
      <p className="mt-3 max-w-3xl text-gray-400">
        Choisis une branche. Range ses grades dans l&apos;ordre de la hiérarchie, retire les métiers qui ne
        servent à rien, puis décide ce que chaque grade peut ouvrir. Rien n&apos;est appliqué tant que tu
        n&apos;as pas cliqué sur « Enregistrer ».
      </p>

      {loadError && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          {loadError}
          <button
            type="button"
            onClick={() => {
              setLoadError("");
              void load();
            }}
            className="rounded border border-red-400/40 px-3 py-1 text-xs hover:bg-red-400/10"
          >
            Réessayer
          </button>
        </div>
      )}
      {!grades && !loadError && <p className="mt-8 text-gray-500">Chargement des grades…</p>}

      {grades && (
        <>
          <div className="mt-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-24 font-mono text-[10px] uppercase tracking-widest text-gray-500">Site-12</span>
              {allBranches.site.map(branchTab)}
            </div>
            {allBranches.others.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-24 font-mono text-[10px] uppercase tracking-widest text-gray-500">Autres factions</span>
                {allBranches.others.map(branchTab)}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-metal/40 pt-6">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={view === v.id}
                onClick={() => setView(v.id)}
                className={tabClass(view === v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-gray-400">{activeView.help}</p>

          {view !== "hierarchie" && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-gray-500">
              {view !== "fiche" && (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center bg-emerald-500/20 text-emerald-300">
                      <Check className="h-3 w-3" />
                    </span>
                    Accès
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-4 w-4 bg-red-950/40" /> Pas d&apos;accès
                  </span>
                </>
              )}
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-4 w-4 ring-2 ring-inset ring-amber-400" /> Modifié, pas encore enregistré
              </span>
            </div>
          )}

          {view === "hierarchie" ? (
            <div className="mt-4">
              {rows.length === 0 ? (
                <p className="text-gray-500">Aucun grade en service dans cette branche.</p>
              ) : (
                <ol className="overflow-hidden rounded-lg border border-metal/60">
                  {rows.map((g, index) => {
                    const base = baselines.get(g.id)!;
                    const d = current(g);
                    const holders = g._count?.players ?? 0;
                    const changed = movedHere.has(g.id) || base.branch !== branch || base.archived;
                    const note = payNotes.get(g.id);
                    return (
                      <li
                        key={g.id}
                        draggable
                        onDragStart={(e) => {
                          setDragId(g.id);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", g.id);
                        }}
                        onDragOver={(e) => {
                          if (!dragId) return;
                          e.preventDefault();
                          const box = e.currentTarget.getBoundingClientRect();
                          setDropIndex(index + (e.clientY > box.top + box.height / 2 ? 1 : 0));
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (dragId && dropIndex !== null) moveTo(dragId, dropIndex);
                          setDragId(null);
                          setDropIndex(null);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setDropIndex(null);
                        }}
                        className={`group relative flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-metal/30 px-3 py-2.5 last:border-b-0 hover:bg-[#1a1a1d] ${
                          index % 2 === 1 ? "bg-[#111114]" : ""
                        } ${dragId === g.id ? "opacity-40" : ""} ${
                          changed ? "bg-amber-400/5 ring-2 ring-inset ring-amber-400" : ""
                        }`}
                      >
                        {dropIndex === index && (
                          <span className="pointer-events-none absolute inset-x-0 -top-px h-0.5 bg-redlake-glow" />
                        )}
                        {dropIndex === index + 1 && index === rows.length - 1 && (
                          <span className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 bg-redlake-glow" />
                        )}
                        <GripVertical
                          className="h-4 w-4 shrink-0 cursor-grab text-gray-600 group-hover:text-gray-300"
                          aria-hidden
                        />
                        <div className="min-w-56 flex-1">
                          <RowLabel grade={g} position={index + 1} clearance={d.clearanceLevel} />
                          {base.branch !== branch && (
                            <p className="ml-11 mt-0.5 font-mono text-[10px] text-amber-300">
                              vient de {branchLabel(base.branch)}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-4 font-mono text-xs tabular-nums">
                          <span
                            className={`w-28 text-right ${d.pay === null ? "text-gray-600" : "text-gray-200"}`}
                            title="Salaire par semaine"
                          >
                            {d.pay === null ? "pas de salaire" : `${formatPay(d.pay)} / sem.`}
                          </span>
                          <span className="w-32 text-gray-500" title="Personnages qui ont ce grade">
                            {holdersLabel(holders)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-60 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                          <button
                            type="button"
                            className={iconButton}
                            disabled={index === 0}
                            onClick={() => moveTo(g.id, index - 1)}
                            aria-label={`Monter ${g.name}`}
                            title="Monter d'un cran"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className={iconButton}
                            disabled={index === rows.length - 1}
                            onClick={() => moveTo(g.id, index + 2)}
                            aria-label={`Descendre ${g.name}`}
                            title="Descendre d'un cran"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <select
                            value=""
                            onChange={(e) => moveToBranch(g, e.target.value)}
                            aria-label={`Déplacer ${g.name} vers une autre branche`}
                            className={`${inputClass} max-w-40 py-1 text-xs`}
                          >
                            <option value="">Déplacer vers…</option>
                            {allBranches.all
                              .filter((b) => b !== branch)
                              .map((b) => (
                                <option key={b} value={b}>
                                  {branchLabel(b)}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => retire(g)}
                            aria-label={`Retirer ${g.name} du site`}
                            className="rounded border border-metal/60 px-2.5 py-1 text-xs text-gray-400 hover:border-red-400/50 hover:bg-red-400/10 hover:text-red-300"
                            title={
                              holders
                                ? `${plural(holders, "personnage")} ${holders > 1 ? "ont" : "a"} ce grade et le garderont`
                                : "Enlever ce métier du site (réversible)"
                            }
                          >
                            Retirer
                          </button>
                        </div>
                        {note && (
                          <p className="basis-full pl-[4.25rem] text-xs text-amber-300">
                            <AlertTriangle className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
                            {note}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}

              {retiredRows.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-mono text-xs uppercase tracking-widest text-gray-500">
                    Métiers retirés ({retiredRows.length})
                  </h2>
                  <p className="mt-1 max-w-3xl text-xs text-gray-600">
                    Ils n&apos;apparaissent plus sur le site ni dans les listes de grades. Les personnages qui les
                    ont les gardent, avec leurs accès, jusqu&apos;à ce que tu leur en donnes un autre dans Gestion des
                    joueurs.
                  </p>
                  <ul className="mt-3 divide-y divide-metal/30 rounded-lg border border-metal/40">
                    {retiredRows.map((g) => {
                      const holders = g._count?.players ?? 0;
                      const pending = !baselines.get(g.id)!.archived;
                      return (
                        <li
                          key={g.id}
                          className={`flex flex-wrap items-center gap-3 px-3 py-2 ${pending ? "ring-2 ring-inset ring-amber-400" : ""}`}
                        >
                          <span className="min-w-40 flex-1 text-sm text-gray-400 line-through decoration-gray-600">
                            {g.name}
                          </span>
                          {pending && <span className="font-mono text-[10px] text-amber-300">à enregistrer</span>}
                          <span className="font-mono text-[11px] text-gray-500">{holdersLabel(holders)}</span>
                          <button
                            type="button"
                            onClick={() => restore(g)}
                            aria-label={`Remettre ${g.name} sur le site`}
                            className="flex items-center gap-1 rounded border border-metal px-2.5 py-1 text-xs text-gray-200 hover:border-gray-400 hover:text-white"
                          >
                            <Undo2 className="h-3.5 w-3.5" /> Remettre
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : rows.length === 0 ? (
            <p className="mt-6 text-gray-500">Aucun grade en service dans cette branche.</p>
          ) : view === "fiche" ? (
            <div className="mt-4 max-h-[72vh] overflow-auto rounded-lg border border-metal/60">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="text-left font-mono text-[11px] uppercase tracking-widest text-gray-400">
                    <th className="sticky left-0 top-0 z-30 min-w-72 border-b border-r border-metal/60 bg-background px-3 py-2 font-normal">
                      Grade
                    </th>
                    <th className="sticky top-0 z-20 border-b border-metal/60 bg-background px-3 py-2 font-normal">Habilitation</th>
                    <th className="sticky top-0 z-20 border-b border-metal/60 bg-background px-3 py-2 font-normal">Salaire / sem.</th>
                    <th className="sticky top-0 z-20 border-b border-metal/60 bg-background px-3 py-2 font-normal">Quota</th>
                    <th className="sticky top-0 z-20 border-b border-metal/60 bg-background px-3 py-2 font-normal">Domaines</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((g, index) => {
                    const d = current(g);
                    const b = baselines.get(g.id)!;
                    const ring = (changed: boolean) => (changed ? "ring-2 ring-amber-400" : "");
                    const striped = index % 2 === 1;
                    const note = payNotes.get(g.id);
                    const cell = `border-b border-metal/30 px-3 py-2 align-top group-hover:bg-[#1a1a1d] ${striped ? "bg-[#111114]" : ""}`;
                    return (
                      <tr key={g.id} className="group">
                        <th
                          scope="row"
                          className={`sticky left-0 z-10 border-b border-r border-metal/60 px-2 py-2 text-left align-top font-normal group-hover:bg-[#1a1a1d] ${
                            striped ? "bg-[#111114]" : "bg-background"
                          }`}
                        >
                          <RowLabel grade={g} position={index + 1} clearance={d.clearanceLevel} />
                        </th>
                        <td className={cell}>
                          <select
                            value={d.clearanceLevel}
                            onChange={(e) => edit(g, (x) => ({ ...x, clearanceLevel: Number(e.target.value) }))}
                            aria-label={`Habilitation de ${g.name}`}
                            className={`${inputClass} w-full min-w-40 ${ring(d.clearanceLevel !== b.clearanceLevel)}`}
                          >
                            {Object.entries(CLEARANCE_LABELS).map(([level, label]) => (
                              <option key={level} value={level} title={label}>
                                {label.replace(/^Niveau (\d) — Personnel (.)/, (_, n: string, c: string) => `${n} — ${c.toUpperCase()}`)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className={cell}>
                          <input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={d.pay ?? ""}
                            placeholder="—"
                            onChange={(e) => {
                              const pay = parseAmount(e.target.value);
                              if (pay !== undefined) edit(g, (x) => ({ ...x, pay }));
                            }}
                            aria-label={`Salaire de ${g.name}`}
                            className={`${inputClass} w-28 text-right tabular-nums ${ring(d.pay !== b.pay)} ${note ? "border-amber-400/60" : ""}`}
                          />
                          {note && (
                            <p className="mt-1 max-w-48 text-[11px] leading-snug text-amber-300">
                              <AlertTriangle className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden />
                              {note}
                            </p>
                          )}
                        </td>
                        <td className={cell}>
                          <input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={d.quota ?? ""}
                            placeholder="—"
                            onChange={(e) => {
                              const quota = parseAmount(e.target.value);
                              if (quota !== undefined) edit(g, (x) => ({ ...x, quota }));
                            }}
                            aria-label={`Quota de ${g.name}`}
                            className={`${inputClass} w-20 text-right tabular-nums ${ring(d.quota !== b.quota)}`}
                          />
                        </td>
                        <td className={`${cell} min-w-64`}>
                          <DomainsEditor
                            value={d.utilities}
                            label={g.name}
                            changed={!sameSet(b.utilities, d.utilities)}
                            onChange={(utilities) => edit(g, (x) => ({ ...x, utilities }))}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <datalist id="domaines-connus">
                {knownDomains.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-400">
                <Copy className="h-4 w-4 text-gray-500" />
                Copier les {view === "zones" ? "zones" : "sections"} de
                <select
                  value={copyFrom}
                  onChange={(e) => setCopyFrom(e.target.value)}
                  aria-label="Grade à copier"
                  className={`${inputClass} max-w-64`}
                >
                  <option value="">— choisir un grade —</option>
                  {allBranches.all.map((b) => (
                    <optgroup key={b} label={branchLabel(b)}>
                      {sequence(b, "draft").map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                vers
                <select
                  value={copyTo}
                  onChange={(e) => setCopyTo(e.target.value)}
                  aria-label="Grade qui reçoit la copie"
                  className={`${inputClass} max-w-64`}
                >
                  <option value="">— grade de {branchLabel(branch)} —</option>
                  {rows.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={copy}
                  disabled={!copyFrom || !copyTo || copyFrom === copyTo || !rows.some((g) => g.id === copyTo)}
                  className="rounded border border-metal px-3 py-1.5 text-xs text-gray-200 hover:border-redlake hover:text-white disabled:opacity-40"
                >
                  Copier
                </button>
              </div>

              <div className="mt-4">
                <AccessMatrix
                  rows={rows}
                  columns={view === "zones" ? ZONE_COLUMNS : SECTION_COLUMNS}
                  vertical={view === "sections"}
                  clearanceOf={(g) => current(g).clearanceLevel}
                  isOn={(g, col) => current(g)[field].includes(col)}
                  isChanged={(g, col) =>
                    current(g)[field].includes(col) !== (baselines.get(g.id)?.[field].includes(col) ?? false)
                  }
                  onToggle={toggle}
                  onToggleColumn={toggleColumn}
                />
              </div>
            </>
          )}

          {notice && (
            <div
              className={`mt-6 flex flex-wrap items-center gap-3 rounded border p-4 text-sm ${
                notice.ok ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-red-400/30 bg-red-400/10 text-red-300"
              }`}
              role="status"
            >
              {notice.text}
              {!notice.ok && (
                <button
                  type="button"
                  onClick={() => {
                    setNotice(null);
                    void load();
                  }}
                  className="rounded border border-red-400/40 px-3 py-1 text-xs hover:bg-red-400/10"
                >
                  Recharger les grades (tes changements seront perdus)
                </button>
              )}
            </div>
          )}
        </>
      )}

      {dirty.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-400/40 bg-background/95 backdrop-blur">
          {/* pr-24 : laisse la place à la bulle de messagerie (fixe, en bas à droite). */}
          <div className="mx-auto max-w-7xl py-3 pl-4 pr-24">
            {showDetail && (
              <ul className="mb-3 max-h-48 space-y-1 overflow-y-auto font-mono text-xs text-gray-300">
                {pendingLines.map((line) => (
                  <li key={line.key}>
                    <span className="text-white">{line.title}</span> — {line.text}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-amber-200">
                {plural(Math.max(pendingLines.length, 1), "changement")} pas encore enregistré
                {pendingLines.length > 1 ? "s" : ""}{" "}
                <button
                  type="button"
                  onClick={() => setShowDetail((v) => !v)}
                  className="ml-1 font-mono text-xs text-gray-400 underline underline-offset-2 hover:text-white"
                >
                  {showDetail ? "Masquer le détail" : "Voir le détail"}
                </button>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={discardAll}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded border border-metal px-3 py-2 text-sm text-gray-300 hover:border-gray-400 hover:text-white disabled:opacity-40"
                >
                  <RotateCcw className="h-4 w-4" /> Tout annuler
                </button>
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded border border-redlake bg-redlake/25 px-4 py-2 text-sm font-semibold text-white hover:bg-redlake/40 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
