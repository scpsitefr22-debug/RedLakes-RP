import Link from "next/link";
import { scpObjects, classColors } from "@/data/scp";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Wiki SCP",
};

export default function WikiPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-12">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          BASE DE DONNÉES ANOMALIES
        </p>
        <h1 className="text-4xl font-bold text-white">Wiki SCP</h1>
        <p className="mt-4 max-w-2xl text-gray-500">
          Encyclopédie complète des objets, entités et phénomènes confinés sur
          Site-12. Chaque fiche contient historique, protocoles, journaux
          d&apos;incidents et addendums.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {(["Safe", "Euclid", "Keter", "Thaumiel", "Apollyon"] as const).map((c) => (
          <Badge key={c} className={cn("border cursor-pointer", classColors[c])}>
            {c}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scpObjects.map((scp) => (
          <Link
            key={scp.id}
            href={`/wiki/${scp.id}`}
            className="group hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-lg font-bold text-redlake-glow">
                {scp.number}
              </span>
              <Badge className={cn("border", classColors[scp.class])}>
                {scp.class}
              </Badge>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white group-hover:text-redlake-glow">
              {scp.name}
            </h2>
            <p className="mb-4 line-clamp-3 text-sm text-gray-500">
              {scp.description}
            </p>
            <div className="flex gap-4 font-mono text-xs text-gray-600">
              <span>Menace {scp.threatLevel}/5</span>
              <span>{scp.stats.personnelAssigned} agents</span>
              <span>Niv. {scp.clearance}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
