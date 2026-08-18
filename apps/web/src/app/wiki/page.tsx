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

async function getScpObjects(): Promise<ApiScpObject[]> {
  try {
    const res = await fetch(`${API_URL}/scp`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function WikiPage() {
  const scpObjects = await getScpObjects();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <SectionHeader
        kicker="BASE DE DONNÉES ANOMALIES"
        title="Wiki SCP"
        description="Encyclopédie complète des objets, entités et phénomènes confinés. Chaque fiche contient historique, protocoles, journaux d'incidents et addendums."
      />

      <TerminalSearch />
      <RecentlyViewed />

      {scpObjects.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          Aucun objet disponible pour le moment.
        </div>
      ) : (
        <WikiCatalog scpObjects={scpObjects} />
      )}
    </div>
  );
}
