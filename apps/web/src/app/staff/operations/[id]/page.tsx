"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Play, Plus, Siren, Square, UserMinus, X } from "lucide-react";
import { RP_EVENT_STATUS_COLORS, RP_EVENT_STATUS_LABELS, type RpEventStatus } from "@/lib/rp-events";

interface Assignment {
  id: string;
  roleLabel: string;
  sector: string | null;
  equipment: string | null;
  instruction: string | null;
  department: { id: string; name: string } | null;
  player: {
    id: string;
    rpFirstName: string | null;
    rpLastName: string | null;
    grade: string;
    user: { minecraftUsername: string | null; username: string | null };
  };
}

interface RpEvent {
  id: string;
  title: string;
  briefing: string | null;
  status: RpEventStatus;
  startedAt: string | null;
  endedAt: string | null;
  createdByLabel: string | null;
  closedByLabel: string | null;
  faction: { id: string; name: string } | null;
  assignments: Assignment[];
}

interface Candidate {
  id: string;
  rpName: string;
  grade: string;
  department: { id: string; name: string } | null;
  minecraftUsername: string | null;
  isActiveCharacter: boolean;
}

interface DepartmentOption {
  id: string;
  name: string;
  factionId: string | null;
}

const inputClass =
  "w-full rounded border border-metal bg-black px-3 py-2 text-sm text-white outline-none focus:border-redlake";

const EMPTY_FORM = { playerId: "", roleLabel: "", departmentId: "", sector: "", equipment: "", instruction: "" };

function rpName(p: Assignment["player"]) {
  return [p.rpFirstName, p.rpLastName].filter(Boolean).join(" ") || "Personnage sans nom";
}

