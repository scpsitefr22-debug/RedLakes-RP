import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { classColors, SCPClass } from "@/data/scp";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDate } from "@/lib/utils";
import { AlertTriangle, FlaskConical, FileText, ChevronRight } from "lucide-react";
import { API_URL } from "@/lib/api";
import { ThreatGauge } from "@/components/wiki/ThreatGauge";
import { ClassificationStamp } from "@/components/wiki/ClassificationStamp";
import { ScpAccessDenied } from "@/components/wiki/ScpAccessDenied";
import { ClassifiedPlaceholder } from "@/components/wiki/ClassifiedPlaceholder";
import { linkifyScpRefs } from "@/lib/scp-linkify";

interface Props {
  params: Promise<{ id: string }>;
}

interface ApiScpDetail {
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
}

type ScpFetchResult =
  | { status: "found"; scp: ApiScpDetail }
  | { status: "denied" }
  | { status: "not-found" };

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-6 flex items-center gap-1 font-mono text-xs text-gray-600">
        <Link href="/wiki" className="hover:text-redlake-glow">
          Encyclopédie
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/wiki" className="hover:text-redlake-glow">
          Wiki SCP
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-400">{scp.number}</span>
      </nav>

      <div className="relative mb-8 hologram-border rounded-lg p-8">
        <ClassificationStamp
          scpClass={scp.class}
          restricted={scp.restrictedDepartmentIds.length > 0}
        />
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="font-mono text-2xl font-bold text-redlake-glow">
            {scp.number}
          </span>
          <Badge className={cn("border", classColors[scp.class])}>
            {scp.class}
          </Badge>
        </div>
        <h1 className="mb-4 max-w-[80%] text-4xl font-bold text-white">{scp.name}</h1>
        <p className="mb-4 text-gray-400">{linkifyScpRefs(scp.description, scp.number.toLowerCase())}</p>
        <ThreatGauge level={scp.threatLevel} scpClass={scp.class} />
      </div>

      <div className="prose-redlake space-y-8">
        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <AlertTriangle className="h-5 w-5 text-redlake-glow" />
            Protocole de confinement
          </h2>
          <p>{linkifyScpRefs(scp.containment)}</p>
          <div className="mt-4 grid grid-cols-3 gap-4 font-mono text-sm">
            <div>
              <p className="text-gray-600">Coût mensuel</p>
              <p className="text-white">{scp.containmentCost ?? "—"}</p>
            </div>
            <div>
              <p className="text-gray-600">Personnel</p>
              <p className="text-white">{scp.personnelAssigned ?? "—"}</p>
            </div>
            <div>
              <p className="text-gray-600">Brèches</p>
              <p className="text-white">{scp.breachCount ?? "—"}</p>
            </div>
          </div>
        </section>

        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Historique</h2>
          <p>{linkifyScpRefs(scp.history)}</p>
        </section>

        {scp.incidents.length > 0 && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <FileText className="h-5 w-5 text-redlake-glow" />
              Journal des incidents
            </h2>
            <div className="space-y-3">
              {scp.incidents.map((inc) => (
                <div key={inc.date} className="border-l-2 border-redlake/30 pl-4">
                  <p className="font-mono text-xs text-redlake-glow">
                    {formatDate(inc.date)}
                  </p>
                  <p className="text-gray-400">{linkifyScpRefs(inc.summary)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {scp.tests.length > 0 && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <FlaskConical className="h-5 w-5 text-redlake-glow" />
              Journal des tests
            </h2>
            <div className="space-y-3">
              {scp.tests.map((test) => (
                <div key={test.date} className="rounded border border-metal/50 p-4">
                  <p className="font-mono text-xs text-gray-600">
                    {formatDate(test.date)} — {test.researcher}
                  </p>
                  <p className="text-gray-400">{linkifyScpRefs(test.result)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {scp.addendums.length > 0 && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Addendums</h2>
            {scp.addendums.map((add, i) => (
              <div key={i} className="mb-4 border-l-2 border-yellow-400/30 pl-4">
                <p className="font-mono text-xs text-yellow-400">{add.author}</p>
                {add.redacted ? (
                  <ClassifiedPlaceholder />
                ) : (
                  <p className="text-gray-400">{linkifyScpRefs(add.content!)}</p>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
