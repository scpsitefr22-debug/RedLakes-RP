"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  FACTION_RELATION_LABELS,
  type ApiFactionRelation,
  type FactionRelationStatus,
} from "@/lib/faction-types";
import { Handshake, Plus, X } from "lucide-react";

interface FactionOption {
  id: string;
  name: string;
}

const STATUSES: FactionRelationStatus[] = ["ALLIE", "NEUTRE", "TENSION", "HOSTILE"];

const inputClass =
  "w-full rounded border border-metal bg-black px-3 py-2 text-sm text-white outline-none focus:border-redlake";

export function FactionRelationsPanel({
  factionId,
  canDelete,
}: {
  factionId: string;
  canDelete: boolean;
}) {
  const [relations, setRelations] = useState<ApiFactionRelation[]>([]);
  const [factions, setFactions] = useState<FactionOption[]>([]);
  const [targetId, setTargetId] = useState("");
  const [status, setStatus] = useState<FactionRelationStatus>("NEUTRE");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const rels = await apiFetch<ApiFactionRelation[]>(
      `/faction-relations/faction/${factionId}`,
    ).catch(() => []);
    setRelations(rels);
  }, [factionId]);

  useEffect(() => {
    load();
    apiFetch<FactionOption[]>("/factions")
      .then((all) => setFactions(all.filter((f) => f.id !== factionId)))
      .catch(() => undefined);
  }, [factionId, load]);

  const setRelation = async () => {
    if (!targetId) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch("/faction-relations", {
        method: "POST",
        body: JSON.stringify({
          factionAId: factionId,
          factionBId: targetId,
          status,
          note: note.trim() || undefined,
        }),
      });
      setTargetId("");
      setStatus("NEUTRE");
      setNote("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette relation diplomatique ?")) return;
    setSaving(true);
    try {
      await apiFetch(`/faction-relations/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto mt-8 max-w-3xl px-4">
      <div className="hologram-border rounded-lg p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
          <Handshake className="h-5 w-5 text-redlake-glow" /> Relations diplomatiques
        </h2>

        {error && (
          <div className="mb-4 rounded border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mb-4 space-y-2">
          {relations.length === 0 && (
            <p className="text-sm text-gray-600">Aucune relation définie avec une autre faction.</p>
          )}
          {relations.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded border border-metal p-3 text-sm">
              <div className="min-w-0">
                <p className="text-white">
                  {r.faction.name} — <span className="font-mono text-xs text-gray-400">{FACTION_RELATION_LABELS[r.status]}</span>
                </p>
                {r.note && <p className="mt-1 text-xs text-gray-500">{r.note}</p>}
              </div>
              {canDelete && (
                <button
                  onClick={() => remove(r.id)}
                  disabled={saving}
                  className="rounded border border-red-400/40 p-1.5 text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                  title="Supprimer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.5fr_1fr_1.5fr_auto]">
          <select className={inputClass} value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            <option value="">— Choisir une faction —</option>
            {factions.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as FactionRelationStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{FACTION_RELATION_LABELS[s]}</option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="Note (optionnelle)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            onClick={setRelation}
            disabled={saving || !targetId}
            className="flex items-center gap-1 rounded border border-redlake bg-redlake/20 px-3 text-sm text-white hover:bg-redlake/30 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Définir
          </button>
        </div>
        <p className="mt-2 font-mono text-[10px] text-gray-600">
          Redéfinir une relation existante (même faction cible) met simplement à jour son statut.
        </p>
      </div>
    </section>
  );
}
