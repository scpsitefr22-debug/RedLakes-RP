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
  Lock,
} from "lucide-react";
import { apiFetch, checkApiAvailable } from "@/lib/api";
import { type PaginatedResult, buildQueryString } from "@/lib/platform-types";
import { siteConfig } from "@/config/site";
import { findGradeMeta } from "@/data/rp-grades";
import { SITE_SECTION_LABELS, type SiteSection } from "@/lib/grade-access";
import { getAccessZoneLabel } from "@/lib/grade-labels";
import { MetricCard } from "@/components/ui/MetricCard";
import { JargonTooltip } from "@/components/ui/JargonTooltip";
import { CareerTimeline } from "@/components/dashboard/CareerTimeline";
import { MissionsWidget } from "@/components/dashboard/MissionsWidget";
import { CharacterSwitcher } from "@/components/dashboard/CharacterSwitcher";
import { MinecraftHead } from "@/components/ui/MinecraftHead";
import { isCityFaction } from "@/lib/faction-stats";
import { getFactionTheme } from "@/lib/faction-theme";

interface PlayerData {
  grade: string;
  /** Habilitation réelle calculée par l'API (grade en base). */
  clearanceLevel?: number;
  /** Grade en base : ses accès sont réglés dans la grille staff et priment sur le catalogue figé. */
  gradeInfo?: {
    description: string | null;
    siteSections: string[];
    accessZones: string[];
  } | null;
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
    redlakesUsername?: string | null;
    hasPassword?: boolean;
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

/**
 * Photo de la carte d'accès : la tête du personnage Minecraft (style pixel,
 * toujours à jour), puis l'avatar du compte, puis une silhouette si aucune
 * image ne répond (ex. avatar Discord périmé).
 */
function AgentPhoto({ minecraftUsername, fallbackUrl }: { minecraftUsername: string; fallbackUrl?: string | null }) {
  const [fallbackFailed, setFallbackFailed] = useState(false);
  // Repli : l'avatar du compte (Discord), puis une icône neutre.
  const fallback =
    fallbackUrl && !fallbackFailed ? (
      <Image
        src={fallbackUrl}
        alt={minecraftUsername}
        width={112}
        height={112}
        unoptimized
        onError={() => setFallbackFailed(true)}
        className="h-full w-full object-cover [image-rendering:pixelated]"
      />
    ) : (
      <span className="flex h-full w-full items-center justify-center bg-black/40 text-gray-600">
        <User className="h-10 w-10" />
      </span>
    );
  return minecraftUsername ? <MinecraftHead username={minecraftUsername} fallback={fallback} /> : fallback;
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
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
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

  const setPassword = async () => {
    if (newPassword.length < 8) {
      setPasswordMsg("8 caractères minimum.");
      return;
    }
    if (!player?.user.redlakesUsername && !newUsername.trim()) {
      setPasswordMsg("Choisissez un pseudo de connexion.");
      return;
    }
    if (player?.user.hasPassword && !currentPassword) {
      setPasswordMsg("Renseignez votre mot de passe actuel.");
      return;
    }
    setSettingPassword(true);
    setPasswordMsg(null);
    try {
      await apiFetch("/auth/set-password", {
        method: "PATCH",
        body: JSON.stringify({
          password: newPassword,
          ...(newUsername.trim() && { username: newUsername.trim() }),
          ...(currentPassword && { currentPassword }),
        }),
      });
      setNewPassword("");
      setNewUsername("");
      setCurrentPassword("");
      setPasswordMsg(
        player?.user.hasPassword
          ? "Mot de passe modifié."
          : "Mot de passe défini — utilisable dès la prochaine connexion.",
      );
      await refreshProfile();
    } catch (err) {
      setPasswordMsg(err instanceof Error ? err.message : "Échec de l'enregistrement.");
    } finally {
      setSettingPassword(false);
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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-mono mb-3 flex items-center gap-2" style={{ color: theme.color }}>
            <span className="h-px w-8" style={{ background: theme.color }} aria-hidden />
            Dossier personnel — {theme.label}
          </p>
          <h1 className="font-display text-5xl font-extrabold text-white">Tableau de bord</h1>
        </div>
        <button
          onClick={logout}
          className="label-mono flex items-center gap-2 border border-line px-4 py-2.5 text-[10px] text-gray-400 transition-colors hover:border-line-strong hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Clôturer la session
        </button>
      </div>

      {/* Carte d'accès du Site-12 */}
      {(() => {
        const rpName = [player.rpFirstName, player.rpLastName].filter(Boolean).join(" ");
        const displayName = rpName || player.user.discordUsername || player.user.minecraftUsername;
        const level = Math.min(5, Math.max(1, player.clearanceLevel ?? 1));
        const levelColor = ["#9ca3af", "#60a5fa", "#fcd34d", "#fb923c", "#ef4444"][level - 1];
        const matricule = (player.user.minecraftUuid ?? "").replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase() || "------";
        const description = player.gradeInfo?.description ?? findGradeMeta(player.grade)?.description;
        const fields = [
          { label: "Grade", value: player.grade, term: "grade" as const },
          { label: "Faction", value: player.faction, term: "faction" as const },
          ...(player.teamName ? [{ label: "Équipe", value: player.teamName, term: "equipe" as const }] : []),
        ];
        // La ville ignore tout de la Fondation : carte d'identité municipale, sans habilitation.
        const factionSlug = player.factionInfo?.slug ?? "civil";
        const city = isCityFaction(factionSlug);
        const cardTitle =
          factionSlug === "fondation"
            ? "Fondation SCP — Carte d'accès — Site-12"
            : city
              ? "Ville de Redlakes — Carte d'identité"
              : `${theme.label} — Carte de membre`;
        return (
          <section className="relative mb-8 overflow-hidden border border-line-strong bg-gradient-to-br from-[#121821] to-[#0a0e13] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]">
            <div className="h-1.5" style={{ background: theme.color }} aria-hidden />
            <div className="flex items-center justify-between border-b border-line px-6 py-2.5">
              <p className="label-mono text-[10px] text-gray-400">{cardTitle}</p>
              <p className="label-mono text-[10px] text-gray-500">Matricule {matricule}</p>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto]">
              <div className="relative h-28 w-28 shrink-0 border border-line-strong bg-black/50 p-1.5">
                <AgentPhoto minecraftUsername={player.user.minecraftUsername} fallbackUrl={player.user.avatarUrl} />
                <span className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2" style={{ borderColor: theme.color }} />
                <span className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2" style={{ borderColor: theme.color }} />
              </div>

              <div className="min-w-0">
                <p className="font-display truncate text-4xl font-extrabold uppercase leading-none text-white">
                  {displayName}
                </p>
                <p className="label-mono mt-2 text-[10px] text-gray-500">
                  {player.user.minecraftUsername}
                  {player.user.discordLinked && (
                    <span className="ml-3 inline-flex items-center gap-1 text-[#aab1ff]">
                      <MessageCircle className="h-3 w-3" />
                      {player.user.discordUsername ?? "Discord vérifié"}
                    </span>
                  )}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  {fields.map((f) => (
                    <div key={f.label} className="min-w-0">
                      <dt className="label-mono flex items-center gap-1 text-[9px] text-gray-500">
                        {f.label} <JargonTooltip term={f.term} />
                      </dt>
                      <dd className="mt-0.5 truncate text-sm font-semibold text-gray-100">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                {description && <p className="mt-4 max-w-xl text-xs leading-relaxed text-gray-500">{description}</p>}
              </div>

              <div className="flex items-stretch gap-4 sm:col-span-2 lg:col-span-1 lg:flex-col lg:items-end">
                {!city && (
                  <div className="flex min-w-[8.5rem] flex-col justify-center border px-4 py-3 text-center" style={{ borderColor: levelColor }}>
                    <span className="label-mono text-[9px] text-gray-400">Habilitation</span>
                    <span className="font-display text-5xl font-extrabold leading-none" style={{ color: levelColor }}>
                      {level}
                    </span>
                    <span className="label-mono text-[9px]" style={{ color: levelColor }}>
                      sur 5
                    </span>
                  </div>
                )}
                <div
                  className="h-12 flex-1 opacity-70 lg:w-[8.5rem] lg:flex-none"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, #cfd6df 0 2px, transparent 2px 4px, #cfd6df 4px 5px, transparent 5px 9px, #cfd6df 9px 12px, transparent 12px 14px)",
                  }}
                  aria-hidden
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-3">
              <Link
                href="/intranet"
                className="font-display inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:text-redlake-glow"
              >
                <Terminal className="h-4 w-4 text-redlake-glow" />
                Ouvrir le terminal intranet →
              </Link>
              {player.roleUpdatedAt && (
                <p className="label-mono text-[9px] text-gray-600">
                  Grade mis à jour le {new Date(player.roleUpdatedAt).toLocaleString("fr-FR")}
                </p>
              )}
            </div>
          </section>
        );
      })()}

      <CharacterSwitcher
        onSwitched={refreshProfile}
        canDelete={player.user.role === "STAFF" || player.user.role === "ADMIN"}
      />

      {(() => {
        const meta = player.gradeInfo ?? findGradeMeta(player.grade);
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
                Zones du site : {meta.accessZones.map(getAccessZoneLabel).join(", ")}
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

      <section className="mb-8 panel-flat rounded-lg p-6">
        <h3 className="mb-2 flex items-center gap-2 font-bold text-white">
          <Lock className="h-5 w-5 text-redlake-glow" />
          {player.user.hasPassword ? "Changer mon mot de passe" : "Définir mon mot de passe"}
        </h3>
        <p className="mb-3 text-sm text-gray-500">
          {player.user.hasPassword
            ? "Modifiable à tout moment — renseignez votre mot de passe actuel pour confirmer."
            : "Votre compte n'a pas encore de mot de passe — vous vous êtes connecté via Discord. Définissez-en un pour pouvoir vous reconnecter directement avec votre pseudo."}
        </p>
        <div className="flex flex-wrap gap-2">
          {!player.user.redlakesUsername && (
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Pseudo de connexion"
              autoComplete="username"
              className="min-w-[180px] flex-1 rounded border border-metal bg-black px-4 py-2 font-mono text-sm text-white outline-none focus:border-redlake"
            />
          )}
          {player.user.hasPassword && (
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Mot de passe actuel"
              autoComplete="current-password"
              className="min-w-[180px] flex-1 rounded border border-metal bg-black px-4 py-2 font-mono text-sm text-white outline-none focus:border-redlake"
            />
          )}
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nouveau mot de passe (8 caractères min.)"
            autoComplete="new-password"
            className="min-w-[240px] flex-1 rounded border border-metal bg-black px-4 py-2 font-mono text-sm text-white outline-none focus:border-redlake"
          />
          <button
            onClick={setPassword}
            disabled={settingPassword}
            className="rounded border border-redlake/40 bg-redlake/10 px-4 py-2 font-mono text-xs text-redlake-glow hover:text-white disabled:opacity-50"
          >
            {settingPassword ? "Enregistrement..." : player.user.hasPassword ? "Changer" : "Définir"}
          </button>
        </div>
        {passwordMsg && (
          <p className="mt-2 font-mono text-xs text-gray-400">{passwordMsg}</p>
        )}
      </section>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <MetricCard icon={Clock} label="Temps de service" value={formatPlaytime(player.playtime)} />
        <MetricCard icon={CalendarDays} label="Ancienneté" value={formatSeniority(player.seniority)} />
        <MetricCard icon={User} label="Statut" value={player.grade} />
        <MetricCard icon={Award} label="Réputation" value={`${player.reputation}/100`} tooltip="reputation" />
        <MetricCard icon={AlertTriangle} label="Sanctions" value={player.sanctions} tooltip="sanction" />
      </div>

      <MissionsWidget />

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
