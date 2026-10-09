import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { classColors, SCPClass } from "@/data/scp";
import { cn, formatDate } from "@/lib/utils";
import { AlertTriangle, FlaskConical, FileText, ChevronRight, FileLock2, Radio } from "lucide-react";
import { API_URL } from "@/lib/api";
import { ThreatGauge } from "@/components/wiki/ThreatGauge";
import { ClassificationStamp } from "@/components/wiki/ClassificationStamp";
import { ScpAccessDenied } from "@/components/wiki/ScpAccessDenied";
import { ClassifiedPlaceholder } from "@/components/wiki/ClassifiedPlaceholder";
import { DeclassificationOverlay } from "@/components/wiki/DeclassificationOverlay";
import { RecordScpView } from "@/components/wiki/RecordScpView";
import { DangerComparison } from "@/components/wiki/DangerComparison";
import { OfficialReportView } from "@/components/wiki/OfficialReportView";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";
import { EditableText } from "@/components/staff/EditableText";

interface Props {
  params: Promise<{ id: string }>;
}

interface ApiScpDetail {
  id: string;
  number: string;
  name: string;
  class: SCPClass;
  threatLevel: number;
  containment: string;
  history: string;
  description: string;
  incidents: { date: string; summary: string }[];
  tests: { date: string; researcher: string; result: string }[];
  addendums: { author: string; content?: string; redacted?: boolean }[];
  containmentCost: string | null;
  personnelAssigned: number | null;
  breachCount: number | null;
  restrictedDepartmentIds: string[];
  linkedDocuments: { id: string; slug: string; title: string; excerpt: string | null }[];
  linkedEvents: { id: string; slug: string; title: string; date: string; type: string }[];
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  breach: "Brèche",
  invasion: "Invasion",
  guerre: "Guerre",
  "crise-xk": "Crise XK",
  experience: "Expérience",
};

type ScpFetchResult =
  | { status: "found"; scp: ApiScpDetail }
  | { status: "denied" }
  | { status: "not-found" };

async function getThreatPercentile(currentSlug: string, currentLevel: number): Promise<number | null> {
  try {
    const res = await fetch(`${API_URL}/scp`, { cache: "no-store" });
    if (!res.ok) return null;
    const list: { slug: string; threatLevel: number }[] = await res.json();
    const others = list.filter((s) => s.slug !== currentSlug);
    if (others.length === 0) return null;
    const lowerOrEqual = others.filter((s) => s.threatLevel <= currentLevel).length;
    return Math.round((lowerOrEqual / others.length) * 100);
  } catch {
    return null;
  }
}

async function getScpObject(slug: string): Promise<ScpFetchResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("redlakes_token")?.value;

  try {
    const res = await fetch(`${API_URL}/scp/${slug}`, {
      cache: "no-store",
      headers: token ? { Cookie: `redlakes_token=${token}` } : undefined,
    });
    if (res.ok) return { status: "found", scp: await res.json() };
    if (res.status === 404) {
      const body = await res.json().catch(() => null);
      if (typeof body?.message === "string" && body.message.includes("restreint")) {
        return { status: "denied" };
      }
    }
    return { status: "not-found" };
  } catch {
    return { status: "not-found" };
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const result = await getScpObject(id);
  if (result.status !== "found") return { title: "SCP introuvable" };
  return { title: `${result.scp.number} — ${result.scp.name}` };
}

