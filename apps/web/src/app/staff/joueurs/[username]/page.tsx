"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, ShieldAlert, History, Plus, X, Check, KeyRound, UserX } from "lucide-react";

interface PlayerProfile {
  grade: string;
  faction: string;
  teamName: string | null;
  rpFirstName: string | null;
  rpLastName: string | null;
  sanctions: number;
  user: {
    minecraftUsername: string;
    avatarUrl: string | null;
    role: string;
    staffRank: string | null;
  };
}

const ROLES = ["PLAYER", "STAFF", "ADMIN"];
const STAFF_RANKS = ["SURVEILLANT", "OFFICIER", "COORDINATEUR_GENERAL"];
const STAFF_RANK_LABELS: Record<string, string> = {
  SURVEILLANT: "Surveillant",
  OFFICIER: "Officier",
  COORDINATEUR_GENERAL: "Coordinateur Général",
};

interface SanctionRow {
  id: string;
  type: string;
  status: string;
  reason: string;
  note: string | null;
  issuedAt: string;
  liftedAt: string | null;
}

interface CharacterRow {
  id: string;
  grade: string;
  faction: string;
  rpFirstName: string | null;
  rpLastName: string | null;
  createdAt: string;
  active: boolean;
}

interface AssignmentRow {
  id: string;
  entityType: string;
  entityId: string;
  role: string | null;
  startedAt: string;
  endedAt: string | null;
}

interface EntityOption {
  id: string;
  name: string;
}

const SANCTION_TYPES = ["AVERTISSEMENT", "BLAME", "MISE_A_PIED", "RETROGRADATION", "BANNISSEMENT"];

const inputClass =
  "w-full rounded border border-metal bg-black px-3 py-2 text-sm text-white outline-none focus:border-redlake";

