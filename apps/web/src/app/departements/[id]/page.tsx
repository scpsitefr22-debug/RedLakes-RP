import { notFound } from "next/navigation";
import { API_URL } from "@/lib/api";
import { site12Departments } from "@/data/site12";

interface Props {
  params: Promise<{ id: string }>;
}

interface ApiGrade {
  id: string;
  name: string;
  pay: number | null;
  quota: number | null;
}

interface ApiTeam {
  id: string;
  name: string;
  category: string;
  composition: string[];
}

interface ApiDepartment {
  id: string;
  slug: string;
  name: string;
  omegaTier: string | null;
  directorGradeName: string | null;
  utilities: string[];
  grades: ApiGrade[];
  teams: ApiTeam[];
}

async function getDepartment(slug: string): Promise<ApiDepartment | null> {
  try {
    const res = await fetch(`${API_URL}/departments/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DepartmentDetailPage({ params }: Props) {
  const { id } = await params;
  const dept = await getDepartment(id);
  if (!dept) notFound();

  // Chambres/expériences : gabarits SCP propres au département Recherche,
  // pas encore modélisés en base (voir docs/REDLAKES-CORE-SPEC.md Lot 17).
  const staticExtras = site12Departments.find((d) => d.id === dept.slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="mb-2 font-mono text-xs text-gray-600">Oméga {dept.omegaTier ?? "—"}</p>
      <h1 className="mb-2 text-4xl font-bold text-white">{dept.name}</h1>
      <p className="mb-8 text-gray-500">Directeur : {dept.directorGradeName ?? "Non assigné"}</p>

      <div className="space-y-6">
        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Utilités</h2>
          <div className="flex flex-wrap gap-2">
            {dept.utilities.map((u) => (
              <span key={u} className="rounded border border-redlake/30 bg-redlake/10 px-3 py-1 text-sm text-gray-300">
                {u}
              </span>
            ))}
          </div>
        </section>

        {dept.teams.length > 0 && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-1 text-xl font-bold text-white">Équipes</h2>
            <p className="mb-4 text-xs text-yellow-500/80">
              Les noms d&apos;équipes sont des modèles. En jeu, les directeurs et
              commandants les renomment librement.
            </p>
            <div className="space-y-3">
              {dept.teams.map((t) => (
                <div key={t.id} className="rounded border border-metal/40 p-3">
                  <p className="font-bold text-white">
                    {t.name}
                    <span className="ml-2 text-xs font-normal text-yellow-500/80">ex.</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{t.composition.join(" • ")}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {dept.grades.length > 0 && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Hiérarchie & Effectifs</h2>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b border-metal text-left text-gray-600">
                    <th className="pb-3 pr-4">Grade</th>
                    <th className="pb-3 pr-4">Paye</th>
                    <th className="pb-3">Quota</th>
                  </tr>
                </thead>
                <tbody>
                  {dept.grades.map((g) => (
                    <tr key={g.id} className="border-b border-metal/30 text-gray-400">
                      <td className="py-3 pr-4 text-white">{g.name}</td>
                      <td className="py-3 pr-4">
                        {g.pay != null ? `${g.pay.toLocaleString("fr-FR")} $` : "—"}
                      </td>
                      <td className="py-3">{g.quota ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {staticExtras?.chambers && staticExtras.chambers.length > 0 && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-1 text-xl font-bold text-white">Chambres de détention</h2>
            <p className="mb-4 text-xs text-gray-600">
              Emplacements — le nom du SCP assigné est choisi in-game.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {staticExtras.chambers.map((ch) => (
                <div
                  key={ch.id}
                  className={`rounded border px-2 py-2 text-center text-xs ${
                    ch.classType === "S"
                      ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-300"
                      : ch.classType === "B"
                        ? "border-amber-600/40 bg-amber-600/10 text-amber-300"
                        : "border-orange-500/30 bg-orange-500/10 text-orange-300"
                  }`}
                >
                  <p className="font-mono text-[10px] opacity-70">Class-{ch.classType}</p>
                  <p className="truncate">{ch.exampleLabel}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {staticExtras?.experiences && staticExtras.experiences.length > 0 && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-1 text-xl font-bold text-white">Expériences</h2>
            <p className="mb-4 text-xs text-gray-600">
              Le superviseur renomme l&apos;expérience avec le SCP concerné.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {staticExtras.experiences.map((exp) => (
                <div key={exp.id} className="rounded border border-metal/40 p-4">
                  <p className="font-mono text-xs text-gray-500">{exp.scpClass}</p>
                  <p className="font-bold text-white">{exp.exampleName}</p>
                  <p className="mt-2 text-xs text-gray-500">{exp.composition.join(" • ")}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
