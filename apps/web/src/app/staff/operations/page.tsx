"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Plus, Siren } from "lucide-react";
import { RP_EVENT_STATUS_COLORS, RP_EVENT_STATUS_LABELS, type RpEventStatus } from "@/lib/rp-events";

interface RpEventSummary {
  id: string;
  title: string;
  briefing: string | null;
  status: RpEventStatus;
  startedAt: string | null;
  endedAt: string | null;
  createdByLabel: string | null;
  faction: { id: string; slug: string; name: string } | null;
  _count: { assignments: number };
}

interface FactionOption {
  id: string;
  slug: string;
  name: string;
}

const inputClass =
  "w-full rounded border border-metal bg-black px-3 py-2 text-sm text-white outline-none focus:border-redlake";

export default function StaffOperationsPage() {
  const [events, setEvents] = useState<RpEventSummary[]>([]);
  const [factions, setFactions] = useState<FactionOption[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", briefing: "", factionId: "" });

  const load = async () => {
    try {
      setEvents(await apiFetch<RpEventSummary[]>("/rp-events"));
    } catch {
      setError("Impossible de charger les opérations — connectez-vous en staff (Officier ou plus).");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    apiFetch<FactionOption[]>("/factions")
      .then((list) => {
        setFactions(list);
        // Premier test prévu : 100 % Fondation — présélection, modifiable.
        const fondation = list.find((f) => f.slug === "fondation");
        if (fondation) setForm((f) => (f.factionId ? f : { ...f, factionId: fondation.id }));
      })
      .catch(() => undefined);
  }, []);

  const create = async () => {
    if (form.title.trim().length < 3) return;
    setSaving(true);
    setError("");
    try {
      const created = await apiFetch<{ id: string }>("/rp-events", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          briefing: form.briefing.trim() || undefined,
          factionId: form.factionId || undefined,
        }),
      });
      window.location.href = `/staff/operations/${created.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
        OPÉRATIONS EN DIRECT — STAFF
      </p>
      <h1 className="mb-4 flex items-center gap-2 text-4xl font-bold text-white">
        <Siren className="h-8 w-8 text-redlake-glow" /> Opérations
      </h1>
      <p className="mb-8 text-gray-500">
        Composez une opération, affectez des personnages à des fonctions temporaires, lancez-la :
        chaque joueur reçoit sa carte d&apos;affectation en jeu. Le grade permanent n&apos;est jamais
        modifié ; tout est levé à la clôture.
      </p>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="mb-10 hologram-border rounded-lg p-6">
        <h2 className="mb-4 font-bold text-white">Nouvelle opération</h2>
        <div className="space-y-3">
          <input
            className={inputClass}
            placeholder="Titre (ex. Exercice — Bloc administratif)"
            maxLength={120}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <textarea
            rows={3}
            className={inputClass}
            placeholder="Briefing (optionnel, visible des participants)"
            maxLength={2000}
            value={form.briefing}
            onChange={(e) => setForm((f) => ({ ...f, briefing: e.target.value }))}
          />
          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-gray-500">
              Faction concernée
            </span>
            <select
              className={inputClass}
              value={form.factionId}
              onChange={(e) => setForm((f) => ({ ...f, factionId: e.target.value }))}
            >
              <option value="">Toutes factions</option>
              {factions.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </label>
          <button
            onClick={create}
            disabled={saving || form.title.trim().length < 3}
            className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Créer et composer
          </button>
        </div>
      </section>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {!loading && events.length === 0 && !error && (
        <p className="text-gray-500">Aucune opération enregistrée.</p>
      )}

      <div className="space-y-3">
        {events.map((e) => (
          <Link
            key={e.id}
            href={`/staff/operations/${e.id}`}
            className="block hologram-border rounded-lg p-4 transition hover:border-redlake-glow"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-white">{e.title}</h3>
                {e.briefing && <p className="mt-1 line-clamp-2 text-sm text-gray-400">{e.briefing}</p>}
              </div>
              <span
                className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] uppercase ${RP_EVENT_STATUS_COLORS[e.status]}`}
              >
                {RP_EVENT_STATUS_LABELS[e.status]}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-gray-600">
              <span>{e.faction?.name ?? "Toutes factions"}</span>
              <span>{e._count.assignments} affecté{e._count.assignments > 1 ? "s" : ""}</span>
              {e.startedAt && <span>Lancée le {new Date(e.startedAt).toLocaleString("fr-FR")}</span>}
              {e.endedAt && <span>Terminée le {new Date(e.endedAt).toLocaleString("fr-FR")}</span>}
              {e.createdByLabel && <span>Créée par {e.createdByLabel}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
