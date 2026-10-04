"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, ExternalLink, RotateCcw, Save, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { accessZones } from "@/data/site12";
import { SITE_SECTION_LABELS } from "@/lib/grade-access";
import { CLEARANCE_LABELS } from "@/lib/clearance";
import { BRANCH_LABELS, BRANCH_ORDER, type ApiGrade } from "@/lib/grade-labels";

type Grade = ApiGrade & { updatedAt: string };

interface Draft {
  accessZones: string[];
  siteSections: string[];
  utilities: string[];
  clearanceLevel: number;
  pay: number | null;
  quota: number | null;
}

type ListField = "accessZones" | "siteSections";
type View = "zones" | "sections" | "fiche";

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
  };
}

function listDiff(label: string, before: string[], after: string[], names?: Map<string, string>) {
  const added = after.filter((x) => !before.includes(x));
  const removed = before.filter((x) => !after.includes(x));
  if (!added.length && !removed.length) return null;
  const name = (x: string) => names?.get(x) ?? x;
  return `${label} : ${[...added.map((x) => `+${name(x)}`), ...removed.map((x) => `−${name(x)}`)].join(", ")}`;
}

/** Même lecture que le journal d'audit côté API (grade-changes.ts). */
function describeDraft(before: Draft, after: Draft): string[] {
  const amount = (v: number | null) => (v === null ? "aucun" : v.toLocaleString("fr-FR"));
  return [
    listDiff("Zones", before.accessZones, after.accessZones, ZONE_LABEL),
    listDiff("Sections", before.siteSections, after.siteSections, SECTION_LABEL),
    listDiff("Domaines", before.utilities, after.utilities),
    before.clearanceLevel !== after.clearanceLevel
      ? `Habilitation : ${before.clearanceLevel} → ${after.clearanceLevel}`
      : null,
    before.pay !== after.pay ? `Salaire : ${amount(before.pay)} → ${amount(after.pay)}` : null,
    before.quota !== after.quota ? `Quota : ${amount(before.quota)} → ${amount(after.quota)}` : null,
  ].filter((line): line is string => line !== null);
}

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

