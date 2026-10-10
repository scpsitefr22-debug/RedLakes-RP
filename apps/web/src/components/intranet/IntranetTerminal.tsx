"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Shield,
  Send,
  AlertTriangle,
  Wrench,
  ClipboardList,
  Terminal,
  Siren,
  Eye,
  Radio,
  Globe,
  Sparkles,
  Skull,
  MessageCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { MyReportsPanel } from "@/components/intranet/MyReportsPanel";
import { MunicipalAdvisory } from "@/components/intranet/MunicipalAdvisory";
import { FactionLog } from "@/components/intranet/FactionLog";
import {
  getAccessibleSectionsForAccount,
  SITE_SECTION_LABELS,
  type SiteSection,
} from "@/lib/grade-access";
import { getFactionTheme, type FactionTheme } from "@/lib/faction-theme";
import { cn } from "@/lib/utils";

type ReportType = "INCIDENT" | "AUTHORIZATION" | "MEMO" | "EQUIPMENT";

interface PlayerProfile {
  grade: string;
  faction: string;
  factionInfo?: { slug: string; name: string; color: string | null } | null;
  gradeInfo?: { siteSections?: string[]; departmentRef?: { name: string } | null } | null;
  rpFirstName?: string | null;
  rpLastName?: string | null;
  user: { minecraftUsername: string; role: string };
}

const REPORT_ICONS: Record<ReportType, typeof FileText> = {
  INCIDENT: AlertTriangle,
  AUTHORIZATION: Shield,
  MEMO: FileText,
  EQUIPMENT: Wrench,
};

function getReportTypes(theme: FactionTheme) {
  return (Object.keys(REPORT_ICONS) as ReportType[]).map((value) => ({
    value,
    label: theme.reportLabels[value],
    icon: REPORT_ICONS[value],
  }));
}

interface OpsBoardConfig {
  title: string;
  icon: typeof Siren;
  emptyText: string;
  footerText: string;
}

const OPS_BOARDS: Partial<Record<string, OpsBoardConfig>> = {
  police: {
    title: "Mains courantes actives",
    icon: Siren,
    emptyText: "Aucune intervention consignée pour le moment.",
    footerText: "Interventions du service — visibles par tout le RPD.",
  },
  aegis: {
    title: "Dossiers de supervision",
    icon: Eye,
    emptyText: "Aucun dossier de supervision ouvert pour le moment.",
    footerText: "Visible par les membres actuels du Directoire.",
  },
  chaos: {
    title: "Renseignement opérationnel",
    icon: Radio,
    emptyText: "Aucun renseignement remonté pour le moment.",
    footerText: "Ce qui circule ici ne remonte à personne d'autre.",
  },
  goc: {
    title: "Rapports d'anomalie",
    icon: Globe,
    emptyText: "Aucune anomalie signalée pour le moment.",
    footerText: "Coordination inter-cellules GOC.",
  },
  "main-serpent": {
    title: "Présages rompus",
    icon: Sparkles,
    emptyText: "Aucun présage rompu consigné pour le moment.",
    footerText: "Visible par ceux qui savent lire entre les lignes.",
  },
  crime: {
    title: "Activité du territoire",
    icon: Skull,
    emptyText: "Aucune activité consignée pour le moment.",
    footerText: "Ce qui se dit ici reste entre nous.",
  },
};

const SECTION_LINKS: Partial<Record<SiteSection, string>> = {
  "transmissions-public": "/transmissions",
  "transmissions-restricted": "/transmissions",
  "transmissions-classified": "/transmissions",
  mtf: "/factions/mtf",
  chambers: "/wiki",
  experiences: "/wiki",
  medical: "/departements/site-12",
  securite: "/departements/site-12",
  scientifique: "/departements/site-12",
  maintenance: "/departements/site-12",
  direction: "/departements/site-12",
  fondation: "/wiki",
  overview: "/departements/site-12",
};

const SECTION_TITLE =
  "font-display mb-4 flex items-center gap-2 text-xl font-bold uppercase tracking-wide text-white";

const FIELD =
  "w-full border border-line bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-redlake-glow";

interface FactionGrade {
  slug: string;
  name: string;
  tier: string;
}

