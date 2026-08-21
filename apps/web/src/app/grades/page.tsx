import { API_URL } from "@/lib/api";
import { GradesCatalog } from "@/components/grades/GradesCatalog";
import type { ApiGrade } from "@/lib/grade-labels";

export const metadata = { title: "Catalogue des grades — Site-12" };

async function getGrades(): Promise<ApiGrade[]> {
  try {
    const res = await fetch(`${API_URL}/grades`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function GradesPage() {
  const grades = await getGrades();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          ORGANIGRAMME COMPLET
        </p>
        <h1 className="text-4xl font-bold text-white">Catalogue des grades</h1>
        <p className="mt-4 text-gray-500">
          {grades.length > 0
            ? `${grades.length} grades référencés sur Site-12`
            : "Organigramme"}{" "}
          — hiérarchie, habilitation, rémunération hebdomadaire et zones
          d&apos;accès pour chaque poste.
        </p>
      </div>

      {grades.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          <p>Catalogue indisponible pour le moment. Réessayez plus tard.</p>
        </div>
      ) : (
        <GradesCatalog grades={grades} />
      )}
    </div>
  );
}
