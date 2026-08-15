"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  ClipboardList,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Shield,
  Landmark,
  Building2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { type PaginatedResult, buildQueryString } from "@/lib/platform-types";
import { EntityTimeline } from "@/components/platform/EntityTimeline";
import { EntityComments } from "@/components/platform/EntityComments";
import { StaffAuditFeed } from "@/components/staff/StaffAuditFeed";
import { cn } from "@/lib/utils";

interface Application {
  id: string;
  type: string;
  status: string;
  experience: string;
  motivation: string;
  createdAt: string;
  user: { minecraftUsername: string | null; discordUsername: string | null };
}

interface PersonnelReport {
  id: string;
  type: string;
  subject: string;
  content: string;
  status: string;
  createdAt: string;
  user: {
    minecraftUsername: string | null;
    discordUsername: string | null;
    player?: { grade: string; rpFirstName?: string | null; rpLastName?: string | null };
  };
}

export function StaffDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [reports, setReports] = useState<PersonnelReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [staffNote, setStaffNote] = useState("");
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const auth = await apiFetch<{
        authenticated: boolean;
        user?: { role: string };
      }>("/auth/me");
      if (!auth.authenticated) {
        router.replace("/connexion");
        return;
      }
      const role = auth.user?.role;
      if (role !== "STAFF" && role !== "ADMIN") {
        setError("Accès réservé au personnel autorisé.");
        setLoading(false);
        return;
      }
      const [apps, reps] = await Promise.all([
        apiFetch<PaginatedResult<Application>>(
          `/applications${buildQueryString({ status: "PENDING", limit: 50 })}`,
        ),
        apiFetch<PaginatedResult<PersonnelReport>>(
          `/reports${buildQueryString({ status: "PENDING", limit: 50 })}`,
        ),
      ]);
      setApplications(apps.items);
      setReports(reps.items);
    } catch {
      setError("Impossible de charger les données staff.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const reviewApp = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionError(null);
    try {
      await apiFetch(`/applications/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          staffNote: staffNote.trim() || undefined,
        }),
      });
      setApplications((prev) => prev.filter((a) => a.id !== id));
      setStaffNote("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Échec de la revue");
    }
  };

  const reviewReport = async (id: string, status: "REVIEWED" | "ARCHIVED") => {
    setActionError(null);
    try {
      await apiFetch(`/reports/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          staffNote: staffNote.trim() || "Traité par le staff Site-12.",
        }),
      });
      setReports((prev) => prev.filter((r) => r.id !== id));
      setExpandedReport(null);
      setStaffNote("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Échec du traitement");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-mono text-gray-500">
        Chargement du tableau de bord…
      </div>
    );
  }

  if (error) {
    return (
      <div className="hologram-border rounded-lg p-8 text-center">
        <p className="text-red-400">{error}</p>
        <Link href="/dashboard" className="mt-4 inline-block font-mono text-xs text-gray-500 hover:text-white">
          Retour au dossier agent
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {actionError && (
        <p className="rounded border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-400">
          {actionError}
        </p>
      )}
      <div className="hologram-border rounded-lg p-4">
        <label className="mb-1 block font-mono text-xs text-gray-500">
          Note staff (candidatures & rapports)
        </label>
        <input
          value={staffNote}
          onChange={(e) => setStaffNote(e.target.value)}
          placeholder="Réponse visible par l'agent…"
          className="w-full rounded border border-metal bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-redlake/50"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="hologram-border rounded-lg p-5">
          <ClipboardList className="mb-2 h-5 w-5 text-redlake-glow" />
          <p className="font-mono text-2xl font-bold text-white">{applications.length}</p>
          <p className="text-xs text-gray-600">Candidatures en attente</p>
        </div>
        <div className="hologram-border rounded-lg p-5">
          <FileText className="mb-2 h-5 w-5 text-redlake-glow" />
          <p className="font-mono text-2xl font-bold text-white">{reports.length}</p>
          <p className="text-xs text-gray-600">Rapports RP à traiter</p>
        </div>
        <div className="hologram-border rounded-lg p-5">
          <Users className="mb-2 h-5 w-5 text-redlake-glow" />
          <Link href="/joueurs" className="font-mono text-sm text-redlake-glow hover:underline">
            Registre personnel →
          </Link>
          <p className="text-xs text-gray-600">Base joueurs</p>
        </div>
        <div className="hologram-border rounded-lg p-5">
          <Shield className="mb-2 h-5 w-5 text-redlake-glow" />
          <Link href="/staff/grades" className="font-mono text-sm text-redlake-glow hover:underline">
            Gestion des grades →
          </Link>
          <p className="text-xs text-gray-600">Catalogue de grades</p>
        </div>
        <div className="hologram-border rounded-lg p-5">
          <Landmark className="mb-2 h-5 w-5 text-redlake-glow" />
          <Link href="/staff/factions" className="font-mono text-sm text-redlake-glow hover:underline">
            Gestion des factions →
          </Link>
          <p className="text-xs text-gray-600">Catalogue de factions</p>
        </div>
        <div className="hologram-border rounded-lg p-5">
          <Building2 className="mb-2 h-5 w-5 text-redlake-glow" />
          <Link href="/staff/departements" className="font-mono text-sm text-redlake-glow hover:underline">
            Gestion des départements →
          </Link>
          <p className="text-xs text-gray-600">Catalogue de départements</p>
        </div>
      </div>

      <section className="hologram-border rounded-lg p-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
          <ClipboardList className="h-5 w-5 text-redlake-glow" />
          Candidatures en attente
        </h2>
        {applications.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune candidature en attente.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="rounded border border-metal/40 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white">
                    {app.user.minecraftUsername ?? app.user.discordUsername ?? "—"}
                  </span>
                  <span className="rounded border border-yellow-400/30 px-2 py-0.5 font-mono text-[10px] text-yellow-400">
                    {app.type}
                  </span>
                  <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-gray-600">
                    <Clock className="h-3 w-3" />
                    {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-xs text-gray-500">{app.experience}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-400">{app.motivation}</p>
                <EntityTimeline
                  entityType="APPLICATION"
                  entityId={app.id}
                  className="mt-3"
                />
                <EntityComments
                  entityType="APPLICATION"
                  entityId={app.id}
                  canPostInternal
                  className="mt-3"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => reviewApp(app.id, "APPROVED")}
                    className="flex items-center gap-1 rounded border border-green-400/30 px-3 py-1 font-mono text-xs text-green-400 hover:bg-green-400/10"
                  >
                    <CheckCircle className="h-3 w-3" /> Valider
                  </button>
                  <button
                    onClick={() => reviewApp(app.id, "REJECTED")}
                    className="flex items-center gap-1 rounded border border-red-400/30 px-3 py-1 font-mono text-xs text-red-400 hover:bg-red-400/10"
                  >
                    <XCircle className="h-3 w-3" /> Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="hologram-border rounded-lg p-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
          <FileText className="h-5 w-5 text-redlake-glow" />
          Rapports RP en attente
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun rapport à traiter.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => {
              const p = r.user.player;
              const rpName = p
                ? [p.rpFirstName, p.rpLastName].filter(Boolean).join(" ")
                : null;
              const expanded = expandedReport === r.id;
              return (
                <div key={r.id} className="rounded border border-metal/40 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white">
                      {rpName || r.user.minecraftUsername || "Agent"}
                    </span>
                    {p && (
                      <span className="font-mono text-[10px] text-gray-600">{p.grade}</span>
                    )}
                    <span
                      className={cn(
                        "rounded border px-2 py-0.5 font-mono text-[10px]",
                        "border-redlake/30 text-redlake-glow",
                      )}
                    >
                      {r.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedReport(expanded ? null : r.id)}
                      className="ml-auto flex items-center gap-1 font-mono text-[10px] text-gray-500 hover:text-white"
                    >
                      {expanded ? (
                        <>
                          <ChevronUp className="h-3 w-3" /> Réduire
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" /> Dossier complet
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-medium text-white">{r.subject}</p>
                  <p className="mt-1 text-sm text-gray-500">{r.content}</p>
                  {expanded && (
                    <>
                      <EntityTimeline
                        entityType="PERSONNEL_REPORT"
                        entityId={r.id}
                        className="mt-3"
                      />
                      <EntityComments
                        entityType="PERSONNEL_REPORT"
                        entityId={r.id}
                        canPostInternal
                        className="mt-3"
                      />
                    </>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => reviewReport(r.id, "REVIEWED")}
                      className="flex items-center gap-1 rounded border border-green-400/30 px-3 py-1 font-mono text-xs text-green-400 hover:bg-green-400/10"
                    >
                      <CheckCircle className="h-3 w-3" /> Marquer traité
                    </button>
                    <button
                      onClick={() => reviewReport(r.id, "ARCHIVED")}
                      className="flex items-center gap-1 rounded border border-metal px-3 py-1 font-mono text-xs text-gray-500 hover:text-white"
                    >
                      Archiver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <StaffAuditFeed />
    </div>
  );
}
