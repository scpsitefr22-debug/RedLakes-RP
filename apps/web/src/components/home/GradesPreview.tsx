import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { API_URL } from "@/lib/api";
import type { ApiGrade } from "@/lib/grade-labels";

/**
 * Aperçu du Conseil Oméga sur la page d'accueil, tiré du catalogue de
 * grades CORE. Invisible si l'API n'est pas démarrée (pas de section vide).
 */
async function getOmegaCouncil(): Promise<ApiGrade[]> {
  try {
    const res = await fetch(`${API_URL}/grades?branch=omega`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const grades: ApiGrade[] = await res.json();
    return grades.sort((a, b) => (b.pay ?? 0) - (a.pay ?? 0));
  } catch {
    return [];
  }
}

export async function GradesPreview() {
  const omega = await getOmegaCouncil();
  if (omega.length === 0) return null;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            HIÉRARCHIE SITE-12
          </p>
          <h2 className="text-3xl font-bold text-white">Conseil Oméga</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            Cinq sièges gouvernent le Site-12 dans l&apos;ombre. Grades, clearance,
            rémunération — l&apos;organigramme complet est consultable en direct.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {omega.map((grade) => (
            <Link
              key={grade.id}
              href={`/grades/${grade.slug}`}
              className="group block h-full hologram-border rounded-lg p-5 text-center transition-all hover:border-redlake/50"
            >
              <ShieldCheck className="mx-auto mb-3 h-5 w-5 text-redlake-glow" />
              <h3 className="font-bold text-white group-hover:text-redlake-glow">
                {grade.name}
              </h3>
              {grade.pay != null && (
                <p className="mt-2 font-mono text-xs text-gray-500">
                  {grade.pay.toLocaleString("fr-FR")} $/sem.
                </p>
              )}
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/grades"
            className="inline-flex items-center gap-2 rounded border border-redlake/40 bg-redlake/10 px-5 py-2.5 text-sm font-mono uppercase tracking-wider text-redlake-glow transition-colors hover:border-redlake hover:bg-redlake/20"
          >
            Voir l&apos;organigramme complet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
