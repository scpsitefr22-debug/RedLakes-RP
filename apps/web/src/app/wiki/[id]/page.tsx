import { notFound } from "next/navigation";
import { scpObjects, classColors } from "@/data/scp";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDate } from "@/lib/utils";
import { CLEARANCE_LABELS } from "@/lib/clearance";
import { AlertTriangle, FlaskConical, FileText } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return scpObjects.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const scp = scpObjects.find((s) => s.id === id);
  if (!scp) return { title: "SCP introuvable" };
  return { title: `${scp.number} — ${scp.name}` };
}

export default async function SCPDetailPage({ params }: Props) {
  const { id } = await params;
  const scp = scpObjects.find((s) => s.id === id);
  if (!scp) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 hologram-border rounded-lg p-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="font-mono text-2xl font-bold text-redlake-glow">
            {scp.number}
          </span>
          <Badge className={cn("border", classColors[scp.class])}>
            {scp.class}
          </Badge>
          <Badge variant="classified">
            {CLEARANCE_LABELS[scp.clearance]}
          </Badge>
        </div>
        <h1 className="mb-4 text-4xl font-bold text-white">{scp.name}</h1>
        <p className="text-gray-400">{scp.description}</p>
      </div>

      <div className="prose-redlake space-y-8">
        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <AlertTriangle className="h-5 w-5 text-redlake-glow" />
            Protocole de confinement
          </h2>
          <p>{scp.containment}</p>
          <div className="mt-4 grid grid-cols-3 gap-4 font-mono text-sm">
            <div>
              <p className="text-gray-600">Coût mensuel</p>
              <p className="text-white">{scp.stats.containmentCost}</p>
            </div>
            <div>
              <p className="text-gray-600">Personnel</p>
              <p className="text-white">{scp.stats.personnelAssigned}</p>
            </div>
            <div>
              <p className="text-gray-600">Brèches</p>
              <p className="text-white">{scp.stats.breachCount}</p>
            </div>
          </div>
        </section>

        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Historique</h2>
          <p>{scp.history}</p>
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
                  <p className="text-gray-400">{inc.summary}</p>
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
                  <p className="text-gray-400">{test.result}</p>
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
                <p className="text-gray-400">{add.content}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
