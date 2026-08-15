"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Plus, Building2 } from "lucide-react";

interface StaffDepartment {
  id: string;
  slug: string;
  name: string;
  faction: { id: string; name: string } | null;
}

export default function StaffDepartementsPage() {
  const [departments, setDepartments] = useState<StaffDepartment[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<StaffDepartment[]>("/departments")
      .then(setDepartments)
      .catch(() => setError("Impossible de charger les départements — API indisponible."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            GESTION DES DÉPARTEMENTS — STAFF
          </p>
          <h1 className="text-4xl font-bold text-white">Départements</h1>
          <p className="mt-4 text-gray-500">
            Créez, modifiez et supprimez les départements du catalogue public.
          </p>
        </div>
        <Link
          href="/staff/departements/nouveau"
          className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30"
        >
          <Plus className="h-4 w-4" /> Nouveau département
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && !error && departments.length === 0 && (
        <p className="text-gray-500">Aucun département dans le catalogue.</p>
      )}

      <div className="space-y-3">
        {departments.map((dept) => (
          <Link
            key={dept.id}
            href={`/staff/departements/${dept.id}`}
            className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
          >
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-redlake-glow" />
              <div>
                <h3 className="font-bold text-white">{dept.name}</h3>
                <p className="font-mono text-xs text-gray-600">/{dept.slug}</p>
              </div>
            </div>
            <span className="font-mono text-xs text-gray-500">{dept.faction?.name ?? "Sans faction"}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
