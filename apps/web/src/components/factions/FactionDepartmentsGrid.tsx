import { Building2 } from "lucide-react";
import type { ApiDepartment } from "@/lib/faction-api";

interface Props {
  departments: ApiDepartment[];
}

/** N'est rendu par la page que si `departments.length > 0` — pas de section vide. */
export function FactionDepartmentsGrid({ departments }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {departments.map((dept) => (
        <article
          key={dept.id}
          className="faction-card p-5"
          style={dept.color ? { borderLeftColor: dept.color, borderLeftWidth: 3 } : undefined}
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-bold text-white">{dept.name}</h3>
            <Building2 className="h-4 w-4 shrink-0" style={{ color: dept.color ?? undefined }} />
          </div>

          {dept.directorGradeName && (
            <p className="mb-3 text-sm text-gray-500">
              Direction : <span className="text-gray-400">{dept.directorGradeName}</span>
              {dept.omegaTier && <span className="text-gray-600"> · {dept.omegaTier}</span>}
            </p>
          )}

          {dept.utilities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dept.utilities.map((u) => (
                <span
                  key={u}
                  className="rounded bg-metal/30 px-2 py-0.5 font-mono text-[10px] text-gray-400"
                >
                  {u}
                </span>
              ))}
            </div>
          )}

          {dept.objectives.length > 0 && (
            <ul className="mt-3 space-y-1">
              {dept.objectives.map((o) => (
                <li key={o} className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="faction-accent">▸</span> {o}
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
