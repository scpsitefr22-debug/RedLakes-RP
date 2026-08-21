"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";

type AlertLevel = "NORMAL" | "VIGILANCE" | "ALERTE" | "CRISE";

interface SystemState {
  serverOpen: boolean;
  recruitmentOpen: boolean;
  maintenance: boolean;
  alertLevel: AlertLevel;
  alertNote: string | null;
  alertUpdatedAt: string | null;
}

const ALERT_LEVELS: AlertLevel[] = ["NORMAL", "VIGILANCE", "ALERTE", "CRISE"];
const ALERT_LABELS: Record<AlertLevel, string> = {
  NORMAL: "Normal",
  VIGILANCE: "Vigilance",
  ALERTE: "Alerte",
  CRISE: "Crise",
};

const inputClass =
  "w-full rounded border border-metal bg-black px-3 py-2 text-sm text-white outline-none focus:border-redlake";

export default function StaffSystemePage() {
  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const [state, setState] = useState<SystemState | null>(null);
  const [alertLevel, setAlertLevel] = useState<AlertLevel>("NORMAL");
  const [alertNote, setAlertNote] = useState("");
  const [serverOpen, setServerOpen] = useState(false);
  const [recruitmentOpen, setRecruitmentOpen] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const s = await apiFetch<SystemState>("/system/status");
      setState(s);
      setAlertLevel(s.alertLevel);
      setAlertNote(s.alertNote ?? "");
      setServerOpen(s.serverOpen);
      setRecruitmentOpen(s.recruitmentOpen);
      setMaintenance(s.maintenance);
    } catch {
      setError("Impossible de charger l'état du système.");
    }
  };

  useEffect(() => {
    load();
    apiFetch<{ authenticated: boolean; user?: { role: string } }>("/auth/me")
      .then((res) => setViewerRole(res.user?.role ?? null))
      .catch(() => undefined);
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const updated = await apiFetch<SystemState>("/system/status", {
        method: "PATCH",
        body: JSON.stringify({
          alertLevel,
          alertNote: alertNote.trim() || undefined,
          serverOpen,
          recruitmentOpen,
          maintenance,
        }),
      });
      setState(updated);
      setMessage("État du système mis à jour.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (viewerRole && viewerRole !== "ADMIN") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-redlake-glow" />
        <h1 className="text-2xl font-bold text-white">Accès réservé</h1>
        <p className="mt-2 text-gray-500">
          Seul le Fondateur peut modifier l&apos;état global du système.
        </p>
      </div>
    );
  }

  if (!state) {
    return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
        ÉTAT DU SYSTÈME — FONDATEUR
      </p>
      <h1 className="mb-8 text-4xl font-bold text-white">Système</h1>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">{error}</div>
      )}

      <section className="mb-8 hologram-border rounded-lg p-6">
        <h2 className="mb-1 font-bold text-white">Niveau d&apos;alerte</h2>
        <p className="mb-4 text-sm text-gray-500">
          Affiché en permanence dans l&apos;en-tête du site. À réserver aux situations réellement décidées
          en RP — jamais de changement automatique.
        </p>
        <select className={inputClass} value={alertLevel} onChange={(e) => setAlertLevel(e.target.value as AlertLevel)}>
          {ALERT_LEVELS.map((l) => (
            <option key={l} value={l}>{ALERT_LABELS[l]}</option>
          ))}
        </select>
        <textarea
          rows={2}
          className={`${inputClass} mt-3`}
          placeholder="Note (optionnelle, visible au survol du badge)"
          value={alertNote}
          onChange={(e) => setAlertNote(e.target.value)}
        />
        {state.alertUpdatedAt && (
          <p className="mt-2 font-mono text-[10px] text-gray-600">
            Dernier changement : {new Date(state.alertUpdatedAt).toLocaleString("fr-FR")}
          </p>
        )}
      </section>

      <section className="mb-8 hologram-border rounded-lg p-6">
        <h2 className="mb-4 font-bold text-white">Statut opérationnel</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-400">Serveur Minecraft ouvert</span>
            <input type="checkbox" checked={serverOpen} onChange={(e) => setServerOpen(e.target.checked)} className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-400">Recrutement ouvert</span>
            <input type="checkbox" checked={recruitmentOpen} onChange={(e) => setRecruitmentOpen(e.target.checked)} className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-400">Maintenance</span>
            <input type="checkbox" checked={maintenance} onChange={(e) => setMaintenance(e.target.checked)} className="h-4 w-4" />
          </label>
        </div>
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30 disabled:opacity-50"
      >
        <Check className="h-4 w-4" /> {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
      {message && <p className="mt-3 font-mono text-xs text-gray-500">{message}</p>}
    </div>
  );
}