export default function StaffPlayerPage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [characters, setCharacters] = useState<CharacterRow[]>([]);
  const [sanctions, setSanctions] = useState<SanctionRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [factions, setFactions] = useState<EntityOption[]>([]);
  const [departments, setDepartments] = useState<EntityOption[]>([]);
  const [teams, setTeams] = useState<EntityOption[]>([]);
  const [error, setError] = useState("");

  const [sanctionForm, setSanctionForm] = useState({ type: "AVERTISSEMENT", reason: "" });
  const [assignForm, setAssignForm] = useState({ entityType: "TEAM", entityId: "", role: "" });
  const [saving, setSaving] = useState(false);

  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const [roleValue, setRoleValue] = useState("PLAYER");
  const [rankValue, setRankValue] = useState("SURVEILLANT");
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleMessage, setRoleMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [prof, { id }] = await Promise.all([
        apiFetch<PlayerProfile>(`/players/${username}`),
        apiFetch<{ id: string }>(`/players/${username}/staff-id`),
      ]);
      setProfile(prof);
      setPlayerId(id);
      setRoleValue(prof.user.role);
      setRankValue(prof.user.staffRank ?? "SURVEILLANT");
      const [s, a, c] = await Promise.all([
        apiFetch<SanctionRow[]>(`/sanctions/player/${id}`),
        apiFetch<AssignmentRow[]>(`/assignments/player/${id}`),
        apiFetch<CharacterRow[]>(`/players/${username}/characters`),
      ]);
      setSanctions(s);
      setAssignments(a);
      setCharacters(c);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} — connectez-vous en staff pour gérer ce profil.`
          : "Erreur de chargement",
      );
    }
  }, [username]);

  useEffect(() => {
    load();
    apiFetch<EntityOption[]>("/factions").then(setFactions).catch(() => undefined);
    apiFetch<EntityOption[]>("/departments").then(setDepartments).catch(() => undefined);
    apiFetch<EntityOption[]>("/teams").then(setTeams).catch(() => undefined);
    apiFetch<{ authenticated: boolean; user?: { role: string } }>("/auth/me")
      .then((res) => setViewerRole(res.user?.role ?? null))
      .catch(() => undefined);
  }, [load]);

  const roleUnchanged =
    !!profile &&
    roleValue === profile.user.role &&
    (roleValue !== "STAFF" || rankValue === (profile.user.staffRank ?? "SURVEILLANT"));

  const updateRole = async () => {
    if (!profile || roleUnchanged) return;
    setRoleSaving(true);
    setRoleMessage("");
    try {
      await apiFetch(`/players/${username}/role`, {
        method: "PATCH",
        body: JSON.stringify({
          role: roleValue,
          staffRank: roleValue === "STAFF" ? rankValue : undefined,
        }),
      });
      setRoleMessage(
        `Rôle mis à jour : ${roleValue}${roleValue === "STAFF" ? ` (${STAFF_RANK_LABELS[rankValue]})` : ""}.`,
      );
      await load();
    } catch (err) {
      setRoleMessage(err instanceof Error ? err.message : "Échec de la mise à jour du rôle");
    } finally {
      setRoleSaving(false);
    }
  };

  const entityOptions = assignForm.entityType === "FACTION" ? factions
    : assignForm.entityType === "DEPARTMENT" ? departments
    : teams;

  const createSanction = async () => {
    if (!playerId || !sanctionForm.reason.trim()) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch("/sanctions", {
        method: "POST",
        body: JSON.stringify({ playerId, type: sanctionForm.type, reason: sanctionForm.reason }),
      });
      setSanctionForm({ type: "AVERTISSEMENT", reason: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const liftSanction = async (id: string) => {
    setSaving(true);
    try {
      await apiFetch(`/sanctions/${id}`, { method: "PATCH", body: JSON.stringify({ status: "LEVEE" }) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const deleteSanction = async (id: string) => {
    if (!confirm("Supprimer définitivement cette sanction ?")) return;
    setSaving(true);
    try {
      await apiFetch(`/sanctions/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const deleteCharacter = async (id: string, label: string) => {
    if (!confirm(`Supprimer définitivement le personnage RP "${label}" ? Cette action est irréversible.`)) return;
    setSaving(true);
    setError("");
    try {
      const updated = await apiFetch<CharacterRow[]>(`/players/${username}/characters/${id}`, {
        method: "DELETE",
      });
      setCharacters(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const createAssignment = async () => {
    if (!playerId || !assignForm.entityId) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch("/assignments", {
        method: "POST",
        body: JSON.stringify({
          playerId,
          entityType: assignForm.entityType,
          entityId: assignForm.entityId,
          role: assignForm.role || undefined,
        }),
      });
      setAssignForm({ entityType: "TEAM", entityId: "", role: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const endAssignment = async (id: string) => {
    setSaving(true);
    try {
      await apiFetch(`/assignments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ endedAt: new Date().toISOString() }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const labelFor = (entityType: string, entityId: string) => {
    const pool = entityType === "FACTION" ? factions : entityType === "DEPARTMENT" ? departments : teams;
    return pool.find((e) => e.id === entityId)?.name ?? entityId;
  };

  if (error && !profile) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-red-400">{error}</div>;
  }

  if (!profile) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/staff/joueurs" className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Retour à la gestion des joueurs
      </Link>

      <h1 className="mb-1 text-3xl font-bold text-white">
        {[profile.rpFirstName, profile.rpLastName].filter(Boolean).join(" ") || profile.user.minecraftUsername}
      </h1>
      <p className="mb-8 font-mono text-sm text-gray-500">
        {profile.user.minecraftUsername} — {profile.grade} — {profile.faction}
        {profile.teamName ? ` — ${profile.teamName}` : ""}
      </p>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">{error}</div>
      )}

      {/* Rôle du compte (ADMIN uniquement) */}
      {viewerRole === "ADMIN" && (
        <section className="mb-10 hologram-border rounded-lg p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <KeyRound className="h-5 w-5 text-redlake-glow" /> Rôle du compte
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            Rôle actuel : <span className="font-mono text-white">{profile.user.role}</span>
            {profile.user.staffRank && (
              <> — <span className="font-mono text-white">{STAFF_RANK_LABELS[profile.user.staffRank]}</span></>
            )}
          </p>
          <div className={roleValue === "STAFF" ? "grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]" : "grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]"}>
            <select className={inputClass} value={roleValue} onChange={(e) => setRoleValue(e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {roleValue === "STAFF" && (
              <select className={inputClass} value={rankValue} onChange={(e) => setRankValue(e.target.value)}>
                {STAFF_RANKS.map((r) => <option key={r} value={r}>{STAFF_RANK_LABELS[r]}</option>)}
              </select>
            )}
            <button
              onClick={updateRole}
              disabled={roleSaving || roleUnchanged}
              className="flex items-center gap-1 rounded border border-redlake bg-redlake/20 px-3 text-sm text-white hover:bg-redlake/30 disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> Confirmer
            </button>
          </div>
          {roleValue === "STAFF" && (
            <p className="mt-2 font-mono text-xs text-gray-600">
              Surveillant : candidatures/rapports. Officier : + sanctions/affectations. Coordinateur Général : + gestion du contenu (wiki, personnages, événements, actualités, carte, catalogues).
            </p>
          )}
          {roleMessage && <p className="mt-2 font-mono text-xs text-gray-500">{roleMessage}</p>}
        </section>
      )}

      {/* Personnages RP (suppression reservee au staff) */}
      <section className="mb-10 hologram-border rounded-lg p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
          <UserX className="h-5 w-5 text-redlake-glow" /> Personnages RP ({characters.length})
        </h2>
        <div className="space-y-2">
          {characters.length === 0 && <p className="text-sm text-gray-600">Aucun personnage.</p>}
          {characters.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded border border-metal p-3 text-sm">
              <div className="min-w-0">
                <p className="text-white">
                  {[c.rpFirstName, c.rpLastName].filter(Boolean).join(" ") || "Sans nom"}
                  {c.active && <span className="ml-2 rounded border border-redlake/40 bg-redlake/10 px-1.5 py-0.5 font-mono text-[10px] text-redlake-glow">ACTIF</span>}
                </p>
                <p className="font-mono text-xs text-gray-600">
                  {c.grade} — {c.faction} — créé le {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <button
                onClick={() => deleteCharacter(c.id, [c.rpFirstName, c.rpLastName].filter(Boolean).join(" ") || "Sans nom")}
                disabled={saving}
                className="rounded border border-red-400/40 p-1.5 text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                title="Supprimer ce personnage"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sanctions */}
      <section className="mb-10 hologram-border rounded-lg p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
          <ShieldAlert className="h-5 w-5 text-redlake-glow" /> Sanctions ({profile.sanctions})
        </h2>

        <div className="mb-4 space-y-2">
          {sanctions.length === 0 && <p className="text-sm text-gray-600">Aucune sanction enregistrée.</p>}
          {sanctions.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 rounded border border-metal p-3 text-sm">
              <div className="min-w-0">
                <p className="text-white">{s.type} — {s.reason}</p>
                <p className="font-mono text-xs text-gray-600">
                  {new Date(s.issuedAt).toLocaleDateString("fr-FR")} — {s.status}
                  {s.liftedAt ? ` (levée le ${new Date(s.liftedAt).toLocaleDateString("fr-FR")})` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {s.status === "ACTIVE" && (
                  <button onClick={() => liftSanction(s.id)} disabled={saving} className="rounded border border-green-400/40 p-1.5 text-green-400 hover:bg-green-400/10 disabled:opacity-50" title="Lever">
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => deleteSanction(s.id)} disabled={saving} className="rounded border border-red-400/40 p-1.5 text-red-400 hover:bg-red-400/10 disabled:opacity-50" title="Supprimer">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <select className={inputClass} value={sanctionForm.type} onChange={(e) => setSanctionForm((f) => ({ ...f, type: e.target.value }))}>
            {SANCTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input className={inputClass} placeholder="Motif" value={sanctionForm.reason} onChange={(e) => setSanctionForm((f) => ({ ...f, reason: e.target.value }))} />
          <button onClick={createSanction} disabled={saving || !sanctionForm.reason.trim()} className="flex items-center gap-1 rounded border border-redlake bg-redlake/20 px-3 text-sm text-white hover:bg-redlake/30 disabled:opacity-50">
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>
      </section>

      {/* Affectations */}
      <section className="hologram-border rounded-lg p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
          <History className="h-5 w-5 text-redlake-glow" /> Historique d&apos;affectations
        </h2>

        <div className="mb-4 space-y-2">
          {assignments.length === 0 && <p className="text-sm text-gray-600">Aucune affectation enregistrée.</p>}
          {assignments.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded border border-metal p-3 text-sm">
              <div className="min-w-0">
                <p className="text-white">
                  {a.entityType} — {labelFor(a.entityType, a.entityId)}{a.role ? ` (${a.role})` : ""}
                </p>
                <p className="font-mono text-xs text-gray-600">
                  Depuis le {new Date(a.startedAt).toLocaleDateString("fr-FR")}
                  {a.endedAt ? ` — terminée le ${new Date(a.endedAt).toLocaleDateString("fr-FR")}` : " — en cours"}
                </p>
              </div>
              {!a.endedAt && (
                <button onClick={() => endAssignment(a.id)} disabled={saving} className="rounded border border-red-400/40 p-1.5 text-red-400 hover:bg-red-400/10 disabled:opacity-50" title="Terminer">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_1fr_auto]">
          <select
            className={inputClass}
            value={assignForm.entityType}
            onChange={(e) => setAssignForm({ entityType: e.target.value, entityId: "", role: "" })}
          >
            <option value="FACTION">Faction</option>
            <option value="DEPARTMENT">Département</option>
            <option value="TEAM">Équipe</option>
          </select>
          <select className={inputClass} value={assignForm.entityId} onChange={(e) => setAssignForm((f) => ({ ...f, entityId: e.target.value }))}>
            <option value="">— Choisir —</option>
            {entityOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <input className={inputClass} placeholder="Rôle (optionnel)" value={assignForm.role} onChange={(e) => setAssignForm((f) => ({ ...f, role: e.target.value }))} />
          <button onClick={createAssignment} disabled={saving || !assignForm.entityId} className="flex items-center gap-1 rounded border border-redlake bg-redlake/20 px-3 text-sm text-white hover:bg-redlake/30 disabled:opacity-50">
            <Plus className="h-4 w-4" /> Assigner
          </button>
        </div>
      </section>
    </div>
  );
}
