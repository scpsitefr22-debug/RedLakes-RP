import Link from "next/link";
import { Building2 } from "lucide-react";
import { API_URL } from "@/lib/api";

export const metadata = { title: "Départements" };

interface ApiDepartment {
  id: string;
  slug: string;
  name: string;
  directorGradeName: string | null;
  utilities: string[];
  objectives: string[];
  clearance: number;
  _count: { grades: number; teams: number };
}

async function getDepartments(): Promise<ApiDepartment[]> {
  try {
    const res = await fetch(`${API_URL}/departments`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DepartementsPage() {
  const departments = await getDepartments();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-12">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          STRUCTURE SITE-12
        </p>
        <h1 className="text-4xl font-bold text-white">Départements</h1>
        <p className="mt-4 max-w-2xl text-gray-500">
          Recherche, Sécurité, Médical, Ingénierie, Logistique et Renseignement —
          chaque département avec effectifs, hiérarchie et missions.
        </p>
      </div>

      <div className="mb-8">
        <Link
          href="/departements/site-12"
          className="inline-flex items-center gap-2 hologram-border rounded-lg px-6 py-4 transition-colors hover:border-redlake/40"
        >
          <Building2 className="h-5 w-5 text-redlake-glow" />
          <span className="font-bold text-white">Voir l&apos;organigramme complet Site-12</span>
        </Link>
      </div>

      {departments.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          Aucun département disponible pour le moment.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {departments.map((dept) => (
            <Link
              key={dept.id}
              href={`/departements/${dept.slug}`}
              className="group hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
            >
              <h2 className="mb-2 text-2xl font-bold text-white group-hover:text-redlake-glow">
                {dept.name}
              </h2>
              <p className="mb-3 text-sm text-gray-500">
                Directeur : {dept.directorGradeName ?? "Non assigné"}
              </p>
              <div className="flex flex-wrap gap-1">
                {(dept.objectives.length ? dept.objectives : dept.utilities).slice(0, 4).map((obj) => (
                  <span
                    key={obj}
                    className="rounded border border-metal/50 px-2 py-0.5 font-mono text-[10px] text-gray-500"
                  >
                    {obj}
                  </span>
                ))}
              </div>
              <p className="mt-3 font-mono text-xs text-gray-600">
                {dept._count.grades} grades • {dept._count.teams} équipes • Niv. {dept.clearance}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