function AccessMatrix({
  rows,
  columns,
  vertical,
  isOn,
  isChanged,
  onToggle,
  onToggleColumn,
}: {
  rows: Grade[];
  columns: Column[];
  vertical?: boolean;
  isOn: (g: Grade, col: string) => boolean;
  isChanged: (g: Grade, col: string) => boolean;
  onToggle: (g: Grade, col: string) => void;
  onToggleColumn: (col: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-metal/60">
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-20 min-w-52 border-b border-r border-metal/60 bg-background px-3 py-2 text-left align-bottom font-mono text-[10px] font-normal uppercase tracking-widest text-gray-500">
              Grade
            </th>
            {columns.map((col) => (
              <th
                key={col.id}
                className={`border-b border-l border-metal/40 p-0 align-bottom ${vertical ? "h-40" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => onToggleColumn(col.id)}
                  title={`${col.title} — cliquer pour donner ou retirer à toute la branche`}
                  className="flex h-full w-full items-end justify-center px-1.5 py-2 font-mono text-[11px] text-gray-300 hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-redlake-glow"
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
          {rows.map((g) => (
            <tr key={g.id} className="group">
              <th
                scope="row"
                className="sticky left-0 z-10 border-r border-t border-metal/60 bg-background px-3 py-1.5 text-left font-normal group-hover:bg-[#0d0d0f]"
              >
                <span className="flex items-center gap-1.5 text-sm text-white">
                  {g.name}
                  <Link
                    href={`/staff/grades/${g.id}`}
                    target="_blank"
                    title="Ouvrir la fiche complète (nom, description, missions) dans un nouvel onglet"
                    className="text-gray-600 hover:text-redlake-glow"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </span>
              </th>
              {columns.map((col) => {
                const on = isOn(g, col.id);
                const changed = isChanged(g, col.id);
                return (
                  <td key={col.id} className="border-l border-t border-metal/40 p-0">
                    <button
                      type="button"
                      aria-pressed={on}
                      aria-label={`${g.name} — ${col.label} : ${on ? "accès" : "pas d'accès"}`}
                      title={`${g.name} — ${col.title} : ${on ? "accès" : "pas d'accès"}${changed ? " (modifié, pas encore enregistré)" : ""}`}
                      onClick={() => onToggle(g, col.id)}
                      className={`flex h-9 w-full min-w-10 items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-redlake-glow ${
                        on
                          ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                          : "bg-red-950/25 hover:bg-red-900/30"
                      } ${changed ? "ring-2 ring-inset ring-amber-400" : ""}`}
                    >
                      {on && <Check className="h-4 w-4" />}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
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
  const [view, setView] = useState<View>("zones");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [copyFrom, setCopyFrom] = useState("");
  const [copyTo, setCopyTo] = useState("");

  const load = useCallback(async () => {
    try {
      const [list, factions] = await Promise.all([
        apiFetch<Grade[]>("/grades"),
        apiFetch<{ slug: string; name: string }[]>("/factions").catch(() => []),
      ]);
      setLoadError("");
      setGrades(list);
      setFactionNames(Object.fromEntries(factions.map((f) => [f.slug, f.name])));
      setDrafts({});
    } catch {
      setLoadError("Impossible de charger les grades : l'API ne répond pas. Réessaie dans quelques secondes.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const branchLabel = useCallback(
    (b: string) => BRANCH_LABELS[b] ?? factionNames[b] ?? b.charAt(0).toUpperCase() + b.slice(1),
    [factionNames],
  );

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

  const { siteBranches, otherBranches, counts } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const g of grades ?? []) counts.set(g.branch, (counts.get(g.branch) ?? 0) + 1);
    const siteBranches = BRANCH_ORDER.filter((b) => counts.has(b));
    const otherBranches = [...counts.keys()]
      .filter((b) => !BRANCH_ORDER.includes(b))
      .sort((a, b) => branchLabel(a).localeCompare(branchLabel(b), "fr"));
    return { siteBranches, otherBranches, counts };
  }, [grades, branchLabel]);

  const rows = useMemo(() => (grades ?? []).filter((g) => g.branch === branch), [grades, branch]);

  const pending = useMemo(
    () =>
      (grades ?? []).flatMap((g) => {
        const draft = drafts[g.id];
        const before = baselines.get(g.id);
        if (!draft || !before) return [];
        const lines = describeDraft(before, draft);
        return lines.length ? [{ grade: g, draft, lines }] : [];
      }),
    [grades, drafts, baselines],
  );
  const pendingBranches = useMemo(() => new Set(pending.map((p) => p.grade.branch)), [pending]);

  useEffect(() => {
    if (!pending.length) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [pending.length]);

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
    try {
      const updated = await apiFetch<Grade[]>("/grades/access", {
        method: "PATCH",
        body: JSON.stringify({
          changes: pending.map(({ grade, draft }) => ({ id: grade.id, updatedAt: grade.updatedAt, ...draft })),
        }),
      });
      const byId = new Map(updated.map((g) => [g.id, g]));
      setGrades((prev) => prev?.map((g) => (byId.has(g.id) ? { ...g, ...byId.get(g.id)! } : g)) ?? prev);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const g of updated) delete next[g.id];
        return next;
      });
      setShowDetail(false);
      setNotice({
        ok: true,
        text: `Enregistré : ${updated.length} grade${updated.length > 1 ? "s" : ""} mis à jour. Les joueurs concernés voient leurs nouveaux accès dès leur prochain chargement de page.`,
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
      {branchLabel(b)} <span className="text-gray-500">({counts.get(b)})</span>
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
          if (pending.length && !confirm("Tes changements non enregistrés seront perdus. Quitter quand même ?")) {
            e.preventDefault();
          }
        }}
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Gestion des grades
      </Link>

      <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">ADMINISTRATION SITE-12 — GRILLE DES ACCÈS</p>
      <h1 className="text-4xl font-bold text-white">Accès par grade</h1>
      <p className="mt-3 max-w-3xl text-gray-400">
        Choisis une branche, puis décide pour chaque grade ce qu&apos;il peut ouvrir. Clique sur une case pour
        donner ou retirer un accès, ou sur le titre d&apos;une colonne pour toute la branche. Rien n&apos;est
        appliqué tant que tu n&apos;as pas cliqué sur « Enregistrer ».
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
              {siteBranches.map(branchTab)}
            </div>
            {otherBranches.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-24 font-mono text-[10px] uppercase tracking-widest text-gray-500">Autres factions</span>
                {otherBranches.map(branchTab)}
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
          <p className="mt-3 max-w-4xl text-sm text-gray-500">{activeView.help}</p>

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

          {rows.length === 0 ? (
            <p className="mt-6 text-gray-500">Aucun grade dans cette branche.</p>
          ) : view === "fiche" ? (
            <div className="mt-4 overflow-x-auto rounded-lg border border-metal/60">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-gray-500">
                    <th className="border-b border-metal/60 px-3 py-2 font-normal">Grade</th>
                    <th className="border-b border-metal/60 px-3 py-2 font-normal">Habilitation</th>
                    <th className="border-b border-metal/60 px-3 py-2 font-normal">Salaire / sem.</th>
                    <th className="border-b border-metal/60 px-3 py-2 font-normal">Quota</th>
                    <th className="border-b border-metal/60 px-3 py-2 font-normal">Domaines</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((g) => {
                    const d = current(g);
                    const b = baselines.get(g.id)!;
                    const ring = (changed: boolean) => (changed ? "ring-2 ring-amber-400" : "");
                    return (
                      <tr key={g.id} className="border-t border-metal/40 align-top">
                        <th scope="row" className="px-3 py-2 text-left font-normal text-white">
                          {g.name}
                        </th>
                        <td className="px-3 py-2">
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
                        <td className="px-3 py-2">
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
                            className={`${inputClass} w-28 tabular-nums ${ring(d.pay !== b.pay)}`}
                          />
                        </td>
                        <td className="px-3 py-2">
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
                            className={`${inputClass} w-20 tabular-nums ${ring(d.quota !== b.quota)}`}
                          />
                        </td>
                        <td className="min-w-64 px-3 py-2">
                          <DomainsEditor
                            value={d.utilities}
                            label={g.name}
                            changed={listDiff("", b.utilities, d.utilities) !== null}
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
                  {[...siteBranches, ...otherBranches].map((b) => (
                    <optgroup key={b} label={branchLabel(b)}>
                      {grades
                        .filter((g) => g.branch === b)
                        .map((g) => (
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

      {pending.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-400/40 bg-background/95 backdrop-blur">
          {/* pr-24 : laisse la place à la bulle de messagerie (fixe, en bas à droite). */}
          <div className="mx-auto max-w-7xl py-3 pl-4 pr-24">
            {showDetail && (
              <ul className="mb-3 max-h-48 space-y-1 overflow-y-auto font-mono text-xs text-gray-300">
                {pending.map(({ grade, lines }) => (
                  <li key={grade.id}>
                    <span className="text-white">{grade.name}</span>{" "}
                    <span className="text-gray-500">({branchLabel(grade.branch)})</span> — {lines.join(" ; ")}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-amber-200">
                {pending.length} grade{pending.length > 1 ? "s" : ""} modifié{pending.length > 1 ? "s" : ""}, pas encore
                enregistré{pending.length > 1 ? "s" : ""}{" "}
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
