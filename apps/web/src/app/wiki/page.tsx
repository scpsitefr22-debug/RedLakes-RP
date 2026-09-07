import type { SCPClass } from "@/data/scp";
import { API_URL } from "@/lib/api";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WikiCatalog } from "@/components/wiki/WikiCatalog";
import { TerminalSearch } from "@/components/wiki/TerminalSearch";
import { RecentlyViewed } from "@/components/wiki/RecentlyViewed";

export const metadata = {
  title: "Wiki SCP",
};

interface ApiScpObject {
  id: string;
  slug: string;
  number: string;
  name: string;
  class: SCPClass;
  threatLevel: number;
  description: string;
  personnelAssigned: number | null;
}

type ScpListResult =
  | { status: "ok"; objects: ApiScpObject[] }
  | { status: "error" };

async function getScpObjects(): Promise<ScpListResult> {
  try {
    const res = await fetch(`${API_URL}/scp`, { cache: "no-store" });
    if (!res.ok) return { status: "error" };
    return { status: "ok", objects: await res.json() };
  } catch {
    return { status: "error" };
  }
}

export default async function WikiPage() {
  const result = await getScpObjects();
  const scpObjects = result.status === "ok" ? result.objects : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <SectionHeader
        kicker="BASE DE DONNÉES ANOMALIES"
        title="Wiki SCP"
        description="Encyclopédie complète des objets, entités et phénomènes confinés. Chaque fiche contient historique, protocoles, journaux d'incidents et addendums."
      />

      <TerminalSearch />
      <RecentlyViewed />

      {result.status === "error" ? (
        <div className="hologram-border rounded-lg p-8 text-center text-red-400">
          Le service est momentanément indisponible (il peut mettre jusqu&apos;à une minute à se
          réveiller après une période d&apos;inactivité). Rechargez la page dans quelques instants.
        </div>
      ) : scpObjects.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          Aucun objet disponible pour le moment.
        </div>
      ) : (
        <WikiCatalog scpObjects={scpObjects} />
      )}
    </div>
  );
}
