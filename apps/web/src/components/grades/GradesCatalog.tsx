"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BRANCH_LABELS, BRANCH_ORDER, type ApiGrade } from "@/lib/grade-labels";

export function GradesCatalog({ grades }: { grades: ApiGrade[] }) {
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState<string>("all");

  const branches = useMemo(() => {
    const present = new Set(grades.map((g) => g.branch));
    return BRANCH_ORDER.filter((b) => present.has(b));
  }, [grades]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return grades.filter((g) => {
      if (branch !== "all" && g.branch !== branch) return false;
      if (q && !g.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [grades, search, branch]);

  const grouped = useMemo(() => {
    const map = new Map<string, ApiGrade[]>();
    for (const g of filtered) {
      const list = map.get(g.branch) ?? [];
      list.push(g);
      map.set(g.branch, list);
    }
    return map;
  }, [filtered]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un grade..."
            className="w-full rounded border border-metal bg-black py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-redlake"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setBranch("all")}
            className={`rounded border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
              branch === "all"
                ? "border-redlake bg-redlake/10 text-redlake-glow"
                : "border-metal text-gray-500 hover:border-redlake/40"
            }`}
          >
            Tous ({grades.length})
          </button>
          {branches.map((b) => (
            <button
              type="button"
              key={b}
              onClick={() => setBranch(b)}
              className={`rounded border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                branch === b
                  ? "border-redlake bg-redlake/10 text-redlake-glow"
                  : "border-metal text-gray-500 hover:border-redlake/40"
              }`}
            >
              {BRANCH_LABELS[b] ?? b}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          <p>Aucun grade ne correspond à cette recherche.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {BRANCH_ORDER.filter((b) => grouped.has(b)).map((b) => (
            <section key={b}>
              <h2 className="mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-redlake-glow">
                {BRANCH_LABELS[b] ?? b}
                <span className="text-gray-600">({grouped.get(b)!.length})</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grouped.get(b)!.map((grade) => (
                  <Link
                    key={grade.id}
                    href={`/grades/${grade.slug}`}
                    className="hologram-border block rounded-lg p-4 transition-colors hover:border-redlake/40"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white">{grade.name}</h3>
                      <Badge variant="classified">Niv. {grade.clearance}</Badge>
                    </div>
                    {grade.departmentRef && (
                      <p className="mb-1 text-xs text-gray-500">
                        {grade.departmentRef.name}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-gray-600">
                      {grade.pay != null && (
                        <span>{grade.pay.toLocaleString("fr-FR")} $/sem.</span>
                      )}
                      {grade.quota != null && <span>Quota : {grade.quota}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
