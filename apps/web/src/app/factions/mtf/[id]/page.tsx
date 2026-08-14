import { notFound } from "next/navigation";
import { mtfUnits } from "@/data/factions";
import { Badge } from "@/components/ui/Badge";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return mtfUnits.map((m) => ({ id: m.id }));
}

export default async function MTFDetailPage({ params }: Props) {
  const { id } = await params;
  const mtf = mtfUnits.find((m) => m.id === id);
  if (!mtf) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 hologram-border rounded-lg p-8">
        <p className="mb-2 font-mono text-sm text-redlake-glow">{mtf.name}</p>
        <h1 className="mb-2 text-4xl font-bold text-white">
          &quot;{mtf.codename}&quot;
        </h1>
        <p className="italic text-gray-500">{mtf.motto}</p>
      </div>

      <div className="space-y-6">
        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Historique</h2>
          <p className="text-gray-400">{mtf.history}</p>
        </section>

        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Missions</h2>
          <ul className="space-y-2">
            {mtf.missions.map((m) => (
              <li key={m} className="text-gray-400">▸ {m}</li>
            ))}
          </ul>
        </section>

        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Équipement</h2>
          <div className="flex flex-wrap gap-2">
            {mtf.equipment.map((e) => (
              <Badge key={e}>{e}</Badge>
            ))}
          </div>
        </section>

        <section className="hologram-border rounded-lg p-6">
          <p className="font-mono text-sm text-gray-500">
            Effectif actuel : <span className="text-white">{mtf.personnel}</span> agents
          </p>
        </section>
      </div>
    </div>
  );
}
