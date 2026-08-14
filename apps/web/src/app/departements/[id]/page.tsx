import { notFound } from "next/navigation";
import { site12Departments, site12Meta } from "@/data/site12";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return site12Departments.map((d) => ({ id: d.id }));
}

export default async function DepartmentDetailPage({ params }: Props) {
  const { id } = await params;
  const dept = site12Departments.find((d) => d.id === id);
  if (!dept) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="mb-2 font-mono text-xs text-gray-600">Oméga {dept.omega}</p>
      <h1 className="mb-2 text-4xl font-bold text-white">{dept.name}</h1>
      <p className="mb-8 text-gray-500">Directeur : {dept.director}</p>

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

        {dept.teams && dept.teams.length > 0 && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-1 text-xl font-bold text-white">Équipes</h2>
            <p className="mb-4 text-xs text-yellow-500/80">{site12Meta.note}</p>
            <div className="space-y-3">
              {dept.teams.map((t) => (
                <div key={t.id} className="rounded border border-metal/40 p-3">
                  <p className="font-bold text-white">
                    {t.exampleName}
                    <span className="ml-2 text-xs font-normal text-yellow-500/80">ex.</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{t.composition.join(" • ")}</p>
                </div>
              ))}
            </div>
          </section>
        )}

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
                  <tr key={g.name} className="border-b border-metal/30 text-gray-400">
                    <td className="py-3 pr-4 text-white">{g.name}</td>
                    <td className="py-3 pr-4">{g.pay.toLocaleString("fr-FR")} $</td>
                    <td className="py-3">{g.quota}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