export default function StaffOperationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<RpEvent | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [ev, cand] = await Promise.all([
        apiFetch<RpEvent>(`/rp-events/${id}`),
        apiFetch<Candidate[]>(`/rp-events/${id}/candidates`),
      ]);
      setEvent(ev);
      setCandidates(cand);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opération introuvable");
    }
  }, [id]);

  useEffect(() => {
    load();
    apiFetch<DepartmentOption[]>("/departments").then(setDepartments).catch(() => undefined);
  }, [load]);

  const run = async (action: () => Promise<unknown>, success?: string) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await action();
      if (success) setNotice(success);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const pickCandidate = (playerId: string) => {
    const c = candidates.find((x) => x.id === playerId);
    // Présélectionne le département courant du personnage, modifiable.
    setForm((f) => ({ ...f, playerId, departmentId: c?.department?.id ?? f.departmentId }));
  };

  const addAssignment = () =>
    run(async () => {
      await apiFetch(`/rp-events/${id}/assignments`, {
        method: "POST",
        body: JSON.stringify({
          playerId: form.playerId,
          roleLabel: form.roleLabel.trim(),
          departmentId: form.departmentId || undefined,
          sector: form.sector.trim() || undefined,
          equipment: form.equipment.trim() || undefined,
          instruction: form.instruction.trim() || undefined,
        }),
      });
      setForm(EMPTY_FORM);
    });

  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/staff/operations" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Opérations
        </Link>
        <p className="text-gray-500">{error || "Chargement..."}</p>
      </div>
    );
  }

  const open = event.status === "PLANNED" || event.status === "ACTIVE";
  const assignedIds = new Set(event.assignments.map((a) => a.player.id));
  const available = candidates.filter((c) => !assignedIds.has(c.id));
  // Opération limitée à une faction : seuls ses départements ont un sens.
  const departmentOptions = event.faction
    ? departments.filter((d) => d.factionId === event.faction?.id)
    : departments;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/staff/operations" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Opérations
      </Link>

      <div className="mb-8 hologram-border rounded-lg p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
              OPÉRATION — {event.faction?.name?.toUpperCase() ?? "TOUTES FACTIONS"}
            </p>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
              <Siren className="h-7 w-7 text-redlake-glow" /> {event.title}
            </h1>
          </div>
          <span className={`rounded border px-2 py-0.5 font-mono text-xs uppercase ${RP_EVENT_STATUS_COLORS[event.status]}`}>
            {RP_EVENT_STATUS_LABELS[event.status]}
          </span>
        </div>
        {event.briefing && <p className="mt-4 whitespace-pre-line text-gray-400">{event.briefing}</p>}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-gray-600">
          {event.createdByLabel && <span>Créée par {event.createdByLabel}</span>}
          {event.startedAt && <span>Lancée le {new Date(event.startedAt).toLocaleString("fr-FR")}</span>}
          {event.endedAt && <span>Terminée le {new Date(event.endedAt).toLocaleString("fr-FR")}</span>}
          {event.closedByLabel && <span>Clôturée par {event.closedByLabel}</span>}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {event.status === "PLANNED" && (
            <>
              <button
                onClick={() =>
                  run(
                    () => apiFetch(`/rp-events/${id}/start`, { method: "POST" }),
                    "Opération lancée. En jeu, /rl staff sync applique les affectations tout de suite (sinon sous 5 minutes).",
                  )
                }
                disabled={saving || event.assignments.length === 0}
                className="flex items-center gap-2 rounded border border-green-400/40 bg-green-400/10 px-4 py-2 font-mono text-sm text-green-400 hover:bg-green-400/20 disabled:opacity-50"
              >
                <Play className="h-4 w-4" /> Lancer l&apos;opération
              </button>
              <button
                onClick={() => run(() => apiFetch(`/rp-events/${id}/cancel`, { method: "POST" }))}
                disabled={saving}
                className="flex items-center gap-2 rounded border border-metal px-4 py-2 font-mono text-sm text-gray-500 hover:text-white disabled:opacity-50"
              >
                <X className="h-4 w-4" /> Annuler
              </button>
            </>
          )}
          {event.status === "ACTIVE" && (
            <button
              onClick={() => {
                if (!confirm("Clôturer l'opération ? Toutes les affectations temporaires seront levées.")) return;
                run(
                  () => apiFetch(`/rp-events/${id}/close`, { method: "POST" }),
                  "Opération clôturée. En jeu, /rl staff sync lève les affectations tout de suite (sinon sous 5 minutes).",
                );
              }}
              disabled={saving}
              className="flex items-center gap-2 rounded border border-red-400/40 bg-red-400/10 px-4 py-2 font-mono text-sm text-red-400 hover:bg-red-400/20 disabled:opacity-50"
            >
              <Square className="h-4 w-4" /> Clôturer l&apos;opération
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">{error}</div>
      )}
      {notice && (
        <div className="mb-6 rounded border border-green-400/30 bg-green-400/10 p-4 text-sm text-green-400">{notice}</div>
      )}

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-white">
          Affectations <span className="font-mono text-sm text-gray-500">({event.assignments.length})</span>
        </h2>
        {event.assignments.length === 0 && <p className="text-gray-500">Aucun personnage affecté pour l&apos;instant.</p>}
        <div className="space-y-3">
          {event.assignments.map((a) => (
            <div key={a.id} className="hologram-border rounded-lg p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-white">
                    {rpName(a.player)}{" "}
                    <span className="font-mono text-xs font-normal text-gray-500">
                      {a.player.user.minecraftUsername ?? a.player.user.username ?? ""} · grade permanent : {a.player.grade}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-red-300">{a.roleLabel}</p>
                </div>
                {open && (
                  <button
                    onClick={() => run(() => apiFetch(`/rp-events/${id}/assignments/${a.id}`, { method: "DELETE" }))}
                    disabled={saving}
                    className="flex items-center gap-1 rounded border border-metal px-2 py-1 font-mono text-xs text-gray-500 hover:text-white disabled:opacity-50"
                  >
                    <UserMinus className="h-3 w-3" /> Retirer
                  </button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-gray-500">
                {a.department && <span>Département : {a.department.name}</span>}
                {a.sector && <span>Secteur : {a.sector}</span>}
                {a.equipment && <span>Équipement : {a.equipment}</span>}
              </div>
              {a.instruction && <p className="mt-2 text-sm text-gray-400">Consigne : {a.instruction}</p>}
            </div>
          ))}
        </div>
      </section>

      {open && (
        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-1 font-bold text-white">Affecter un personnage</h2>
          <p className="mb-4 text-xs text-gray-500">
            Seuls les personnages de la faction de l&apos;opération sont proposés. En jeu, seul le personnage
            actif d&apos;un joueur reçoit sa carte.
          </p>
          <div className="space-y-3">
            <select className={inputClass} value={form.playerId} onChange={(e) => pickCandidate(e.target.value)}>
              <option value="">— Choisir un personnage —</option>
              {available.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.rpName} — {c.grade}
                  {c.minecraftUsername ? ` (${c.minecraftUsername})` : ""}
                  {c.isActiveCharacter ? "" : " · personnage inactif"}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Fonction temporaire (ex. Agent de sécurité)"
                maxLength={60}
                value={form.roleLabel}
                onChange={(e) => setForm((f) => ({ ...f, roleLabel: e.target.value }))}
              />
              <select
                className={inputClass}
                value={form.departmentId}
                onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
              >
                <option value="">Département (optionnel)</option>
                {departmentOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <input
                className={inputClass}
                placeholder="Secteur (ex. Bloc administratif)"
                maxLength={80}
                value={form.sector}
                onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
              />
              <input
                className={inputClass}
                placeholder="Équipement (ex. Carte d'accès · Radio)"
                maxLength={120}
                value={form.equipment}
                onChange={(e) => setForm((f) => ({ ...f, equipment: e.target.value }))}
              />
            </div>
            <input
              className={inputClass}
              placeholder="Consigne (ex. Rejoindre le secteur et attendre le supérieur)"
              maxLength={200}
              value={form.instruction}
              onChange={(e) => setForm((f) => ({ ...f, instruction: e.target.value }))}
            />
            <button
              onClick={addAssignment}
              disabled={saving || !form.playerId || form.roleLabel.trim().length < 2}
              className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Affecter
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
