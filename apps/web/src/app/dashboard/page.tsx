"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Clock,
  Award,
  AlertTriangle,
  Package,
  LogOut,
  RefreshCw,
  MessageCircle,
  Terminal,
  CalendarDays,
} from "lucide-react";
import { apiFetch, checkApiAvailable } from "@/lib/api";
import { type PaginatedResult, buildQueryString } from "@/lib/platform-types";
import { siteConfig } from "@/config/site";
import { findGradeMeta } from "@/data/rp-grades";
import { SITE_SECTION_LABELS, type SiteSection } from "@/lib/grade-access";
import { MetricCard } from "@/components/ui/MetricCard";
import { CareerTimeline } from "@/components/dashboard/CareerTimeline";
import { getFactionTheme } from "@/lib/faction-theme";

interface PlayerData {
  grade: string;
  faction: string;
  factionInfo?: { slug: string } | null;
  teamName?: string | null;
  rpFirstName?: string | null;
  rpLastName?: string | null;
  playtime: number;
  reputation: number;
  sanctions: number;
  medals: string[];
  achievements: { name: string; date: string }[];
  roleUpdatedAt?: string;
  seniority?: string;
  user: {
    minecraftUsername: string;
    minecraftUuid: string;
    avatarUrl: string;
    role: string;
    discordLinked?: boolean;
    discordUsername?: string | null;
    createdAt: string;
  };
}

async function loadPlayerProfile(): Promise<PlayerData | null> {
  try {
    const data = await apiFetch<{ authenticated: boolean }>("/auth/me");
    if (!data.authenticated) return null;
    return apiFetch<PlayerData>("/players/me");
  } catch {
    return null;
  }
}

