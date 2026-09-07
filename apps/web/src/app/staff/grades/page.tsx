"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Plus, Shield } from "lucide-react";
import { BRANCH_LABELS } from "@/lib/grade-labels";

interface StaffGrade {
  id: string;
  slug: string;
  name: string;
  branch: string;
  tier: string;
  clearanceLevel: number;
}

const CLEARANCE_COLORS: Record<number, string> = {
  1: "border-metal text-gray-500",
  2: "border-blue-400/40 text-blue-400",
  3: "border-yellow-400/40 text-yellow-400",
  4: "border-orange-400/40 text-orange-400",
  5: "border-redlake/60 text-redlake-glow",
};

export default function StaffGradesPage() {
  const [grades, setGrades] = useState<StaffGrade[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<StaffGrade[]>("/grades")
      .then(setGrades)
      .catch(() => setError("Impossible de charger les grades — API indisponible."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            GESTION DES GRADES — STAFF
          </p>
          <h1 className="text-4xl font-bold text-white">Grades</h1>
          <p className="mt-4 text-gray-500">
            Créez, modifiez et supprimez les grades du catalogue public.
          </p>
        </div>
        <Link
          href="/staff/grades/nouveau"
          className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30"
        >
          <Plus className="h-4 w-4" /> Nouveau grade
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && !error && grades.length === 0 && (
        <p className="text-gray-500">Aucun grade dans le catalogue.</p>
      )}

      <div className="space-y-3">
        {grades.map((grade) => (
          <Link
            key={grade.id}
            href={`/staff/grades/${grade.id}`}
            className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-redlake-glow" />
              <div>
                <h3 className="font-bold text-white">{grade.name}</h3>
                <p className="font-mono text-xs text-gray-600">
                  /{grade.slug} — {BRANCH_LABELS[grade.branch] ?? grade.branch} — {grade.tier}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded border px-2 py-1 font-mono text-[10px] uppercase ${CLEARANCE_COLORS[grade.clearanceLevel] ?? CLEARANCE_COLORS[1]}`}
              title="Niveau d'habilitation"
            >
              Hab. {grade.clearanceLevel}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
