import Link from "next/link";
import type { SCPClass } from "@/data/scp";
import { ThreatIndicator } from "@/components/ui/ThreatIndicator";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { API_URL } from "@/lib/api";

interface ApiScpObject {
  id: string;
  slug: string;
  number: string;
  name: string;
  class: SCPClass;
  threatLevel: number;
  description: string;
  breachCount: number | null;
}

async function getScpObjects(): Promise<ApiScpObject[]> {
  try {
    const res = await fetch(`${API_URL}/scp`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function SCPPreview() {
  const scpObjects = await getScpObjects();
  if (scpObjects.length === 0) return null;

  return (
    <section className="border-y border-redlake/10 bg-classified py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          kicker="BASE DE DONNÉES SCP"
          title="Wiki SCP"
          action={{ label: "Voir tous les SCP", href: "/wiki" }}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scpObjects.map((scp) => (
            <Link
              key={scp.id}
              href={`/wiki/${scp.slug}`}
              className="group block hologram-border rounded-lg p-5 transition-all hover:border-redlake/40"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-redlake-glow">
                  {scp.number}
                </span>
                <ThreatIndicator scpClass={scp.class} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white group-hover:text-redlake-glow">
                {scp.name}
              </h3>
              <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                {scp.description}
              </p>
              <div className="flex items-center gap-4 font-mono text-xs text-gray-600">
                <span>Menace: {scp.threatLevel}/5</span>
                <span>Brèches: {scp.breachCount ?? "—"}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
