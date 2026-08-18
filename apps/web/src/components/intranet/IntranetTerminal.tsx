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
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { MyReportsPanel } from "@/components/intranet/MyReportsPanel";
import { MunicipalAdvisory } from "@/components/intranet/MunicipalAdvisory";
import {
  getAccessibleSections,
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
  gradeInfo?: { departmentRef?: { name: string } | null } | null;
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
          const grades = await apiFetch<FactionGrade[]>(
            `/grades?branch=${factionSlug}`,
          );
          setFactionGrades(
            [...grades].sort((a, b) => Number(a.tier) - Number(b.tier)),
          );
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
      setMessage("Rapport transmis au secrétariat du Site-12. Référence enregistrée.");
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
  const sections = getAccessibleSections(player.grade);
  const rpName = [player.rpFirstName, player.rpLastName].filter(Boolean).join(" ");
  const factionSlug = player.factionInfo?.slug ?? null;
  const theme = getFactionTheme(factionSlug);
  const isFondation = factionSlug === "fondation";

  return (
    <div className="space-y-8">
      <div
        className="rounded-lg border p-6"
        style={{ borderColor: `${theme.color}66`, background: `${theme.color}0d` }}
      >
        <p
          className="mb-2 flex items-center gap-2 font-mono text-xs tracking-widest"
          style={{ color: theme.color }}
        >
          <Terminal className="h-3 w-3" />
          {theme.network}
        </p>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              {rpName || player.user.minecraftUsername}
            </h2>
            <p className="text-sm text-gray-400">
              {player.grade} — {theme.label}
            </p>
            <p className="mt-2 max-w-md text-xs text-gray-500">{theme.tagline}</p>
          </div>
          {departmentName && (
            <div
              className="rounded border px-4 py-2 text-center"
              style={{ borderColor: `${theme.color}4d`, background: `${theme.color}1a` }}
            >
              <p className="font-mono text-[10px] text-gray-500">DÉPARTEMENT</p>
              <p className="font-mono text-lg font-bold" style={{ color: theme.color }}>
                {departmentName}
              </p>
            </div>
          )}
        </div>
      </div>

      {isFondation && (
        <section className="hologram-border rounded-lg p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
            <Shield className="h-5 w-5 text-redlake-glow" />
            Secteurs accessibles (selon grade)
          </h3>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => {
              const href = SECTION_LINKS[s];
              const label = SITE_SECTION_LABELS[s] ?? s;
              if (href) {
                return (
                  <Link
                    key={s}
                    href={href}
                    className="rounded border border-redlake/30 bg-redlake/5 px-3 py-1.5 font-mono text-xs text-redlake-glow transition-colors hover:bg-redlake/15"
                  >
                    {label}
                  </Link>
                );
              }
              return (
                <span
                  key={s}
                  className="rounded border border-metal/50 px-3 py-1.5 font-mono text-xs text-gray-500"
                >
                  {label}
                </span>
              );
            })}
          </div>
          <p className="mt-4 font-mono text-xs text-gray-600">
            Ces accès reflètent votre grade in-game. Les transmissions Discord sont filtrées
            selon votre habilitation réelle.
          </p>
        </section>
      )}

      {!isFondation && factionGrades.length > 0 && (
        <section className="hologram-border rounded-lg p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
            <Shield className="h-5 w-5" style={{ color: theme.color }} />
            Hiérarchie — {theme.label}
          </h3>
          <div className="space-y-1.5">
            {factionGrades.map((g) => {
              const isMine = g.name === player.grade;
              return (
                <div
                  key={g.slug}
                  className={cn(
                    "flex items-center gap-3 rounded border px-3 py-1.5 font-mono text-xs",
                    isMine ? "border-current" : "border-metal/40 text-gray-400",
                  )}
                  style={isMine ? { color: theme.color, background: `${theme.color}14` } : undefined}
                >
                  <span className="w-6 text-right text-gray-600">{g.tier}</span>
                  <span>{g.name}</span>
                  {isMine && <span className="ml-auto text-[10px]">← vous</span>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {factionSlug === "gouvernement" && <MunicipalAdvisory />}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="hologram-border rounded-lg p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
            <Send className="h-5 w-5 text-redlake-glow" />
            Déposer un rapport RP
          </h3>
          <p className="mb-4 text-sm text-gray-500">
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
                  className={cn(
                    "flex items-center gap-2 rounded border px-3 py-2 font-mono text-[10px] transition-colors",
                    reportType === t.value
                      ? "border-redlake bg-redlake/20 text-redlake-glow"
                      : "border-metal text-gray-500 hover:text-white",
                  )}
                >
                  <t.icon className="h-3 w-3 shrink-0" />
                  {t.label}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="mb-1 block font-mono text-xs text-gray-500">Objet</span>
              <input
                required
                minLength={3}
                maxLength={120}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex. Incident zone D-4 — 14h32"
                className="w-full rounded border border-metal bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-redlake/50"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-xs text-gray-500">Contenu</span>
              <textarea
                required
                minLength={10}
                maxLength={4000}
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Décrivez les faits, témoins, mesures prises…"
                className="w-full rounded border border-metal bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-redlake/50"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded border border-redlake/40 bg-redlake/10 py-2 font-mono text-sm text-redlake-glow hover:text-white disabled:opacity-50"
            >
              {submitting ? "Transmission…" : "Transmettre au secrétariat"}
            </button>
            {message && (
              <p className="font-mono text-xs text-gray-400">{message}</p>
            )}
          </form>
        </section>

        <section className="hologram-border rounded-lg p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
            <ClipboardList className="h-5 w-5 text-redlake-glow" />
            Mes rapports
          </h3>
          <MyReportsPanel refreshKey={reportsRefresh} />
        </section>
      </div>

      {(player.user.role === "STAFF" || player.user.role === "ADMIN") && (
        <p className="text-center font-mono text-xs text-gray-600">
          Accès staff :{" "}
          <Link href="/staff" className="text-redlake-glow hover:underline">
            tableau de bord administration →
          </Link>
        </p>
      )}
    </div>
  );
}
