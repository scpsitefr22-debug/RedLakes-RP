"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, KeyRound, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { usePlayerSession } from "@/hooks/usePlayerSession";

type Role = "PLAYER" | "STAFF" | "ADMIN";

interface Account {
  id: string;
  username: string | null;
  minecraftUsername: string | null;
  discordUsername: string | null;
  role: Role;
  staffRank: string | null;
  onboarded: boolean;
  characterName: string | null;
  grade: string | null;
  createdAt: string;
}

const ROLE_LABELS: Record<Role, string> = {
  PLAYER: "Joueur",
  STAFF: "Staff",
  ADMIN: "Administrateur",
};
const ROLES: Role[] = ["PLAYER", "STAFF", "ADMIN"];
const STAFF_RANKS = ["SURVEILLANT", "OFFICIER", "COORDINATEUR_GENERAL"];
const STAFF_RANK_LABELS: Record<string, string> = {
  SURVEILLANT: "Surveillant",
  OFFICIER: "Officier",
  COORDINATEUR_GENERAL: "Coordinateur général",
};

const inputClass =
  "w-full rounded border border-metal bg-black px-3 py-2 text-sm text-white outline-none focus:border-redlake";

function accountName(a: Account) {
  return a.username ?? a.minecraftUsername ?? a.discordUsername ?? "Compte sans nom";
}

function AccountRow({ account, onSaved }: { account: Account; onSaved: (a: Account) => void }) {
  const [role, setRole] = useState<Role>(account.role);
  const [rank, setRank] = useState(account.staffRank ?? "SURVEILLANT");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const changed =
    role !== account.role || (role === "STAFF" && rank !== (account.staffRank ?? "SURVEILLANT"));

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch(`/players/accounts/${account.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role, staffRank: role === "STAFF" ? rank : undefined }),
      });
      onSaved({ ...account, role, staffRank: role === "STAFF" ? rank : null });
      setMessage({ ok: true, text: "Accès mis à jour." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Échec de la mise à jour" });
    } finally {
      setSaving(false);
    }
  };

  const details = [
    account.username && `Connexion : ${account.username}`,
    account.minecraftUsername && `Minecraft : ${account.minecraftUsername}`,
    account.discordUsername && `Discord : ${account.discordUsername}`,
  ].filter(Boolean);

  return (
    <div className="hologram-border rounded-lg p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-bold text-white">
            {accountName(account)}
            {!account.onboarded && (
              <span className="rounded border border-yellow-500/40 px-1.5 py-0.5 font-mono text-[10px] font-normal text-yellow-500/90">
                Inscription non terminée
              </span>
            )}
          </p>
          <p className="font-mono text-xs text-gray-600">
            {details.length > 0 ? details.join(" · ") : "Aucun identifiant lié"}
          </p>
          <p className="font-mono text-xs text-gray-600">
            {account.characterName || account.grade
              ? `Personnage : ${[account.characterName, account.grade].filter(Boolean).join(" — ")}`
              : "Aucun personnage"}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            className={`${inputClass} sm:w-44`}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            aria-label={`Rôle de ${accountName(account)}`}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          {role === "STAFF" && (
            <select
              className={`${inputClass} sm:w-48`}
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              aria-label={`Rang staff de ${accountName(account)}`}
            >
              {STAFF_RANKS.map((r) => (
                <option key={r} value={r}>
                  {STAFF_RANK_LABELS[r]}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={save}
            disabled={saving || !changed}
            className="flex items-center justify-center gap-1 rounded border border-redlake bg-redlake/20 px-4 py-2 text-sm text-white hover:bg-redlake/30 disabled:opacity-40"
          >
            <Check className="h-4 w-4" /> {saving ? "…" : "Enregistrer"}
          </button>
        </div>
      </div>
      {message && (
        <p className={`mt-2 font-mono text-xs ${message.ok ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

export default function StaffAccessPage() {
  const session = usePlayerSession();
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async (q: string) => {
    try {
      const rows = await apiFetch<Account[]>(
        `/players/accounts${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`,
      );
      setAccounts(rows);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible");
    }
  }, []);

  useEffect(() => {
    if (session.role !== "ADMIN") return;
    const timer = setTimeout(() => load(query), 250);
    return () => clearTimeout(timer);
  }, [query, session.role, load]);

  if (session.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="panel-elevated mx-auto max-w-md rounded-lg p-10">
          <p className="font-mono text-xs tracking-[0.3em] text-redlake-glow">ADMINISTRATEURS UNIQUEMENT</p>
          <h1 className="mt-4 text-2xl font-bold text-white">Donner des accès</h1>
          <p className="mt-4 text-sm text-gray-500">
            Seul un administrateur peut donner ou retirer un accès à un compte.
          </p>
        </div>
      </div>
    );
  }

  const handleSaved = (updated: Account) =>
    setAccounts((rows) => rows?.map((r) => (r.id === updated.id ? updated : r)) ?? null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
        ADMINISTRATION SITE-12 — ACCÈS
      </p>
      <h1 className="mb-4 flex items-center gap-3 text-4xl font-bold text-white">
        <KeyRound className="h-8 w-8 text-redlake-glow" /> Accès &amp; rôles
      </h1>
      <p className="mb-6 max-w-3xl text-gray-500">
        Cherche un compte, choisis le rôle qu&apos;il doit avoir, enregistre. Tous les comptes
        apparaissent ici, même ceux qui n&apos;ont pas encore de personnage. Chaque changement est
        journalisé. Un grade RP ne donne jamais d&apos;accès staff tout seul : seule cette action le
        fait.
      </p>

      <div className="mb-6 grid gap-3 text-sm text-gray-500 sm:grid-cols-3">
        <div className="hologram-border rounded-lg p-3">
          <p className="font-bold text-white">Joueur</p>
          <p>Le site normal, selon son grade.</p>
        </div>
        <div className="hologram-border rounded-lg p-3">
          <p className="font-bold text-white">Staff</p>
          <p>
            Surveillant : candidatures et rapports. Officier : + sanctions et affectations.
            Coordinateur général : + gestion du contenu.
          </p>
        </div>
        <div className="hologram-border rounded-lg p-3">
          <p className="font-bold text-white">Administrateur</p>
          <p>Accès total, dont celui de donner ou retirer les accès.</p>
        </div>
      </div>

      <p className="mb-6 text-sm text-gray-600">
        Le contenu classifié, lui, suit le <strong className="text-gray-400">grade</strong>{" "}
        du personnage (habilitation + département) : pour ouvrir un département à quelqu&apos;un,
        change son grade depuis sa fiche dans{" "}
        <Link href="/staff/joueurs" className="text-redlake-glow hover:underline">
          Gestion des joueurs
        </Link>
        . Ce que chaque grade ouvre se règle dans la{" "}
        <Link href="/staff/grades/acces" className="text-redlake-glow hover:underline">
          grille des accès par grade
        </Link>
        .
      </p>

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
        <input
          className={`${inputClass} pl-9`}
          placeholder="Chercher un compte (pseudo, Minecraft, Discord)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {!accounts && !error && (
        <div className="py-12 text-center font-mono text-gray-500">Chargement des comptes…</div>
      )}

      {accounts && accounts.length === 0 && (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          Aucun compte ne correspond.
        </div>
      )}

      <div className="space-y-3">
        {accounts?.map((a) => (
          <AccountRow key={a.id} account={a} onSaved={handleSaved} />
        ))}
      </div>
    </div>
  );
}