export default async function SCPDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getScpObject(id);

  if (result.status === "not-found") notFound();
  if (result.status === "denied") return <ScpAccessDenied />;

  const scp = result.scp;
  const percentile = await getThreatPercentile(scp.number.toLowerCase(), scp.threatLevel);

  const ref = scp.number.toLowerCase();
  const classText = classColors[scp.class].split(" ")[0];
  const restricted = scp.restrictedDepartmentIds.length > 0;
  const sectionTitle = "mb-4 flex items-center gap-2 text-2xl font-bold uppercase tracking-[0.03em] text-white";

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">
      <DeclassificationOverlay number={scp.number} />
      <RecordScpView slug={ref} number={scp.number} name={scp.name} scpClass={scp.class} />
      <nav className="label-mono mb-5 flex items-center gap-1.5 text-[10px] text-gray-500">
        <Link href="/wiki" className="hover:text-white">
          Encyclopédie
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/wiki" className="hover:text-white">
          Wiki SCP
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-300">{scp.number}</span>
      </nav>

      {/* En-tête du dossier */}
      <header className="relative overflow-hidden border border-line bg-[#0b0f15]">
        <div className="hazard-stripes h-1.5" aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-2.5">
          <p className="label-mono text-[10px] text-gray-500">Fondation SCP — Dossier d&apos;objet — Site-12</p>
          <p className={cn("label-mono text-[10px]", restricted ? "text-redlake-glow" : "text-gray-500")}>
            {restricted ? "Accès restreint — département" : "Diffusion interne"}
          </p>
        </div>
        <div className="relative px-6 pb-8 pt-7 sm:px-8">
          <ClassificationStamp scpClass={scp.class} restricted={restricted} />
          <p className="font-display text-6xl font-extrabold leading-none text-redlake-glow sm:text-7xl">
            {scp.number}
          </p>
          <EditableText
            as="h1"
            className="font-display mt-3 max-w-[85%] text-4xl font-bold text-white sm:text-5xl"
            value={scp.name}
            endpoint={`/scp/${scp.id}`}
            field="name"
          />
          <EditableText
            value={scp.description}
            endpoint={`/scp/${scp.id}`}
            field="description"
            multiline
            markdown
            className="mt-4 max-w-3xl text-lg leading-relaxed text-gray-300"
            scpRefsSlug={ref}
          />
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Rapport */}
        <div className="min-w-0 space-y-8">
          <OfficialReportView
            number={scp.number}
            scpClass={scp.class}
            containment={scp.containment}
            description={scp.description}
            history={scp.history}
            addendums={scp.addendums}
          />

          <div className="prose-redlake space-y-8">
            <section className="hologram-border p-6 sm:p-7">
              <h2 className={sectionTitle}>
                <AlertTriangle className="h-5 w-5 text-redlake-glow" />
                Protocole de confinement
              </h2>
              <EditableText
                value={scp.containment}
                endpoint={`/scp/${scp.id}`}
                field="containment"
                multiline
                markdown
                scpRefsSlug={ref}
              />
            </section>

            <section className="hologram-border p-6 sm:p-7">
              <h2 className={sectionTitle}>Historique</h2>
              <EditableText
                value={scp.history}
                endpoint={`/scp/${scp.id}`}
                field="history"
                multiline
                markdown
                scpRefsSlug={ref}
              />
            </section>

            {scp.incidents.length > 0 && (
              <section className="hologram-border p-6 sm:p-7">
                <h2 className={sectionTitle}>
                  <FileText className="h-5 w-5 text-redlake-glow" />
                  Journal des incidents
                </h2>
                <ol className="space-y-4">
                  {scp.incidents.map((inc) => (
                    <li key={inc.date} className="border-l-2 border-redlake-glow/50 pl-4">
                      <p className="label-mono text-[10px] text-redlake-glow">{formatDate(inc.date)}</p>
                      <DiscordMarkdown text={inc.summary} className="mt-1 text-gray-300" scpRefsSlug={ref} />
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {scp.tests.length > 0 && (
              <section className="hologram-border p-6 sm:p-7">
                <h2 className={sectionTitle}>
                  <FlaskConical className="h-5 w-5 text-redlake-glow" />
                  Journal des tests
                </h2>
                <div className="space-y-3">
                  {scp.tests.map((test) => (
                    <div key={test.date} className="border border-line bg-black/30 p-4">
                      <p className="label-mono text-[10px] text-gray-500">
                        {formatDate(test.date)} — {test.researcher}
                      </p>
                      <DiscordMarkdown text={test.result} className="mt-1 text-gray-300" scpRefsSlug={ref} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {scp.addendums.length > 0 && (
              <section className="hologram-border p-6 sm:p-7">
                <h2 className={sectionTitle}>Addendums</h2>
                <div className="space-y-4">
                  {scp.addendums.map((add, i) => (
                    <div key={i} className="border-l-2 border-hazard/50 pl-4">
                      <p className="label-mono text-[10px] text-hazard">{add.author}</p>
                      {add.redacted ? (
                        <ClassifiedPlaceholder />
                      ) : (
                        <DiscordMarkdown text={add.content!} className="mt-1 text-gray-300" scpRefsSlug={ref} />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Fiche signalétique */}
        <aside className="order-first space-y-6 lg:sticky lg:top-28 lg:order-none lg:self-start">
          <div className="hologram-border p-5">
            <p className="label-mono text-[10px] text-gray-500">Classe d&apos;objet</p>
            <p className={cn("font-display mt-1 text-5xl font-extrabold uppercase leading-none", classText)}>
              {scp.class}
            </p>
            <div className="mt-5 border-t border-line pt-4">
              <ThreatGauge level={scp.threatLevel} scpClass={scp.class} />
              {percentile !== null && <DangerComparison percentile={percentile} level={scp.threatLevel} />}
            </div>
          </div>

          <dl className="hologram-border grid grid-cols-1 divide-y divide-line p-5">
            {[
              { label: "Coût de confinement", value: scp.containmentCost },
              { label: "Personnel affecté", value: scp.personnelAssigned },
              { label: "Brèches recensées", value: scp.breachCount },
            ].map((row) => (
              <div key={row.label} className="py-3 first:pt-0 last:pb-0">
                <dt className="label-mono text-[10px] text-gray-500">{row.label}</dt>
                <dd className="font-display mt-1 text-2xl font-bold tabular-nums text-white">{row.value ?? "—"}</dd>
              </div>
            ))}
          </dl>

          {scp.linkedDocuments.length > 0 && (
            <div className="hologram-border p-5">
              <h2 className="label-mono mb-3 flex items-center gap-2 text-redlake-glow">
                <FileLock2 className="h-3.5 w-3.5" />
                Documents classifiés liés
              </h2>
              <div className="space-y-2">
                {scp.linkedDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.slug}`}
                    className="block border border-line p-3 transition-colors hover:border-line-strong"
                  >
                    <p className="text-sm font-semibold text-white">{doc.title}</p>
                    {doc.excerpt && <p className="line-clamp-2 text-xs text-gray-500">{doc.excerpt}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {scp.linkedEvents.length > 0 && (
            <div className="hologram-border p-5">
              <h2 className="label-mono mb-3 flex items-center gap-2 text-redlake-glow">
                <Radio className="h-3.5 w-3.5" />
                Événements liés
              </h2>
              <div className="space-y-2">
                {scp.linkedEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/evenements/${event.slug}`}
                    className="block border border-line p-3 transition-colors hover:border-line-strong"
                  >
                    <p className="text-sm font-semibold text-white">{event.title}</p>
                    <p className="label-mono mt-1 text-[9px] text-gray-500">
                      {EVENT_TYPE_LABELS[event.type] ?? event.type} — {new Date(event.date).toLocaleDateString("fr-FR")}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
