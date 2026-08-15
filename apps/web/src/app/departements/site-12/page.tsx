import Link from "next/link";
import { accessZones, site12Departments, site12Meta } from "@/data/site12";
import { API_URL } from "@/lib/api";

export const metadata = { title: "Site-12 — Organigramme" };

interface ApiGrade {
  id: string;
  name: string;
  pay: number | null;
  quota: number | null;
  objectives: string[];
}

interface ApiTeam {
  id: string;
  name: string;
  category: string;
  composition: string[];
  customizableBy: string | null;
}

interface ApiDepartmentFull {
  id: string;
  slug: string;
  name: string;
  omegaTier: string | null;
  directorGradeName: string | null;
  color: string | null;
  utilities: string[];
  leadership: string[];
  grades: ApiGrade[];
  teams: ApiTeam[];
}

interface ApiDepartmentListItem {
  id: string;
  slug: string;
}

async function getDepartments(): Promise<ApiDepartmentFull[]> {
  try {
    const listRes = await fetch(`${API_URL}/departments`, { next: { revalidate: 60 } });
    if (!listRes.ok) return [];
    const list: ApiDepartmentListItem[] = await listRes.json();

    const full = await Promise.all(
      list.map(async (d) => {
        const res = await fetch(`${API_URL}/departments/${d.slug}`, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        return res.json() as Promise<ApiDepartmentFull>;
      }),
    );
    return full.filter((d): d is ApiDepartmentFull => d !== null);
  } catch {
    return [];
  }
}

async function getOmegaCouncil(): Promise<ApiGrade[]> {
  try {
    const res = await fetch(`${API_URL}/grades?branch=omega`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const grades: ApiGrade[] = await res.json();
    return grades.sort((a, b) => (b.pay ?? 0) - (a.pay ?? 0));
  } catch {
    return [];
  }
}

export default async function Site12Page() {
  const [departments, omegaCouncil] = await Promise.all([getDepartments(), getOmegaCouncil()]);

  // Chambres/expériences (Recherche uniquement) : gabarits SCP pas encore
  // modélisés en base — voir docs/REDLAKES-CORE-SPEC.md Lot 17.
  const staticBySlug = new Map(site12Departments.map((d) => [d.id, d]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          BRANCHE PRINCIPALE REDLAKES
        </p>
        <h1 className="text-4xl font-bold text-white">Site-12</h1>
        <p className="mt-4 max-w-3xl text-gray-500">
          Organigramme complet : Conseil Oméga, {departments.length} départements, grades, équipes,
          chambres et matrice d&apos;accès. Source : archives internes Site-12.
        </p>
      </div>

      <div className="mb-10 rounded border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 text-sm text-yellow-300">
        <p className="font-bold">Noms personnalisables in-game</p>
        <p className="mt-2 text-yellow-300/80">{site12Meta.note}</p>
      </div>

      {/* Conseil Oméga */}
      <section className="mb-12 hologram-border rounded-lg p-6">
        <h2 className="mb-2 text-2xl font-bold text-redlake-glow">Conseil Oméga</h2>
        <p className="mb-6 text-sm text-gray-600">
          Budget salarial hebdomadaire total :{" "}
          <span className="font-mono text-white">
            {site12Meta.totalWeeklyPayroll.toLocaleString("fr-FR")} $
          </span>
        </p>
        <div className="mb-8 space-y-3">
          {omegaCouncil.map((role) => (
            <div
              key={role.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded border border-metal/50 p-4"
            >
              <div>
                <p className="font-bold text-white">{role.name}</p>
                {role.objectives.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">{role.objectives.join(" • ")}</p>
                )}
              </div>
              <p className="font-mono text-sm text-gray-500">
                <span className="text-white">
                  {role.pay != null ? `${role.pay.toLocaleString("fr-FR")} $` : "—"}
                </span>
                {" / "}Quota : {role.quota ?? "—"}
              </p>
            </div>
          ))}
        </div>

        <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-gray-500">
          Branches Oméga O2 → O5
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {departments.map((d) => (
            <div
              key={d.id}
              className="rounded border border-metal/50 p-4"
              style={{ borderLeftColor: d.color ?? undefined, borderLeftWidth: 3 }}
            >
              <p className="font-mono text-xs text-redlake-glow">{d.omegaTier ?? "—"}</p>
              <p className="font-bold text-white">{d.directorGradeName ?? d.name}</p>
              <p className="mt-2 text-xs text-gray-500">{d.utilities.join(" • ")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Départements détaillés */}
      {departments.map((dept) => {
        const staticExtras = staticBySlug.get(dept.slug);
        return (
          <section key={dept.id} className="mb-12 hologram-border rounded-lg p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-gray-600">Oméga {dept.omegaTier ?? "—"}</p>
                <h2 className="text-2xl font-bold text-white">{dept.name}</h2>
                <p className="text-sm text-gray-500">{dept.directorGradeName ?? "Non assigné"}</p>
              </div>
              <Link
                href={`/departements/${dept.slug}`}
                className="font-mono text-xs text-redlake-glow hover:underline"
              >
                Voir la fiche →
              </Link>
            </div>

            {dept.leadership.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-gray-600">
                  Direction & postes clés
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dept.leadership.map((role) => (
                    <span
                      key={role}
                      className="rounded border border-metal/50 px-3 py-1 text-xs text-gray-400"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {dept.grades.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-gray-600">
                  Grades & salaires
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-metal/50 font-mono text-xs text-gray-600">
                        <th className="pb-2 pr-4">Grade</th>
                        <th className="pb-2 pr-4">Paye/sem.</th>
                        <th className="pb-2">Quota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dept.grades.map((g) => (
                        <tr key={g.id} className="border-b border-metal/20">
                          <td className="py-2 pr-4 text-white">{g.name}</td>
                          <td className="py-2 pr-4 font-mono text-gray-400">
                            {g.pay != null ? `${g.pay.toLocaleString("fr-FR")} $` : "—"}
                          </td>
                          <td className="py-2 font-mono text-gray-500">{g.quota ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {dept.teams.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-1 font-mono text-xs uppercase tracking-widest text-gray-600">
                  Équipes <span className="text-yellow-500">(noms exemples)</span>
                </h3>
                <p className="mb-3 text-xs text-gray-600">
                  Chaque équipe peut être renommée par les hauts gradés indiqués.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dept.teams.map((team) => (
                    <div key={team.id} className="rounded border border-metal/40 p-4">
                      <p className="font-mono text-xs text-gray-600">{team.category}</p>
                      <p className="font-bold text-white">
                        {team.name}
                        <span className="ml-2 text-xs font-normal text-yellow-500/80">ex.</span>
                      </p>
                      <p className="mt-2 text-xs text-gray-500">{team.composition.join(" • ")}</p>
                      {team.customizableBy && (
                        <p className="mt-2 font-mono text-[10px] text-gray-600">
                          Renommable par : {team.customizableBy}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {staticExtras?.chambers && staticExtras.chambers.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-1 font-mono text-xs uppercase tracking-widest text-gray-600">
                  Chambres de détention <span className="text-yellow-500">(emplacements)</span>
                </h3>
                <p className="mb-3 text-xs text-gray-600">
                  32 emplacements — le nom du SCP assigné est choisi in-game.
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
                      <p className="mt-1 font-mono text-[9px] text-gray-500">SCP : …</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {staticExtras?.experiences && staticExtras.experiences.length > 0 && (
              <div>
                <h3 className="mb-1 font-mono text-xs uppercase tracking-widest text-gray-600">
                  Expériences <span className="text-yellow-500">(noms exemples)</span>
                </h3>
                <p className="mb-3 text-xs text-gray-600">
                  Le superviseur renomme l&apos;expérience avec le SCP concerné.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {staticExtras.experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className={`rounded border p-4 ${
                        exp.scpClass === "Keter"
                          ? "border-red-500/40"
                          : exp.scpClass === "Euclid"
                            ? "border-orange-500/40"
                            : "border-green-500/40"
                      }`}
                    >
                      <p className="font-mono text-xs text-gray-500">{exp.scpClass}</p>
                      <p className="font-bold text-white">
                        {exp.exampleName}
                        <span className="ml-1 text-xs font-normal text-yellow-500/80">ex.</span>
                      </p>
                      <p className="mt-2 text-xs text-gray-500">{exp.composition.join(" • ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}

      {/* Matrice d'accès */}
      <section className="hologram-border rounded-lg p-6">
        <h2 className="mb-2 text-2xl font-bold text-white">Matrice d&apos;accès</h2>
        <p className="mb-6 text-sm text-gray-500">
          Chaque grade possède des droits Inspecteur sur certaines zones. La
          grille complète est gérée in-game — voici les zones référencées.
        </p>
        <div className="flex flex-wrap gap-2">
          {accessZones.map((z) => (
            <span
              key={z.id}
              title={z.description}
              className="rounded border border-metal/50 px-3 py-1 font-mono text-xs text-gray-400"
            >
              {z.label}
            </span>
          ))}
        </div>
        <p className="mt-6 font-mono text-xs text-gray-600">
          {departments.reduce((sum, d) => sum + d.grades.length, 0)} grades référencés • Oméga et Directeur du Site : accès maximal
        </p>
      </section>
    </div>
  );
}
