import { cookies } from "next/headers";
import { classHex, type SCPClass } from "@/data/scp";
import { API_URL } from "@/lib/api";
import { WikiCatalog } from "@/components/wiki/WikiCatalog";
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

/**
 * Ne transmettait jamais le cookie de session — tout visiteur, y compris
 * un membre du staff habilite, ne voyait que le sous-ensemble public de
 * la base SCP dans le catalogue (les fiches restreintes par departement/
 * habilitation restaient accessibles par URL directe via /wiki/[id], deja
 * corrige, mais jamais listees ici). Meme correctif que evenements/[id]
 * et factions/[id].
 */
async function getScpObjects(): Promise<ScpListResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("redlakes_token")?.value;
  try {
    const res = await fetch(`${API_URL}/scp`, {
      cache: "no-store",
      headers: token ? { Cookie: `redlakes_token=${token}` } : undefined,
    });
    if (!res.ok) return { status: "error" };
    return { status: "ok", objects: await res.json() };
  } catch {
    return { status: "error" };
  }
}

export default async function WikiPage() {
  const result = await getScpObjects();
  const scpObjects = result.status === "ok" ? result.objects : [];

  const keter = scpObjects.filter((s) => s.class === "Keter").length;
  const stats = [
    { label: "Dossiers", value: scpObjects.length, color: "#e6eaf0" },
    { label: "Classe Keter", value: keter, color: classHex.Keter },
  ].filter((s) => s.value > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="label-mono mb-3 flex items-center gap-2 text-redlake-glow">
            <span className="h-px w-8 bg-redlake-glow" aria-hidden />
            Base de données des anomalies
          </p>
          <h1 className="font-display text-5xl font-extrabold text-white">Wiki SCP</h1>
          <p className="mt-4 text-gray-400">
            Objets, entités et phénomènes confinés. Chaque fiche contient l&apos;historique, les
            protocoles, les journaux d&apos;incidents et les addendums.
          </p>
        </div>
        {stats.length > 0 && (
          <dl className="flex gap-8">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse border-l-2 pl-4" style={{ borderColor: s.color }}>
                <dt className="label-mono mt-1 text-[10px] text-gray-400">{s.label}</dt>
                <dd className="font-display text-5xl font-extrabold leading-none tabular-nums text-white">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <RecentlyViewed />

      {result.status === "error" ? (
        <div className="hologram-border p-8 text-center text-red-300">
          Le service est momentanément indisponible (il peut mettre jusqu&apos;à une minute à se
          réveiller après une période d&apos;inactivité). Rechargez la page dans quelques instants.
        </div>
      ) : scpObjects.length === 0 ? (
        <div className="hologram-border p-8 text-center text-gray-400">
          Aucun objet disponible pour le moment.
        </div>
      ) : (
        <WikiCatalog scpObjects={scpObjects} />
      )}
    </div>
  );
}
