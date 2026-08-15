"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Plus, MapPin } from "lucide-react";

interface StaffMapLocation {
  id: string;
  slug: string;
  name: string;
  type: string;
  danger: number;
}

export default function StaffCartePage() {
  const [locations, setLocations] = useState<StaffMapLocation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<StaffMapLocation[]>("/map")
      .then(setLocations)
      .catch(() => setError("Impossible de charger la carte — API indisponible."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            GESTION DE LA CARTE — STAFF
          </p>
          <h1 className="text-4xl font-bold text-white">Carte</h1>
          <p className="mt-4 text-gray-500">
            Créez, modifiez et supprimez les emplacements de la carte interactive.
          </p>
        </div>
        <Link
          href="/staff/carte/nouveau"
          className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30"
        >
          <Plus className="h-4 w-4" /> Nouvel emplacement
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && !error && locations.length === 0 && (
        <p className="text-gray-500">Aucun emplacement enregistré.</p>
      )}

      <div className="space-y-3">
        {locations.map((loc) => (
          <Link
            key={loc.id}
            href={`/staff/carte/${loc.id}`}
            className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
          >
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-redlake-glow" />
              <div>
                <h3 className="font-bold text-white">{loc.name}</h3>
                <p className="font-mono text-xs text-gray-600">{loc.type}</p>
              </div>
            </div>
            <span className="font-mono text-xs text-gray-500">Danger {loc.danger}/5</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