export function IntranetTerminal() {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<ReportType>("MEMO");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reportsRefresh, setReportsRefresh] = useState(0);
  const [factionGrades, setFactionGrades] = useState<FactionGrade[]>([]);

  const load = useCallback(async () => {
    try {
      const auth = await apiFetch<{ authenticated: boolean }>("/auth/me");
      if (!auth.authenticated) {
        router.replace("/connexion");
        return;
      }
      const profile = await apiFetch<PlayerProfile>("/players/me");
      setPlayer(profile);

      const factionSlug = profile.factionInfo?.slug;
      if (factionSlug && factionSlug !== "fondation") {
        try {
          // Déjà dans l'ordre de la hiérarchie réglée par le staff (Grades & accès).
          const grades = await apiFetch<FactionGrade[]>(
            `/grades?branch=${factionSlug}`,
          );
          setFactionGrades(grades);
        } catch {
          setFactionGrades([]);
        }
      }
    } catch {
      router.replace("/connexion");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify({ type: reportType, subject, content }),
      });
      setSubject("");
      setContent("");
      // Hors Fondation, personne ne sait ce qu'est le Site-12 (pour la ville, c'est une base militaire).
      setMessage(
        player?.factionInfo?.slug === "fondation"
          ? "Rapport transmis au secrétariat du Site-12. Référence enregistrée."
          : "Rapport transmis à votre hiérarchie. Référence enregistrée.",
      );
      setReportsRefresh((k) => k + 1);
    } catch {
      setMessage("Échec de transmission — vérifiez votre session.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !player) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-mono text-gray-500">
        Initialisation du terminal intranet…
      </div>
    );
  }

  const departmentName = player.gradeInfo?.departmentRef?.name ?? null;
  const sections = getAccessibleSectionsForAccount(
    player.grade,
    player.user.role,
    player.gradeInfo?.siteSections,
  );
  const rpName = [player.rpFirstName, player.rpLastName].filter(Boolean).join(" ");
  const factionSlug = player.factionInfo?.slug ?? null;
  const theme = getFactionTheme(factionSlug);
  const isFondation = factionSlug === "fondation";

  return (
    <div className="space-y-8">
      <div className="panel-elevated overflow-hidden">
        <div className="h-1" style={{ background: theme.color }} aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-6 py-2.5">
          <p className="label-mono flex items-center gap-2 text-[10px]" style={{ color: theme.color }}>
            <Terminal className="h-3 w-3" />
            {theme.network}
          </p>
          <p className="label-mono text-[10px] text-gray-500">Session ouverte</p>
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <h2 className="font-display truncate text-4xl font-extrabold uppercase leading-none text-white">
              {rpName || player.user.minecraftUsername}
            </h2>
            <p className="mt-2 text-gray-300">
              {player.grade} <span className="text-gray-500">— {theme.label}</span>
            </p>
            <p className="mt-2 max-w-md text-sm text-gray-500">{theme.tagline}</p>
          </div>
          {departmentName && (
            <div className="border-l-2 pl-4" style={{ borderColor: theme.color }}>
              <p className="label-mono text-[9px] text-gray-500">Département</p>
              <p className="font-display text-2xl font-bold uppercase leading-tight text-white">
                {departmentName}
              </p>
            </div>
          )}
        </div>
        <div className="border-t border-line px-6 py-3">
          <Link
            href="/messagerie"
            className="font-display inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:text-redlake-glow"
          >
            <MessageCircle className="h-4 w-4" style={{ color: theme.color }} />
            Ouvrir la messagerie →
          </Link>
        </div>
      </div>

      {isFondation && (
        <section className="hologram-border p-6">
          <h3 className={SECTION_TITLE}>
            <Shield className="h-5 w-5 text-redlake-glow" />
            Secteurs accessibles
            <span className="label-mono ml-auto text-[10px] font-normal text-gray-500">
              {sections.length} ouverts
            </span>
          </h3>
          {/* Tous ces secteurs sont ouverts : la flèche signale seulement ceux qui ont une page. */}
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => {
              const href = SECTION_LINKS[s];
              const label = SITE_SECTION_LABELS[s] ?? s;
              const chip =
                "inline-flex items-center gap-1.5 border border-line bg-black/30 px-3 py-1.5 text-sm text-gray-200";
              if (href) {
                return (
                  <Link
                    key={s}
                    href={href}
                    className={cn(chip, "transition-colors hover:border-redlake-glow hover:text-white")}
                  >
                    <span className="h-1.5 w-1.5 bg-redlake-glow" aria-hidden />
                    {label}
                    <span className="text-gray-500" aria-hidden>→</span>
                  </Link>
                );
              }
              return (
                <span key={s} className={chip}>
                  <span className="h-1.5 w-1.5 bg-redlake-glow" aria-hidden />
                  {label}
                </span>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            {player.user.role === "ADMIN"
              ? "Compte Fondateur : toutes les sections sont ouvertes, quel que soit votre grade in-game."
              : "Ces accès reflètent votre grade in-game. Les transmissions Discord sont filtrées selon votre habilitation réelle."}
          </p>
        </section>
      )}

      {!isFondation && factionGrades.length > 0 && (
        <section className="hologram-border p-6">
          <h3 className={SECTION_TITLE}>
            <Shield className="h-5 w-5" style={{ color: theme.color }} />
            Hiérarchie — {theme.label}
          </h3>
          <ol className="border-t border-line">
            {factionGrades.map((g) => {
              const isMine = g.name === player.grade;
              return (
                <li
                  key={g.slug}
                  className={cn(
                    "flex items-center gap-3 border-b border-line px-3 py-2 text-sm even:bg-white/[0.02]",
                    isMine ? "font-semibold text-white" : "text-gray-300",
                  )}
                  style={isMine ? { background: `${theme.color}1f`, boxShadow: `inset 3px 0 0 ${theme.color}` } : undefined}
                >
                  <span className="label-mono w-8 text-right text-[10px] text-gray-500">{g.tier}</span>
                  <span>{g.name}</span>
                  {isMine && (
                    <span className="label-mono ml-auto text-[10px]" style={{ color: theme.color }}>
                      Votre grade
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {factionSlug === "gouvernement" && <MunicipalAdvisory />}

      {factionSlug && OPS_BOARDS[factionSlug] && (
        <FactionLog
          color={theme.color}
          title={OPS_BOARDS[factionSlug]!.title}
          icon={OPS_BOARDS[factionSlug]!.icon}
          onlyTypes={["INCIDENT"]}
          emptyText={OPS_BOARDS[factionSlug]!.emptyText}
          footerText={OPS_BOARDS[factionSlug]!.footerText}
        />
      )}

      {factionSlug && <FactionLog color={theme.color} />}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="hologram-border p-6">
          <h3 className={SECTION_TITLE}>
            <Send className="h-5 w-5 text-redlake-glow" />
            Déposer un rapport RP
          </h3>
          <p className="mb-4 text-sm text-gray-400">
            Incidents, demandes d&apos;autorisation, mémos ou réquisitions — le staff traite
            ces dossiers en jeu et sur Discord.
          </p>
          <form onSubmit={submitReport} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {getReportTypes(theme).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setReportType(t.value)}
                  aria-pressed={reportType === t.value}
                  className={cn(
                    "flex items-center gap-2 border px-3 py-2 text-left text-xs transition-colors",
                    reportType === t.value
                      ? "border-redlake-glow bg-redlake-glow/15 text-white"
                      : "border-line text-gray-400 hover:border-line-strong hover:text-white",
                  )}
                >
                  <t.icon
                    className={cn("h-3.5 w-3.5 shrink-0", reportType === t.value && "text-redlake-glow")}
                  />
                  {t.label}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="label-mono mb-1.5 block text-[10px] text-gray-400">Objet</span>
              <input
                required
                minLength={3}
                maxLength={120}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex. Incident zone D-4 — 14h32"
                className={FIELD}
              />
            </label>
            <label className="block">
              <span className="label-mono mb-1.5 block text-[10px] text-gray-400">Contenu</span>
              <textarea
                required
                minLength={10}
                maxLength={4000}
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Décrivez les faits, témoins, mesures prises…"
                className={FIELD}
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="font-display inline-flex w-full items-center justify-center gap-2 bg-redlake-glow py-3 text-base font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#ff4a3f] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Transmission…" : "Transmettre au secrétariat"}
            </button>
            {message && (
              <p className="text-sm text-gray-300">{message}</p>
            )}
          </form>
        </section>

        <section className="hologram-border p-6">
          <h3 className={SECTION_TITLE}>
            <ClipboardList className="h-5 w-5 text-redlake-glow" />
            Mes rapports
          </h3>
          <MyReportsPanel refreshKey={reportsRefresh} />
        </section>
      </div>

      {(player.user.role === "STAFF" || player.user.role === "ADMIN") && (
        <p className="label-mono text-center text-[10px] text-gray-500">
          Accès staff :{" "}
          <Link href="/staff" className="text-redlake-glow hover:underline">
            tableau de bord administration →
          </Link>
        </p>
      )}
    </div>
  );
}
