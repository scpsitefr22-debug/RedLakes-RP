"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Target, Plus, Check, X, RotateCcw } from "lucide-react";

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: string | null;
  status: "ASSIGNED" | "COMPLETED" | "FAILED" | "CANCELLED";
  dueAt: string | null;
  createdByLabel: string | null;
  resolvedByLabel: string | null;
  assignedPlayer: {
    id: string;
    rpFirstName: string | null;
    rpLastName: string | null;
    grade: string;
    user: { minecraftUsername: string | null };
  } | null;
  assignedTeam: { id: string; name: string } | null;
}

interface PlayerOption {
  id: string;
  rpFirstName: string | null;
  rpLastName: string | null;
  user: { minecraftUsername: string | null };
}

interface TeamOption {
  id: string;
  name: string;
}

const STATUS_LABELS: Record<Mission["status"], string> = {
  ASSIGNED: "En cours",
  COMPLETED: "Terminée",
  FAILED: "Échouée",
  CANCELLED: "Annulée",
};

const STATUS_COLORS: Record<Mission["status"], string> = {
  ASSIGNED: "text-yellow-400 border-yellow-400/30",
  COMPLETED: "text-green-400 border-green-400/30",
  FAILED: "text-red-400 border-red-400/30",
  CANCELLED: "text-gray-500 border-metal",
};

const inputClass =
  "w-full rounded border border-metal bg-black px-3 py-2 text-sm text-white outline-none focus:border-redlake";

function playerLabel(p: PlayerOption) {
  const rpName = [p.rpFirstName, p.rpLastName].filter(Boolean).join(" ");
  return rpName ? `${rpName} (${p.user.minecraftUsername ?? "?"})` : (p.user.minecraftUsername ?? p.id);
}

export default function StaffMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    reward: "",
    dueAt: "",
    targetType: "player" as "player" | "team",
    targetId: "",
  });

  const load = async () => {
    try {
      const data = await apiFetch<Mission[]>("/missions/cms");
      setMissions(data);
    } catch {
      setError("Impossible de charger les missions — connectez-vous en staff (Officier ou plus).");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    apiFetch<PlayerOption[]>("/players").then(setPlayers).catch(() => undefined);
    apiFetch<TeamOption[]>("/teams").then(setTeams).catch(() => undefined);
  }, []);

  const createMission = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.targetId) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch("/missions", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          reward: form.reward.trim() || undefined,
          dueAt: form.dueAt || undefined,
          assignedPlayerId: form.targetType === "player" ? form.targetId : undefined,
          assignedTeamId: form.targetType === "team" ? form.targetId : undefined,
        }),
      });
      setForm({ title: "", description: "", reward: "", dueAt: "", targetType: "player", targetId: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création");
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (id: string, status: Mission["status"]) => {
    setSaving(true);
    try {
      await apiFetch(`/missions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const targetOptions = form.targetType === "player" ? players : teams;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
        GESTION DES MISSIONS — STAFF
      </p>
      <h1 className="mb-4 flex items-center gap-2 text-4xl font-bold text-white">
        <Target className="h-8 w-8 text-redlake-glow" /> Missions
      </h1>
      <p className="mb-8 text-gray-500">
        Assignez des objectifs à un joueur ou une équipe, suivez leur résolution.
      </p>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="mb-10 hologram-border rounded-lg p-6">
        <h2 className="mb-4 font-bold text-white">Nouvelle mission</h2>
        <div className="space-y-3">
          <input
            className={inputClass}
            placeholder="Titre"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <textarea
            rows={3}
            className={inputClass}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              placeholder="Récompense (optionnel)"
              value={form.reward}
              onChange={(e) => setForm((f) => ({ ...f, reward: e.target.value }))}
            />
            <input
              type="date"
              className={inputClass}
              value={form.dueAt}
              onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <select
              className={inputClass}
              value={form.targetType}
              onChange={(e) =>
                setForm((f) => ({ ...f, targetType: e.target.value as "player" | "team", targetId: "" }))
              }
            >
              <option value="player">Joueur</option>
              <option value="team">Équipe</option>
            </select>
            <select
              className={inputClass}
              value={form.targetId}
              onChange={(e) => setForm((f) => ({ ...f, targetId: e.target.value }))}
            >
              <option value="">— Choisir —</option>
              {form.targetType === "player"
                ? (targetOptions as PlayerOption[]).map((p) => (
                    <option key={p.id} value={p.id}>{playerLabel(p)}</option>
                  ))
                : (targetOptions as TeamOption[]).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
            </select>
          </div>
          <button
            onClick={createMission}
            disabled={saving || !form.title.trim() || !form.description.trim() || !form.targetId}
            className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Créer
          </button>
        </div>
      </section>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {!loading && missions.length === 0 && (
        <p className="text-gray-500">Aucune mission enregistrée.</p>
      )}

      <div className="space-y-3">
        {missions.map((m) => (
          <div key={m.id} className="hologram-border rounded-lg p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-white">{m.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{m.description}</p>
              </div>
              <span
                className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] uppercase ${STATUS_COLORS[m.status]}`}
              >
                {STATUS_LABELS[m.status]}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-gray-600">
              {m.assignedPlayer && (
                <span>
                  Joueur :{" "}
                  {[m.assignedPlayer.rpFirstName, m.assignedPlayer.rpLastName].filter(Boolean).join(" ") ||
                    m.assignedPlayer.user.minecraftUsername ||
                    m.assignedPlayer.id}
                </span>
              )}
              {m.assignedTeam && <span>Équipe : {m.assignedTeam.name}</span>}
              {m.reward && <span>Récompense : {m.reward}</span>}
              {m.dueAt && <span>Échéance : {new Date(m.dueAt).toLocaleDateString("fr-FR")}</span>}
              {m.createdByLabel && <span>Créée par {m.createdByLabel}</span>}
              {m.resolvedByLabel && <span>Résolue par {m.resolvedByLabel}</span>}
            </div>
            <div className="mt-3 flex gap-2">
              {m.status === "ASSIGNED" ? (
                <>
                  <button
                    onClick={() => setStatus(m.id, "COMPLETED")}
                    disabled={saving}
                    className="flex items-center gap-1 rounded border border-green-400/30 px-3 py-1 font-mono text-xs text-green-400 hover:bg-green-400/10 disabled:opacity-50"
                  >
                    <Check className="h-3 w-3" /> Terminée
                  </button>
                  <button
                    onClick={() => setStatus(m.id, "FAILED")}
                    disabled={saving}
                    className="flex items-center gap-1 rounded border border-red-400/30 px-3 py-1 font-mono text-xs text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" /> Échouée
                  </button>
                  <button
                    onClick={() => setStatus(m.id, "CANCELLED")}
                    disabled={saving}
                    className="flex items-center gap-1 rounded border border-metal px-3 py-1 font-mono text-xs text-gray-500 hover:text-white disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setStatus(m.id, "ASSIGNED")}
                  disabled={saving}
                  className="flex items-center gap-1 rounded border border-metal px-3 py-1 font-mono text-xs text-gray-500 hover:text-white disabled:opacity-50"
                >
                  <RotateCcw className="h-3 w-3" /> Rouvrir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
