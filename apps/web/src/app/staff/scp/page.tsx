"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Plus, FlaskConical } from "lucide-react";

interface StaffScpObject {
  id: string;
  slug: string;
  number: string;
  name: string;
  class: string;
  threatLevel: number;
}

const CLASS_COLORS: Record<string, string> = {
  Safe: "text-green-400",
  Euclid: "text-yellow-400",
  Keter: "text-red-400",
  Thaumiel: "text-purple-400",
  Apollyon: "text-orange-400",
};

export default function StaffScpPage() {
  const [objects, setObjects] = useState<StaffScpObject[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<StaffScpObject[]>("/scp/cms")
      .then(setObjects)
      .catch(() => setError("Impossible de charger le wiki — API indisponible."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            GESTION DU WIKI SCP — STAFF
          </p>
          <h1 className="text-4xl font-bold text-white">Objets SCP</h1>
          <p className="mt-4 text-gray-500">
            Créez, modifiez et supprimez les fiches d&apos;objets du wiki.
          </p>
        </div>
        <Link
          href="/staff/scp/nouveau"
          className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30"
        >
          <Plus className="h-4 w-4" /> Nouvel objet
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && !error && objects.length === 0 && (
        <p className="text-gray-500">Aucun objet dans le wiki.</p>
      )}

      <div className="space-y-3">
        {objects.map((scp) => (
          <Link
            key={scp.id}
            href={`/staff/scp/${scp.id}`}
            className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
          >
            <div className="flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-redlake-glow" />
              <div>
                <h3 className="font-bold text-white">{scp.number} — {scp.name}</h3>
                <p className="font-mono text-xs text-gray-600">/{scp.slug}</p>
              </div>
            </div>
            <span className={`font-mono text-xs ${CLASS_COLORS[scp.class] ?? "text-gray-500"}`}>
              {scp.class} — Niv. {scp.threatLevel}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
