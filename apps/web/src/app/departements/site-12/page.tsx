import Link from "next/link";
import {
  accessZones,
  allGrades,
  omegaBranches,
  omegaCouncil,
  site12Departments,
  site12Meta,
} from "@/data/site12";

export const metadata = { title: "Site-12 — Organigramme" };

export default function Site12Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          BRANCHE PRINCIPALE REDLAKES
        </p>
        <h1 className="text-4xl font-bold text-white">Site-12</h1>
        <p className="mt-4 max-w-3xl text-gray-500">
          Organigramme complet : Conseil Oméga, 4 départements, grades, équipes,
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
              key={role.role}
              className="flex flex-wrap items-center justify-between gap-4 rounded border border-metal/50 p-4"
            >
              <div>
                <p className="font-bold text-white">{role.role}</p>
                {role.objectives && (
                  <p className="mt-1 text-xs text-gray-500">
                    {role.objectives.join(" • ")}
                  </p>
                )}
              </div>
              <p className="font-mono text-sm text-gray-500">
                <span className="text-white">{role.pay.toLocaleString("fr-FR")} $</span>
                {" / "}Quota : {role.quota}
              </p>
            </div>
          ))}
        </div>

        <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-gray-500">
          Branches Oméga O2 → O5
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {omegaBranches.map((b) => (
            <div
              key={b.omega}
              className="rounded border border-metal/50 p-4"
              style={{ borderLeftColor: site12Departments.find((d) => d.id === b.departmentId)?.color, borderLeftWidth: 3 }}
            >
              <p className="font-mono text-xs text-redlake-glow">{b.omega}</p>
              <p className="font-bold text-white">{b.director}</p>
              <p className="mt-2 text-xs text-gray-500">{b.utilities.join(" • ")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Départements détaillés */}
      {site12Departments.map((dept) => (
        <section key={dept.id} className="mb-12 hologram-border rounded-lg p-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-gray-600">Oméga {dept.omega}</p>
              <h2 className="text-2xl font-bold text-white">{dept.name}</h2>
              <p className="text-sm text-gray-500">{dept.director}</p>
            </div>
            <Link
              href={`/departements/${dept.id}`}
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
                      <tr key={g.name} className="border-b border-metal/20">
                        <td className="py-2 pr-4 text-white">{g.name}</td>
                        <td className="py-2 pr-4 font-mono text-gray-400">
                          {g.pay.toLocaleString("fr-FR")} $
                        </td>
                        <td className="py-2 font-mono text-gray-500">{g.quota}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {dept.teams && dept.teams.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-1 font-mono text-xs uppercase tracking-widest text-gray-600">
                Équipes <span className="text-yellow-500">(noms exemples)</span>
              </h3>
              <p className="mb-3 text-xs text-gray-600">
                Chaque équipe peut être renommée par les hauts gradés indiqués.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {dept.teams.map((team) => (
                  <div
                    key={team.id}
                    className="rounded border border-metal/40 p-4"
                  >
                    <p className="font-mono text-xs text-gray-600">{team.category}</p>
                    <p className="font-bold text-white">
                      {team.exampleName}
                      <span className="ml-2 text-xs font-normal text-yellow-500/80">
                        ex.
                      </span>
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {team.composition.join(" • ")}
                    </p>
                    <p className="mt-2 font-mono text-[10px] text-gray-600">
                      Renommable par : {team.customizableBy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dept.chambers && dept.chambers.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-1 font-mono text-xs uppercase tracking-widest text-gray-600">
                Chambres de détention <span className="text-yellow-500">(emplacements)</span>
              </h3>
              <p className="mb-3 text-xs text-gray-600">
                32 emplacements — le nom du SCP assigné est choisi in-game.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {dept.chambers.map((ch) => (
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

          {dept.experiences && dept.experiences.length > 0 && (
            <div>
              <h3 className="mb-1 font-mono text-xs uppercase tracking-widest text-gray-600">
                Expériences <span className="text-yellow-500">(noms exemples)</span>
              </h3>
              <p className="mb-3 text-xs text-gray-600">
                Le superviseur renomme l&apos;expérience avec le SCP concerné.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dept.experiences.map((exp) => (
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
                    <p className="mt-2 text-xs text-gray-500">
                      {exp.composition.join(" • ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ))}

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
          {allGrades.length} grades référencés • Oméga et Directeur du Site : accès maximal
        </p>
      </section>
    </div>
  );
}