function formatPlaytime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function formatSeniority(iso?: string) {
  if (!iso) return "—";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "Aujourd'hui";
  if (days < 30) return `${days} j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years} an${years > 1 ? "s" : ""} ${remMonths} mois` : `${years} an${years > 1 ? "s" : ""}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [rpFirstName, setRpFirstName] = useState("");
  const [rpLastName, setRpLastName] = useState("");
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [identityMsg, setIdentityMsg] = useState<string | null>(null);
  const [myApplications, setMyApplications] = useState<
    { id: string; type: string; status: string; createdAt: string }[]
  >([]);

  const refreshProfile = async () => {
    const p = await loadPlayerProfile();
    if (p) {
      setPlayer(p);
      setRpFirstName(p.rpFirstName ?? "");
      setRpLastName(p.rpLastName ?? "");
    }
    try {
      const apps = await apiFetch<
        PaginatedResult<{
          id: string;
          type: string;
          status: string;
          createdAt: string;
        }>
      >(`/applications/me${buildQueryString({ limit: 10 })}`);
      setMyApplications(apps.items);
    } catch {
      setMyApplications([]);
    }
    return p;
  };

  const saveRpIdentity = async () => {
    setSavingIdentity(true);
    setIdentityMsg(null);
    try {
      const updated = await apiFetch<PlayerData>("/players/me", {
        method: "PATCH",
        body: JSON.stringify({
          rpFirstName: rpFirstName.trim() || undefined,
          rpLastName: rpLastName.trim() || undefined,
        }),
      });
      setPlayer(updated);
      setIdentityMsg(
        updated.user.discordLinked
          ? "Identité enregistrée — pseudo Discord mis à jour."
          : "Identité enregistrée. Lie Discord pour synchroniser le pseudo.",
      );
    } catch {
      setIdentityMsg("Impossible d'enregistrer l'identité RP.");
    } finally {
      setSavingIdentity(false);
    }
  };

  useEffect(() => {
    (async () => {
      const online = await checkApiAvailable();
      if (online) {
        const p = await loadPlayerProfile();
        if (p) {
          setPlayer(p);
          setRpFirstName(p.rpFirstName ?? "");
          setRpLastName(p.rpLastName ?? "");
          setLoading(false);
          return;
        }
      }
      router.replace("/connexion");
    })();
  }, [router]);

  useEffect(() => {
    if (!player) return;
    const interval = setInterval(() => {
      refreshProfile();
    }, 30000);
    return () => clearInterval(interval);
  }, [player]);

  const generateDiscordCode = async () => {
    setSyncing(true);
    try {
      const res = await apiFetch<{ code: string }>("/auth/discord/code", {
        method: "POST",
      });
      setLinkCode(res.code);
    } catch {
      setLinkCode(null);
    } finally {
      setSyncing(false);
    }
  };

  const unlinkDiscord = async () => {
    setSyncing(true);
    try {
      await apiFetch("/auth/discord/unlink", { method: "POST" });
      await refreshProfile();
    } catch {
      setIdentityMsg("Impossible de délier Discord.");
    } finally {
      setSyncing(false);
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setPlayer(null);
    router.push("/connexion");
  };

  if (loading || !player) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-mono text-gray-500">Chargement du dossier agent...</p>
      </div>
    );
  }

  const theme = getFactionTheme(player.factionInfo?.slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p
            className="mb-2 font-mono text-xs tracking-widest"
            style={{ color: theme.color }}
          >
            DOSSIER PERSONNEL // {theme.label.toUpperCase()}
          </p>
          <h1 className="text-4xl font-bold text-white">Tableau de bord</h1>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded border border-metal px-4 py-2 font-mono text-xs text-gray-400 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Cloturer la session
        </button>
      </div>

      <div className="mb-8 panel-elevated rounded-lg p-6">
        <div className="flex flex-wrap items-start gap-5 sm:flex-nowrap">
          <Image
            src={player.user.avatarUrl}
            alt={player.user.minecraftUsername}
            width={80}
            height={80}
            className="shrink-0 rounded-full border border-redlake/30"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {player.user.discordUsername ?? player.user.minecraftUsername}
                </h2>
                {player.user.discordUsername &&
                  player.user.minecraftUsername &&
                  player.user.discordUsername !== player.user.minecraftUsername && (
                    <p className="font-mono text-xs text-gray-600">
                      Dossier : {player.user.minecraftUsername}
                    </p>
                  )}
              </div>
              {player.user.discordLinked && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded border border-[#5865F2]/30 bg-[#5865F2]/10 px-2 py-0.5 font-mono text-[10px] text-[#aab1ff]">
                  <MessageCircle className="h-3 w-3" />
                  {player.user.discordUsername ?? "Discord vérifié"}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded border border-redlake/30 bg-redlake/10 px-2.5 py-1 font-mono text-xs text-redlake-glow">
                {player.grade}
              </span>
              <span className="rounded border border-metal/50 px-2.5 py-1 font-mono text-xs text-gray-400">
                {player.faction}
              </span>
              {player.teamName && (
                <span className="rounded border border-metal/50 px-2.5 py-1 font-mono text-xs text-gray-400">
                  {player.teamName}
                </span>
              )}
            </div>

            {(player.rpFirstName || player.rpLastName) && (
              <p className="mt-3 text-sm text-gray-300">
                Identité RP : {[player.rpFirstName, player.rpLastName].filter(Boolean).join(" ")}
              </p>
            )}

            {(() => {
              const meta = findGradeMeta(player.grade);
              if (!meta) return null;
              return (
                <p className="mt-2 text-xs text-gray-500">{meta.description}</p>
              );
            })()}

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/intranet"
                className="inline-flex items-center gap-2 rounded border border-redlake/40 bg-redlake/10 px-4 py-2 font-mono text-xs text-redlake-glow hover:text-white"
              >
                <Terminal className="h-4 w-4" />
                Ouvrir le terminal intranet
              </Link>
              {player.roleUpdatedAt && (
                <p className="font-mono text-[10px] text-gray-600">
                  Dernière mise à jour du grade :{" "}
                  {new Date(player.roleUpdatedAt).toLocaleString("fr-FR")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {(() => {
        const meta = findGradeMeta(player.grade);
        if (!meta?.siteSections.length) return null;
        return (
          <section className="mb-8 panel-flat rounded-lg p-6">
            <h3 className="mb-4 font-bold text-white">Accès site selon votre grade</h3>
            <div className="flex flex-wrap gap-2">
              {meta.siteSections.map((s) => (
                <span
                  key={s}
                  className="rounded border border-metal/50 px-3 py-1 font-mono text-xs text-gray-400"
                >
                  {SITE_SECTION_LABELS[s as SiteSection] ?? s}
                </span>
              ))}
            </div>
            {meta.accessZones.length > 0 && (
              <p className="mt-4 font-mono text-xs text-gray-600">
                Zones in-game : {meta.accessZones.join(", ").toUpperCase()}
              </p>
            )}
          </section>
        );
      })()}

      <section className="mb-8 panel-flat rounded-lg p-6">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
          <User className="h-5 w-5 text-redlake-glow" />
          Identité RP
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Utilisée pour ton pseudo Discord :{" "}
          <span className="font-mono text-gray-400">
            {player.grade} · {[rpFirstName, rpLastName].filter(Boolean).join(" ") || "…"}
          </span>
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block font-mono text-xs text-gray-500">Prénom RP</span>
            <input
              type="text"
              value={rpFirstName}
              onChange={(e) => setRpFirstName(e.target.value)}
              maxLength={32}
              placeholder="Jean"
              className="w-full rounded border border-metal bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-redlake/50"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-xs text-gray-500">Nom RP</span>
            <input
              type="text"
              value={rpLastName}
              onChange={(e) => setRpLastName(e.target.value)}
              maxLength={32}
              placeholder="Dupont"
              className="w-full rounded border border-metal bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-redlake/50"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={saveRpIdentity}
            disabled={savingIdentity}
            className="rounded border border-redlake/40 bg-redlake/10 px-4 py-2 font-mono text-xs text-redlake-glow hover:text-white disabled:opacity-50"
          >
            {savingIdentity ? "Enregistrement…" : "Enregistrer l'identité"}
          </button>
          {identityMsg && (
            <p className="font-mono text-xs text-gray-400">{identityMsg}</p>
          )}
        </div>
        <p className="mt-3 font-mono text-[10px] text-gray-600">
          Sur Discord : /identite prenom nom — ou /sync-roles après liaison.
        </p>
      </section>

      <section className="mb-8 panel-flat rounded-lg p-6">
        <h3 className="mb-2 flex items-center gap-2 font-bold text-white">
          <MessageCircle className="h-5 w-5 text-[#aab1ff]" />
          Liaison Discord
        </h3>
        {player.user.discordLinked ? (
          <div className="space-y-3">
            <p className="font-mono text-sm text-green-400">
              Compte lié — lance <span className="text-white">/sync-roles</span> sur Discord
              pour appliquer grade + pseudo.
            </p>
            <button
              type="button"
              onClick={unlinkDiscord}
              disabled={syncing}
              className="rounded border border-metal px-4 py-2 font-mono text-xs text-gray-500 hover:text-white disabled:opacity-50"
            >
              Délier Discord
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Optionnel : liez un second compte Discord avec /link si vous utilisez
              un autre profil.
            </p>
            <button
              onClick={generateDiscordCode}
              disabled={syncing}
              className="rounded border border-[#5865F2]/40 bg-[#5865F2]/10 px-4 py-2 font-mono text-xs text-[#aab1ff] hover:text-white disabled:opacity-50"
            >
              {syncing ? "Generation..." : "Generer un code /link"}
            </button>
            {linkCode && (
              <div className="rounded border border-metal/50 bg-black/50 p-4 font-mono text-sm">
                <p className="text-gray-500">Sur Discord :</p>
                <p className="mt-1 text-white">/link {linkCode}</p>
                <a
                  href={siteConfig.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-[#aab1ff] hover:underline"
                >
                  Rejoindre le Discord
                </a>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => refreshProfile()}
          className="mt-4 flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-white"
        >
          <RefreshCw className="h-3 w-3" />
          Synchroniser le dossier
        </button>
      </section>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <MetricCard icon={Clock} label="Temps de service" value={formatPlaytime(player.playtime)} />
        <MetricCard icon={CalendarDays} label="Ancienneté" value={formatSeniority(player.seniority)} />
        <MetricCard icon={User} label="Statut" value={player.grade} />
        <MetricCard icon={Award} label="Réputation" value={`${player.reputation}/100`} />
        <MetricCard icon={AlertTriangle} label="Sanctions" value={player.sanctions} />
      </div>

      <CareerTimeline />

      <div className="grid gap-6 md:grid-cols-2">
        <section className="panel-flat rounded-lg p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
            <Award className="h-5 w-5 text-redlake-glow" /> Distinctions
          </h3>
          <div className="space-y-2">
            {player.achievements.length === 0 ? (
              <p className="text-sm text-gray-600">Aucune distinction enregistrée.</p>
            ) : (
              player.achievements.map((a) => (
                <div key={a.name} className="rounded border border-metal/50 p-3">
                  <p className="text-sm text-white">{a.name}</p>
                  <p className="font-mono text-xs text-gray-600">{a.date}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel-flat rounded-lg p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
            <Package className="h-5 w-5 text-redlake-glow" /> Médailles
          </h3>
          <div className="space-y-2">
            {player.medals.length === 0 ? (
              <p className="text-sm text-gray-600">Aucune médaille attribuée.</p>
            ) : (
              player.medals.map((m) => (
                <div key={m} className="rounded border border-metal/50 p-3">
                  <p className="text-sm text-white">{m}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {myApplications.length > 0 && (
        <section className="mb-8 panel-flat rounded-lg p-6">
          <h3 className="mb-4 font-bold text-white">Mes candidatures</h3>
          <ul className="space-y-2 font-mono text-sm">
            {myApplications.map((app) => (
              <li
                key={app.id}
                className="flex flex-wrap justify-between gap-2 rounded border border-metal/40 px-3 py-2 text-gray-400"
              >
                <span>{app.type}</span>
                <span
                  className={
                    app.status === "APPROVED"
                      ? "text-green-400"
                      : app.status === "REJECTED"
                        ? "text-red-400"
                        : "text-yellow-400"
                  }
                >
                  {app.status === "PENDING"
                    ? "En attente"
                    : app.status === "APPROVED"
                      ? "Validée"
                      : "Refusée"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-center">
        <Link href="/candidatures" className="font-mono text-sm text-redlake-glow hover:underline">
          Soumettre une candidature
        </Link>
      </p>
    </div>
  );
}
